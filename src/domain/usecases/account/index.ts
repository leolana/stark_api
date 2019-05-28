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
  deleteInvite?: typeof deleteInvite;
  resendInvite?: ReturnType<typeof resendInvite>;
  recoverPass?: ReturnType<typeof recoverPass>;
  createMembershipUseCase?: typeof createMembershipUseCase;
  checkMembershipsUseCase?: typeof checkMembershipsUseCase;
}

export function getAccountUseCases(
  mailer: Mailer,
  emailTemplates: any,
  settings: MailerEnv,
  auth: Auth,
  logger: LoggerInterface
) {
  const usecases: AccountUseCases = {};

  usecases.signin = signinUseCase(auth, logger);
  usecases.deleteInvite = deleteInvite;
  usecases.resendInvite = resendInvite(logger, mailer, emailTemplates, settings);
  usecases.recoverPass = recoverPass(auth);
  usecases.createMembershipUseCase = createMembershipUseCase;
  usecases.checkMembershipsUseCase = checkMembershipsUseCase;

  return usecases;
}
