import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { LoggerInterface } from '../../../infra/logging';
import { Mailer } from '../../../infra/mailer';
import { getAccountUseCases, AccountUseCases } from '../../../domain/usecases/account';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import { Environment } from '../../../infra/environment/Environment';

import types from '../../../constants/types';
import * as Exceptions from '../exceptions/ApiExceptions';

import { Usuario, Membro, UsuarioSolicitacaoSenha } from '../../../infra/database';

@injectable()
class AccountController implements Controller {
  auth: Auth;
  mailer: Mailer;
  accountUseCases: AccountUseCases;

  constructor(
    @inject(types.Environment) private config: Environment,
    @inject(types.Logger) private logger: LoggerInterface,

    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer
  ) {
    this.auth = auth();
    this.mailer = mailer();

    this.accountUseCases = getAccountUseCases(
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

      const usuario = await Usuario.findOne({
        where: { email },
        include: [
          {
            model: Membro,
            as: 'associacoes',
            required: true
          }
        ]
      });

      const membros = usuario ? usuario.associacoes : [];
      res.send(membros);

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
      const userEmail = req.body.email;
      const idParticipante = req.body.participanteId;

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
    try {
      const usuario = await Usuario.findOne({
        where: {
          email: req.body.email
        }
      });

      if (!usuario) {
        throw new Exceptions.UserNotFoundException();
      }

      await this.auth.changeUserPassword(usuario);

      res.end();

    } catch (error) {
      next(error);
    }
  }

  recoverPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const ok = await this.accountUseCases.recoverPass(email);
      if (!ok) {
        await this.accountUseCases.resendInvite(email);
      }

      res.end();

    } catch (error) {
      next(error);
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { codigo, email } = req.body;

      const solicitacao = await UsuarioSolicitacaoSenha.findOne({
        where: <any>{
          codigo,
          email,
          expiraEm: {
            $gt: new Date()
          }
        }
      });

      if (!solicitacao) {
        throw new Exceptions.InvalidUserPasswordSolicitationException();
      }

      const usuario = Usuario.findOne({
        where: {
          email
        }
      });

      if (!usuario) {
        throw new Exceptions.UserNotFoundException();
      }

      await this.auth.changeUserPassword(usuario);
      solicitacao.destroy();
      res.end();

    } catch (error) {
      next(error);
    }
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
