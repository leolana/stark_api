import * as jwt from 'jsonwebtoken';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { Request } from 'express-request';
import { Response, NextFunction } from 'express';

import { unless } from './unlessRoutes';

import { config } from '../../../config';

const unlessSession = [
  ...unless.path,
  '/memberships',
  '/initiate-session',
  '/initiate-gateway',
];

export default (req: Request, res: Response, next: NextFunction) => {
  if (unlessSession.includes(req.originalUrl)) {
    next();
  } else {
    jwt.verify(
      req.headers.sessiontoken,
      config.auth.clientSecret,
      (error: any, decoded: any) => {
        if (error) {
          res.status(INTERNAL_SERVER_ERROR).json('invalid-credentials');
        } else {
          Object.assign(req.user, decoded);
          next();
        }
      },
    );
  }
};
