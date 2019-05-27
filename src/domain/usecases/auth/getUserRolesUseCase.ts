import AuthProd from '../../../infra/auth/AuthProd';
import { Request } from 'express-request';
import rolesEnum from '../../services/auth/rolesEnum';

const getUserRolesUseCase = (auth: AuthProd) =>

  (req: Request): rolesEnum[] => {
    return req.user.resource_access[auth.settings.clientId].roles;
  };

export default getUserRolesUseCase;
