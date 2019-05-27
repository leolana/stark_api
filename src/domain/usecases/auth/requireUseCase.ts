import AuthProd from '../../../infra/auth/AuthProd';
import { Request } from 'express-request';
import { Response, NextFunction } from 'express';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const requireUseCase = (auth: AuthProd) =>

  (...roles) => (req: Request, res: Response, next: NextFunction) => {
    if (!auth.hasPermission(req, ...roles)) {
      throw new Exceptions.AccessDeniedException();
    }

    next();
  };

export default requireUseCase;
