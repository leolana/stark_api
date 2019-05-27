import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import { Response, NextFunction } from 'express';
import { Request } from 'express-request';
import isParticipanteUseCase from './isParticipanteUseCase';

const requireParticipanteUseCase = (...tipos: tiposParticipante[]) =>
  (req: Request, res: Response, next: NextFunction): any => {

    const allowed = isParticipanteUseCase(
      req,
      ...tipos
    );

    if (!allowed) {
      throw new Exceptions.AccessDeniedException();
    }

    next();
  };

export default requireParticipanteUseCase;
