import * as request from 'request-promise-native';
import { Sequelize } from 'sequelize-database';
import { injectable, inject } from 'inversify';
import { Environment, AuthEnv } from '../environment/Environment';
import { LoggerInterface } from '../logging';

import Auth from './Auth';
import Mailer from '../mailer/Mailer';
import types from '../../constants/types';

import isParticipanteUseCase from './usecases/isParticipanteUseCase';
import requireParticipanteUseCase from './usecases/requireParticipanteUseCase';
import authenticateAsAdminUseCase from './usecases/authenticateAsAdminUseCase';
import parseResultUseCase from './usecases/parseResultUseCase';
import addRoleToUserUseCase from './usecases/addRoleToUserUseCase';
import removeRoleFromUserUseCase from './usecases/removeRoleFromUserUseCase';
import generateSessionTokenUseCase from './usecases/generateSessionTokenUseCase';
import getUserRolesUseCase from './usecases/getUserRolesUseCase';
import hasPermissionUseCase from './usecases/hasPermissionUseCase';
import changeUserRolesUseCase from './usecases/changeUserRolesUseCase';
import getRolesIdsUseCase from './usecases/getRolesIdsUseCase';
import authenticateUseCase from './usecases/authenticateUseCase';
import refreshTokenUseCase from './usecases/refreshTokenUseCase';
import requireUseCase from './usecases/requireUseCase';
import inviteUserUseCase from './usecases/inviteUserUseCase';
import addRoleKcUseCase from './usecases/addRoleKcUseCase';
import createUserUseCase from './usecases/createUserUseCase';
import recreateUserUseCase from './usecases/recreateUserUseCase';
import updateUserDataUseCase from './usecases/updateUserDataUseCase';
import updateUserStatusUseCase from './usecases/updateUserStatusUseCase';
import changeUserPasswordUseCase from './usecases/changeUserPasswordUseCase';
import recoverPasswordUseCase from './usecases/recoverPasswordUseCase';
import getUserByUuidUseCase from './usecases/getUserByUuidUseCase';
import getUserByEmailUseCase from './usecases/getUserByEmailUseCase';
import getInfoUserUseCase from './usecases/getInfoUserUseCase';
import putUserUseCase from './usecases/putUserUseCase';

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
