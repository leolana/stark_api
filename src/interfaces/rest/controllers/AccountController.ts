import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { LoggerInterface } from '../../../infra/logging';
import { Mailer } from '../../../infra/mailer';
import { getAccountUseCases, AccountUseCases } from '../../../domain/usecases/account';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import { Environment } from '../../../infra/environment/Environment';

import types from '../../../constants/types';
import * as Exceptions from '../exceptions/ApiExceptions';

@injectable()
class AccountController implements Controller {
  auth: Auth;
  mailer: Mailer;
  accountUseCases: AccountUseCases;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.Environment) private config: Environment,
    @inject(types.Logger) private logger: LoggerInterface,

    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer
  ) {
    this.auth = auth();
    this.mailer = mailer();

    this.accountUseCases = getAccountUseCases(
      this.db,
      this.mailer,
      this.mailer.emailTemplates,
      this.config.mailer,
      this.auth,
      this.logger
    );
  }

  get router(): Router {
    const router = Router();

    router.post('/signin', this.signin);
    router.post('/memberships', this.memberships);
    router.post('/initiate-gateway', this.initiateSessionGateway);
    router.post('/initiate-session', this.initiateSession);
    router.post('/refresh-token', this.refresh);
    router.post('/change-password', this.changePassword);
    router.post('/recover-password', this.recoverPassword);
    router.post('/reset-password', this.resetPassword);
    router.post(
      '/impersonate',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.impersonate,
    );
    router.post('/check-memberships', this.checkMemberships);
    router.post('/create-membership', this.createMembership);

    return router;
  }

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        documento,
        password
      } = req.body;

      const tokens = await this.accountUseCases.signin(
        email,
        documento,
        password
      );

      res.send(tokens);

    } catch (error) {
      next(error);
    }
  }

  memberships = async (req: Request, res: Response, next: NextFunction) => {
    let email = null;

    try {
      email = req.body.email;

      const usuario = await this.db.entities.usuario.findOne({
        where: { email },
        include: [
          {
            model: this.db.entities.membro,
            as: 'associacoes',
            include: [
              {
                model: this.db.entities.participante,
                as: 'participante',
                attributes: ['id', 'nome']
              }
            ]
          }
        ]
      });

      const associacoes = usuario ? usuario.associacoes : [];
      const participantes = (associacoes || []).map((membro: any) => membro.participante.dataValues);
      res.send(participantes);

    } catch (error) {
      this.logger.info(`Não foi possível buscar os memberships do usuário "${email}".`);
      next(error);
    }
  }

  checkMemberships = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { emails } = req.body;

      const participantes = await this.accountUseCases.checkMembershipsUseCase(
        emails
      );

      res.send(participantes);

    } catch (error) {
      this.logger.info('Não foi possível trazer os memberships dos emails');
      next(error);
    }
  }

  createMembership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { participanteId, usuarioId, role } = req.body;

      await this.accountUseCases.createMembershipUseCase(
        participanteId,
        usuarioId,
        role
      );

      res.end();
    } catch (error) {
      next(error);
    }
  }

  initiateSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userUuid = req.user.id || req.user.preferred_username;
      const idParticipante = +req.body.participanteId;

      const tokens = await this.auth.generateSessionToken(
        userUuid,
        idParticipante,
        false
      );

      const userEmail = req.user.email;
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      this.logger.info(`Usuário ${userEmail} iniciou uma sessão com o participante ${idParticipante} sob o IP: ${ip}`);

      res.send(tokens);

    } catch (error) {
      next(error);
    }
  }

  initiateSessionGateway = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const participante = await this.db.entities.participante.findOne({
        where: {
          documento: req.body.cnpjFornecedor
        }
      });

      if (!participante) {
        throw new Exceptions.ProviderNotFoundException();
      }

      const userEmail = req.user.email;
      const idParticipante = +participante.id;

      const tokens = await this.auth.generateSessionToken(
        userEmail,
        idParticipante,
        true
      );

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      this.logger.info(`Usuário ${userEmail} iniciou uma sessão com o participante ${idParticipante} sob o IP: ${ip}`);

      res.send(tokens);
    } catch (error) {
      next(error);
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      const tokens = await this.auth.refreshToken(
        refreshToken
      );

      res.send(tokens);

    } catch (error) {
      next(error);
    }
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const findUsuario = () => this.db.entities.usuario.findOne({
      where: {
        email: req.body.email,
      },
    });

    return findUsuario()
      .then((usuario) => {
        if (!usuario) {
          throw new Exceptions.UserNotFoundException();
        }

        return this.auth.changeUserPassword(usuario);
      })
      .then(() => res.end())
      .catch(next);
  }

  recoverPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    return this.accountUseCases
      .recoverPass(email)
      .then((ok) => {
        if (!ok) {
          return this.accountUseCases.resendInvite(email);
        }
        return true;
      })
      .then(() => res.end())
      .catch(next);
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { codigo, email } = req.body;

    const findUsuario = () => {
      const where = {
        email,
      };
      return this.db.entities.usuario.findOne({ where });
    };

    const findUsuarioSolicitacaoSenha = () => {
      const where = {
        codigo,
        email,
        expiraEm: {
          $gt: new Date(),
        },
      };
      return this.db.entities.usuarioSolicitacaoSenha.findOne({ where });
    };

    const action = (results) => {
      const solicitacao = results[0];
      if (!solicitacao) {
        throw new Error('solicitacao-invalida');
      }

      const usuario = results[1];
      if (!usuario) {
        throw new Error('usuario-not-found');
      }

      req.body.id = usuario.id;

      return this.auth
        .changeUserPassword(req.body)
        .then(() => solicitacao.destroy());
    };

    return Promise
      .all([
        findUsuarioSolicitacaoSenha(),
        findUsuario(),
      ])
      .then(action)
      .then(() => res.end())
      .catch(next);
  }

  impersonate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userEmail = req.user.email;
      const id = +req.body.participanteId;

      const tokens = await this.auth.generateSessionToken(userEmail, id, true);
      res.send(tokens);

    } catch (error) {
      next(error);
    }
  }
}

export default AccountController;
