import AuthProd from '../../../infra/auth/AuthProd';
import { Request } from 'express-request';
import rolesEnum from '../../services/auth/rolesEnum';

const hasPermissionUseCase = (auth: AuthProd) =>

  (req: Request, ...accessRoles: rolesEnum[]): boolean => {
    const userRoles = auth.getUserRoles(req);

    const isSuper = userRoles.includes(rolesEnum.super);
    if (isSuper) {
      return true;
    }

    return userRoles.some(r => accessRoles.includes(r));
  };

export default hasPermissionUseCase;
