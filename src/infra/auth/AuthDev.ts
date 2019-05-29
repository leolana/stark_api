import { injectable, inject } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { Request } from 'express-request';
import * as chance from 'chance';

import { rolesEnum } from '../../domain/services/auth/rolesEnum';
import Auth from './Auth';
import paramsEnum from '../../domain/services/account/paramsEnum';
import { typeEnum as tiposParticipante } from '../../domain/services/participante/typeEnum';
import { Environment, AuthEnv } from '../environment/Environment';
import * as Exceptions from '../../interfaces/rest/exceptions/ApiExceptions';
import { Mailer } from '../mailer';
import { KeycloakUserRepresentation } from './AuthTypes';

import types from '../../constants/types';
import { Usuario, Membro, UsuarioConvite } from '../database';

@injectable()
class AuthDev implements Auth {
  private mailer: Mailer;
  private emailTemplates: any;
  private settings: AuthEnv;

  private ec = {
    name: 'EC - It Lab',
    preferred_username: '0b6c801e-a330-48dc-9ccd-53998624ded3',
    given_name: 'Walter',
    family_name: 'Kovacs',
    email: 'ec@alpe.com.br',
    resource_access: {},
  };

  private fornecedor = {
    name: 'Fornecedor - KG Menswear',
    preferred_username: '5af6002e-1e1d-41f1-92a2-df41b266e0f4',
    given_name: 'Charles',
    family_name: 'Stone',
    email: 'fornecedor@alpe.com.br',
    resource_access: {},
  };

  private backoffice = {
    name: 'Alpe - BACKOFFICE',
    preferred_username: '8a799af7-22f9-417d-9602-c49c80ce5a23',
    given_name: 'Maxine',
    family_name: 'Key',
    email: 'alpe@alpe.com.br',
    resource_access: {},
  };

  addRoleKc: (email: any, roles: any, pwd: any) => {};

  private retorno = (user, resolve, reject) => {
    jwt.sign(
      user.sessionPayload,
      this.settings.clientSecret,
      { expiresIn: '24h' },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      },
    );
  }

  constructor(
    @inject(types.Environment) config: Environment,
    @inject(types.MailerFactory) mailer: () => Mailer,
  ) {
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.settings = config.auth;

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
    return [];
  }

  hasPermission = (req: Request, ...accessRoles: rolesEnum[]): boolean => {
    return true;
  }

  changeUserRoles = async (userId, rolesToRemove, rolesToAdd) => {
    return {};
  }

  require = (...roles) => (req: Request, res: Response, next: NextFunction) => {
    if (this.hasPermission(req, ...roles)) next();
    else throw new Exceptions.AccessDeniedException();
  }

  createUser = () => {
    const id = new chance().guid();
    return Promise.resolve(id);
  }

  recreateUser = (user) => {
    const id = new chance().guid();
    console.log(`Usuário  ${user.email} "${user.id}" recriado e atualizado no banco para ${id}`);
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
          acceptedTerms: null
        },
      },
      'fornecedor@alpe.com.br': {
        kcPayload: this.fornecedor,
        sessionPayload: {
          participante: 2,
          participanteNome: 'KG Menswear',
          participanteEstabelecimento: false,
          participanteFornecedor: true,
          acceptedTerms: null
        },
      },
      'alpe@alpe.com.br': {
        kcPayload: this.backoffice,
        sessionPayload: {
          participante: 0,
          participanteNome: '',
          participanteEstabelecimento: false,
          participanteFornecedor: false,
          acceptedTerms: null
        },
      },
    };
  }

  authenticate = async (userUuid: string, pass: string) => {
    const user = Object.values(this.users).find(u => u.kcPayload.preferred_username === userUuid);

    if (!user) {
      throw new Exceptions.UserNotFoundException();
    }

    // todo: ver se os termos estão aceitos
    user.sessionPayload.acceptedTerms = true;

    const tokens = await <Promise<[string, string]>>Promise.all([
      new Promise((resolve, reject) => {
        jwt.sign(
          user.kcPayload,
          this.settings.publicKey,
          { expiresIn: '24h' },
          (error, token) => {
            if (error) reject(error);
            else resolve(token);
          },
        );
      }),
      new Promise((resolve, reject) => {
        this.retorno(user, resolve, reject);
      })
    ]);

    return {
      accessToken: tokens[0],
      refreshToken: tokens[1]
    };
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

  generateSessionToken = async (userUuid: string, participante: number, impersonating: boolean) => {
    const getSessionToken = async () => {
      const user = Object.values(this.users).find(u => u.kcPayload.preferred_username === userUuid);

      if (!user) {
        throw new Exceptions.UserNotFoundException();
      }

      const token = await new Promise((resolve, reject) => {
        this.retorno(user, resolve, reject);
      });

      return (token);
    };

    const generateSessionTokenDev = async () => {
      const payload = {
        participante,
        participanteNome: '',
        participanteEstabelecimento: false,
        participanteFornecedor: false,
      };

      return await new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          this.settings.clientSecret,
          { expiresIn: '24h' },
          (error, token) => {
            if (error) reject(error);
            else resolve(token);
          }
        );
      });
    };

    let sessionToken: any;

    if (impersonating) {
      sessionToken = await generateSessionTokenDev();
    } else {
      sessionToken = await getSessionToken();
    }

    return {
      sessionToken
    };
  }

  inviteUser = (convite, transaction) => {
    const findUser = () => Usuario.findOne({
      where: {
        email: convite.email
      },
      include: [
        {
          model: Membro,
          as: 'associacoes'
        }
      ]
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
          { transaction }
        ),
        Membro.create(
          {
            usuarioId: usuario.id,
            participanteId: convite.participante,
          },
          { transaction }
        ),
        this.changeUserRoles(usuario.id, [], convite.roles)
      ])
        .then(() => false);
    };

    const enviaConvite = (invite) => {
      if (!invite) return null;

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate()
        + paramsEnum.prazoExpiracaoConviteEmDias);

      convite.expiraEm = dataExpiracao;

      return UsuarioConvite
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

  getUserByUuid = async (userId: string): Promise<KeycloakUserRepresentation> => {
    return <KeycloakUserRepresentation>{
      id: userId,
      enabled: true
    };
  }

  getUserByEmail = async (userEmail: string): Promise<KeycloakUserRepresentation> => {
    return <KeycloakUserRepresentation>{
      email: userEmail,
      enabled: true
    };
  }

  getInfoUser = async (userId: string): Promise<KeycloakUserRepresentation> => {
    return await Usuario.findByPk(userId);
  }

  putUser = async (user: KeycloakUserRepresentation): Promise<void> => {
    console.log('putUser:', user);
  }
}

export default AuthDev;
