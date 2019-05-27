import * as request from 'request-promise-native';
import { Sequelize } from 'sequelize-database';
import { injectable, inject } from 'inversify';
import { Environment, AuthEnv } from '../environment/Environment';
import { LoggerInterface } from '../logging';

import Auth from './Auth';
import Mailer from '../mailer/Mailer';
import types from '../../constants/types';

import isParticipanteUseCase from '../../domain/usecases/auth/isParticipanteUseCase';
import requireParticipanteUseCase from '../../domain/usecases/auth/requireParticipanteUseCase';
import authenticateAsAdminUseCase from '../../domain/usecases/auth/authenticateAsAdminUseCase';
import parseResultUseCase from '../../domain/usecases/auth/parseResultUseCase';
import addRoleToUserUseCase from '../../domain/usecases/auth/addRoleToUserUseCase';
import removeRoleFromUserUseCase from '../../domain/usecases/auth/removeRoleFromUserUseCase';
import generateSessionTokenUseCase from '../../domain/usecases/auth/generateSessionTokenUseCase';
import getUserRolesUseCase from '../../domain/usecases/auth/getUserRolesUseCase';
import hasPermissionUseCase from '../../domain/usecases/auth/hasPermissionUseCase';
import changeUserRolesUseCase from '../../domain/usecases/auth/changeUserRolesUseCase';
import getRolesIdsUseCase from '../../domain/usecases/auth/getRolesIdsUseCase';
import authenticateUseCase from '../../domain/usecases/auth/authenticateUseCase';
import refreshTokenUseCase from '../../domain/usecases/auth/refreshTokenUseCase';
import requireUseCase from '../../domain/usecases/auth/requireUseCase';
import inviteUserUseCase from '../../domain/usecases/auth/inviteUserUseCase';
import addRoleKcUseCase from '../../domain/usecases/auth/addRoleKcUseCase';
import createUserUseCase from '../../domain/usecases/auth/createUserUseCase';
import recreateUserUseCase from '../../domain/usecases/auth/recreateUserUseCase';
import updateUserDataUseCase from '../../domain/usecases/auth/updateUserDataUseCase';
import updateUserStatusUseCase from '../../domain/usecases/auth/updateUserStatusUseCase';
import changeUserPasswordUseCase from '../../domain/usecases/auth/changeUserPasswordUseCase';
import recoverPasswordUseCase from '../../domain/usecases/auth/recoverPasswordUseCase';
import getUserByUuidUseCase from '../../domain/usecases/auth/getUserByUuidUseCase';
import getUserByEmailUseCase from '../../domain/usecases/auth/getUserByEmailUseCase';
import getInfoUserUseCase from '../../domain/usecases/auth/getInfoUserUseCase';
import putUserUseCase from '../../domain/usecases/auth/putUserUseCase';

@injectable()
class AuthProd implements Auth {
  mailer: Mailer;
  settings: AuthEnv;
  emailTemplates: any;
  rolesIds = {};
  request = request;

  constructor(
    @inject(types.Database) public db: Sequelize,
    @inject(types.Logger) public logger: LoggerInterface,
    @inject(types.Environment) config: Environment,
    @inject(types.MailerFactory) mailer: () => Mailer,
  ) {
    this.settings = config.auth;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
  }

  parseResult = parseResultUseCase;
  isParticipante = isParticipanteUseCase;
  requireParticipante = requireParticipanteUseCase;

  authenticateAsAdmin = authenticateAsAdminUseCase(this);
  addRoleToUser = addRoleToUserUseCase(this);
  removeRoleFromUser = removeRoleFromUserUseCase(this);
  generateSessionToken = generateSessionTokenUseCase(this);
  getUserRoles = getUserRolesUseCase(this);
  hasPermission = hasPermissionUseCase(this);
  changeUserRoles = changeUserRolesUseCase(this);
  getRolesIds = getRolesIdsUseCase(this);
  authenticate = authenticateUseCase(this);
  refreshToken = refreshTokenUseCase(this);
  require = requireUseCase(this);
  inviteUser = inviteUserUseCase(this);
  addRoleKc = addRoleKcUseCase(this);
  createUser = createUserUseCase(this);
  recreateUser = recreateUserUseCase(this);
  updateUserData = updateUserDataUseCase(this);
  updateUserStatus = updateUserStatusUseCase(this);
  changeUserPassword = changeUserPasswordUseCase(this);
  recoverPassword = recoverPasswordUseCase(this);
  getUserByUuid = getUserByUuidUseCase(this);
  getUserByEmail = getUserByEmailUseCase(this);
  getInfoUser = getInfoUserUseCase(this);
  putUser = putUserUseCase(this);
}

export default AuthProd;
