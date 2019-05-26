// tslint:disable:no-shadowed-variable

import { injectable, inject } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { Request } from 'express-request';

import termoTipo from '../../domain/entities/termoTipo';
import { rolesEnum } from '../../domain/services/auth/rolesEnum';
import { Sequelize } from 'sequelize-database';
import Auth from './Auth';
import { paramsEnum as accountParams } from '../../domain/services/account/paramsEnum';
import { typeEnum as tiposParticipante } from '../../domain/services/participante/typeEnum';

import { config } from '../../config';
import types from '../../constants/types';
import { Mailer } from '../mailer';
import * as chance from 'chance';
import * as Exceptions from '../../interfaces/rest/exceptions/ApiExceptions';
import { KeycloakUserRepresentation } from './AuthTypes';

@injectable()
class AuthDev implements Auth {
  generateToken(body: any) {
    throw new Exceptions.NotImplementedException();
  }
  private db: Sequelize;
  private mailer: Mailer;
  private emailTemplates: any;
  private settings = config.auth;

  private ec = {
    name: 'EC - It Lab',
    preferred_username: 'rorschach',
    given_name: 'Walter',
    family_name: 'Kovacs',
    email: 'ec@alpe.com.br',
    resource_access: {},
  };

  private fornecedor = {
    name: 'Fornecedor - KG Menswear',
    preferred_username: 'stone',
    given_name: 'Charles',
    family_name: 'Stone',
    email: 'fornecedor@alpe.com.br',
    resource_access: {},
  };

  private backoffice = {
    name: 'Alpe - BACKOFFICE',
    preferred_username: 'loord',
    given_name: 'Maxine',
    family_name: 'Key',
    email: 'alpe@alpe.com.br',
    resource_access: {},
  };

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.MailerFactory) mailer: () => Mailer,
  ) {
    this.db = db;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;

    this.ec.resource_access[this.settings.clientId] = { roles: [rolesEnum.ecFinanceiro] };
    this.fornecedor.resource_access[this.settings.clientId] = {
      roles: [rolesEnum.fcComercial],
    };

    this.backoffice.resource_access[this.settings.clientId] = {
      roles: [rolesEnum.boAdministrador, rolesEnum.super],
    };
  }

  isParticipante = (req: Request, ...tipos: tiposParticipante[]): boolean => {
    const ehEstabelecimento = req.user.participanteEstabelecimento;
    const ehFornecedor = req.user.participanteFornecedor;

    return tipos.some((tipo) => {
      if (tipo === tiposParticipante.estabelecimento && ehEstabelecimento) {
        return true;
      }
      if (tipo === tiposParticipante.fornecedor && ehFornecedor) {
        return true;
      }
      return false;
    });
  }

  requireParticipante = (...tipos: tiposParticipante[]) => (req: Request, res: Response, next: NextFunction): any => {
    const allowed = this.isParticipante(req, ...tipos);

    if (allowed) next();
    else throw new Exceptions.AccessDeniedException();
  }

  getUserRoles = (req: Request): rolesEnum[] => {
    return req.user.resource_access[this.settings.clientId].roles;
  }

  hasPermission = (req: Request, ...accessRoles: rolesEnum[]): boolean => {
    const userRoles = this.getUserRoles(req);

    const isSuper = userRoles.includes(rolesEnum.super);
    if (isSuper) {
      return true;
    }

    return userRoles.some(r => accessRoles.includes(r));
  }

  changeUserRoles = (userId, rolesToRemove, rolesToAdd) => {
    return Promise.resolve({});
  }

  require = (...roles) => (req: Request, res: Response, next: NextFunction) => {
    if (this.hasPermission(req, ...roles)) next();
    else throw new Exceptions.AccessDeniedException();
  }

  createUser = () => {
    const id = new chance().guid();
    return Promise.resolve(id);
  }

  updateUserData = () => Promise.resolve({});

  changeUserPassword = () => Promise.resolve({});

  recoverPassword = () => Promise.resolve({});

  authenticateAsAdmin() {
    return Promise.resolve('access_token');
  }

  get users() {
    return {
      'ec@alpe.com.br': {
        kcPayload: this.ec,
        sessionPayload: {
          participante: 1,
          participanteNome: 'It Lab',
          participanteEstabelecimento: true,
          participanteFornecedor: false,
        },
      },
      'fornecedor@alpe.com.br': {
        kcPayload: this.fornecedor,
        sessionPayload: {
          participante: 2,
          participanteNome: 'KG Menswear',
          participanteEstabelecimento: false,
          participanteFornecedor: true,
        },
      },
      'alpe@alpe.com.br': {
        kcPayload: this.backoffice,
        sessionPayload: {},
      },
    };
  }

  authenticate = (body) => {
    const action = new Promise((resolve, reject) => {
      const user = this.users[body.email];

      if (!user) {
        reject(String('user not found!!!!'));
        return;
      }

      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      this.db.entities.termo
        .findOne({
          where: {
            inicio: { $lte: today },
            fim: {
              $or: {
                $eq: null,
                $gt: now,
              },
            },
            tipo: user.sessionPayload.participanteEstabelecimento
              ? termoTipo.contratoMaeEstabelecimento
              : termoTipo.contratoMaeFornecedor,
          },
          include: [
            {
              model: this.db.entities.participanteAceiteTermo,
              as: 'aceites',
              where: {
                participanteId: user.sessionPayload.participante,
              },
            },
          ],
        })
        .then((termo) => {
          user.sessionPayload.acceptedTerms = !!termo;
          return user;
        })
        .then(() => {
          const sign = Promise.all([
            new Promise((resolve, reject) => {
              const action = jwt.sign(
                user.kcPayload,
                this.settings.publicKey,
                { expiresIn: '24h' },
                (error, token) => {
                  if (error) reject(error);
                  else resolve(token);
                },
              );
              return action;
            }),
            new Promise((resolve, reject) => {
              const action = jwt.sign(
                user.sessionPayload,
                this.settings.clientSecret,
                { expiresIn: '24h' },
                (error, token) => {
                  if (error) reject(error);
                  else resolve(token);
                },
              );
              return action;
            }),
          ]);

          return sign
            .then((tokens) => {
              resolve({
                accessToken: tokens[0],
                refreshToken: tokens[0],
                // sessionToken: tokens[1],
              });
            })
            .catch(error => reject(error));
        });
    });
    return action;
  }

  refreshToken = (refreshToken) => {
    const tokens = {
      refreshToken,
      accessToken: refreshToken,
    };
    return Promise.resolve(tokens);
  }

  getRolesIds = () => Promise.resolve();

  updateUserStatus = async (userId: string, userStatus: boolean): Promise<void> => {
    console.log('keycloak updateUserStatus', userId, userStatus);
  }

  generateSessionToken = (usuario, participante, impersonating) => {
    const getSessionToken = () => {
      const action = new Promise((resolve, reject) => {
        const user = this.users[usuario];

        if (!user) {
          reject(String('user not found!!!!'));
          return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
          const sign = jwt.sign(
            user.sessionPayload,
            this.settings.clientSecret,
            { expiresIn: '24h' },
            (error, token) => {
              if (error) reject(error);
              else resolve(token);
            },
          );
          return sign;
        })
          .then(token => resolve({ sessionToken: token }));
      });
      return action;
    };

    const generateSessionTokenDev = (emailUsuario, participante, impersonating) => {
      let promise = impersonating
        ? Promise.resolve(participante)
        : this.db.entities.usuario.findOne({
          where: { email: emailUsuario },
          include: [{
            model: this.db.entities.membro,
            as: 'associacoes',
            attributes: ['participanteId'],
          }],
        }).then((usuario) => {
          if (!usuario) throw new Exceptions.UserNotFoundException();

          const associacao = usuario.associacoes.find(
            a => a.participanteId === participante
          );

          return associacao && participante;
        });

      promise = (promise as Promise<any>).then(participanteId => (!participanteId
        ? Promise.resolve({})
        : Promise.all([
          this.db.entities.participante.findOne({
            where: { id: participanteId },
            attributes: ['nome'],
          }),
          this.db.entities.participanteEstabelecimento.count({
            where: { participanteId },
          }),
          this.db.entities.participanteFornecedor.count({
            where: { participanteId },
          }),
        ]).then(results => ({
          participante: participanteId,
          participanteNome: results[0].nome,
          participanteEstabelecimento: results[1] > 0,
          // tslint:disable-next-line:no-magic-numbers
          participanteFornecedor: results[2] > 0,
        }))));

      if (!impersonating) {
        promise = promise.then((result) => {
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          return this.db.entities.termo.findOne({
            where: {
              inicio: { $lte: today },
              fim: {
                $or: {
                  $eq: null,
                  $gt: now,
                },
              },
              tipo: result.participanteEstabelecimento
                ? termoTipo.contratoMaeEstabelecimento
                : termoTipo.contratoMaeFornecedor,
            },
            include: [{
              model: this.db.entities.participanteAceiteTermo,
              as: 'aceites',
              where: {
                participanteId: result.participante,
              },
            }],
          }).then((termo) => {
            result.acceptedTerms = !!termo;

            return result;
          });
        });
      }

      return promise.then(payload => new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          this.settings.clientSecret,
          { expiresIn: '24h' },
          (error, token) => {
            if (error) reject(error);
            else resolve({ sessionToken: token });
          }
        );
      }));
    };

    return impersonating
      ? generateSessionTokenDev(usuario, participante, impersonating)
      : getSessionToken();
  }

  inviteUser = (convite, transaction) => {
    const findUser = () => this.db.entities.usuario.findOne({
      where: { email: convite.email },
      include: [{
        model: this.db.entities.membro,
        as: 'associacoes',
      }],
    });

    const checaUsuarioMembro = (usuario) => {
      if (!usuario) return true;

      if (usuario.associacoes && usuario.associacoes.some(
        a => a.participanteId === convite.participante
      )) {
        throw new Exceptions.UserIsAlreadyAMemberException();
      }

      usuario.roles.push(...convite.roles);

      return Promise.all([
        usuario.update(
          { roles: usuario.roles },
          { transaction }),
        this.db.entities.membro.create(
          {
            usuarioId: usuario.id,
            participanteId: convite.participante,
          },
          { transaction }
        ),
        this.changeUserRoles(usuario.id, [], convite.roles),
      ])
        .then(() => false);
    };

    const enviaConvite = (invite) => {
      if (!invite) return null;

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate()
        + accountParams.prazoExpiracaoConviteEmDias);

      convite.expiraEm = dataExpiracao;

      return this.db.entities.usuarioConvite
        .create(convite, { transaction })
        .then(novoConvite => this.mailer.enviar(
          {
            templateName: this.emailTemplates.DEFINIR_SENHA,
            destinatary: novoConvite.email,
            substitutions: {
              loginAcesso: novoConvite.email,
              linkRedefinirSenha: `${this.settings.baseUrl}/registrar/`
                + `${novoConvite.email}/${novoConvite.codigo}`,
            },
          }));
    };

    return findUser()
      .then(checaUsuarioMembro)
      .then(enviaConvite);
  }

  getUser = async (userId: string): Promise<KeycloakUserRepresentation> => {
    return <KeycloakUserRepresentation>{
      id: userId,
      enabled: true
    };
  }

  putUser = async (user: KeycloakUserRepresentation): Promise<void> => {
    console.log('putUser:', user);
  }
}

export default AuthDev;
