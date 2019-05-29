import listUsersUseCase from './listUsersUseCase';
import listInvitesUseCase from './listInvitesUseCase';
import listUsersFromParticipantUseCase from './listUsersFromParticipantUseCase';
import listInvitesFromParticipantUseCase from './listInvitesFromParticipantUseCase';
import { Sequelize } from 'sequelize-typescript';
import inviteUserUseCase from './inviteUserUseCase';
import { Auth } from '../../../infra/auth';
import { AccountUseCases } from '../account';
import newUserFromInviteUseCase from './newUserFromInviteUseCase';
import updateUserStatusUseCase from './updateUserStatusUseCase';
import validateKeycloakUserStatusUseCase from './validateKeycloakUserStatusUseCase';
import { LoggerInterface } from '../../../infra/logging';
import checkUsernameExistenceUseCase from './checkUsernameExistenceUseCase';
import listUserFromIdUseCase from './listUserFromIdUseCase';
import recreateUserKeycloakUseCase from './recreateUserKeycloakUseCase';
import getInfoKeycloakUseCase from './getInfoKeycloakUseCase';

export interface UsuarioUseCases {
  listUsersUseCase?: typeof listUsersUseCase;
  listInvitesUseCase?: typeof listInvitesUseCase;
  listUsersFromParticipantUseCase?: typeof listUsersFromParticipantUseCase;
  listInvitesFromParticipantUseCase?: typeof listInvitesFromParticipantUseCase;
  inviteUserUseCase?: ReturnType<typeof inviteUserUseCase>;
  newUserFromInviteUseCase?: ReturnType<typeof newUserFromInviteUseCase>;
  updateUserStatusUseCase?: ReturnType<typeof updateUserStatusUseCase>;
  validateKeycloakUserStatusUseCase?: ReturnType<typeof validateKeycloakUserStatusUseCase>;
  checkUsernameExistenceUseCase?: typeof checkUsernameExistenceUseCase;
  listUserFromIdUseCase?: typeof listUserFromIdUseCase;
  recreateUserKeycloakUseCase?: ReturnType<typeof recreateUserKeycloakUseCase>;
  getInfoKeycloakUseCase?: ReturnType<typeof getInfoKeycloakUseCase>;
}

export function getUsuarioUseCases(
  db: Sequelize,
  auth: Auth,
  accountUseCases: AccountUseCases,
  logger: LoggerInterface
) {
  const usecases: UsuarioUseCases = {};

  usecases.listUsersUseCase = listUsersUseCase;
  usecases.listInvitesUseCase = listInvitesUseCase;
  usecases.listUsersFromParticipantUseCase = listUsersFromParticipantUseCase;
  usecases.listInvitesFromParticipantUseCase = listInvitesFromParticipantUseCase;
  usecases.inviteUserUseCase = inviteUserUseCase(db, auth, accountUseCases);
  usecases.newUserFromInviteUseCase = newUserFromInviteUseCase(auth);
  usecases.updateUserStatusUseCase = updateUserStatusUseCase(db, auth, logger);
  usecases.validateKeycloakUserStatusUseCase = validateKeycloakUserStatusUseCase(auth);
  usecases.checkUsernameExistenceUseCase = checkUsernameExistenceUseCase;
  usecases.listUserFromIdUseCase = listUserFromIdUseCase;
  usecases.recreateUserKeycloakUseCase = recreateUserKeycloakUseCase(auth, logger);
  usecases.getInfoKeycloakUseCase = getInfoKeycloakUseCase(auth, logger);
  return usecases;
}
