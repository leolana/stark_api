import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-typescript';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { Mailer } from '../../../infra/mailer';
import { Environment, AppEnv } from '../../../infra/environment/Environment';

import types from '../../../constants/types';
import { HealthCheckUseCases, getHealthCheckUseCases } from '../../../domain/usecases/healthCheck';
import { Migration } from '../../../infra/database';

@injectable()
class HealthController implements Controller {
  auth: Auth;
  mailer: Mailer;
  emailTemplates: any;
  settings: AppEnv;
  usecases: HealthCheckUseCases;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Environment) config: Environment,
  ) {
    this.auth = auth();
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.settings = config.app;
    this.usecases = getHealthCheckUseCases(this.db, auth());
  }

  get router(): Router {
    const router = Router();

    router.get('/health-check', this.healthCheck);
    router.post('/health-kc', this.healthKc);
    router.get('/health/testPostgresConnection', this.testPostgresConnection);
    router.get('/health/testKeyCloakAccess', this.testKeyCloakAccess);
    router.post('/health/testMailer', this.testMailer);
    router.get('/health/getStatusSignins', this.getStatusSignins);
    router.get('/version', this.getVersion);
    router.get('/health/migrations', this.getMigrations);

    return router;
  }

  healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await Promise.all([
        this.usecases.testPostgresConnectionUseCase(),
        this.usecases.testKeyCloakAccessUseCase()
      ]);

      const errors = results.filter(result => result && result.message && typeof result.message === 'string');

      if (errors.length) {
        res.send({
          errors,
          result: false
        });
        return;
      }

      res.send({
        status: 'Api is running...',
        result: true,
      });
    } catch (error) {
      next(error);
    }
  }

  healthKc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const healthKc = this.auth.addRoleKc(req.body.email, req.body.roles, req.body.pwd);

      res.send(healthKc);
    } catch (error) {
      next(error);
    }
  }

  testPostgresConnection = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const postgres = await this.usecases.testPostgresConnectionUseCase();
      res.send({ error: postgres, result: !postgres });
    } catch (error) {
      next(error);
    }
  }

  testKeyCloakAccess = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const keyCloak = await this.usecases.testKeyCloakAccessUseCase();
      res.send({ error: keyCloak, result: !keyCloak });
    } catch (error) {
      next(error);
    }
  }

  testMailer = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return this.mailer.enviar({
      templateName: this.emailTemplates.EMAIL_TESTE,
      destinatary: req.body.to,
      substitutions: {}
    })
      .then(result => res.send({ result: true }))
      .catch(error => res.send({ error, result: false }));
  }

  getStatusSignins = async (req: Request, res: Response, next: NextFunction) => {
    res.send({ result: false, error: 'Não implementado!' });
  }

  getVersion = async (req: Request, res: Response, next: NextFunction) => {
    res.send({ result: this.settings.version });
  }

  getMigrations = async (req: Request, res: Response, next: NextFunction) => {
    const migrations = Migration.findAll({
      attributes: ['key', 'executedAt'],
      order: [['executedAt', 'DESC']]
    });

    migrations
      .then(results => res.send(results))
      .catch(() => res.send([]));
  }

}

export default HealthController;
