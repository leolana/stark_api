import { Sequelize } from 'sequelize-database';
import { Mailer } from '../../../infra/mailer';
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';
import { MailerEnv } from '../../../infra/environment/Environment';

import signinUseCase from './signinUseCase';
import deleteInvite from './deleteInvite';
import resendInvite from './resendInvite';
import recoverPass from './recoverPass';
import createMembershipUseCase from './createMembershipUseCase';
import checkMembershipsUseCase from './checkMembershipsUseCase';

export interface AccountUseCases {
  signin?: ReturnType<typeof signinUseCase>;
  deleteInvite?: ReturnType<typeof deleteInvite>;
  resendInvite?: ReturnType<typeof resendInvite>;
  recoverPass?: ReturnType<typeof recoverPass>;
  createMembershipUseCase?: ReturnType<typeof createMembershipUseCase>;
  checkMembershipsUseCase?: ReturnType<typeof checkMembershipsUseCase>;
}

export function getAccountUseCases(
  db: Sequelize,
  mailer: Mailer,
  emailTemplates: any,
  settings: MailerEnv,
  auth: Auth,
  logger: LoggerInterface
) {
  const usecases: AccountUseCases = {};

  usecases.signin = signinUseCase(db, auth, logger);
  usecases.deleteInvite = deleteInvite(db);
  usecases.resendInvite = resendInvite(db, mailer, emailTemplates, settings);
  usecases.recoverPass = recoverPass(db, auth);
  usecases.createMembershipUseCase = createMembershipUseCase(db);
  usecases.checkMembershipsUseCase = checkMembershipsUseCase(db);

  return usecases;
}
