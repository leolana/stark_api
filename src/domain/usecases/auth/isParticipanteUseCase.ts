import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import { Request } from 'express-request';

const isParticipanteUseCase = (req: Request, ...tipos: tiposParticipante[]) => {
  const ehEstabelecimento = req.user.participanteEstabelecimento;
  const ehFornecedor = req.user.participanteFornecedor;

  return tipos.some((tipo) => {
    if (tipo === tiposParticipante.estabelecimento && ehEstabelecimento) {
      return true;
    }
    if (tipo === tiposParticipante.fornecedor && ehFornecedor) {
      return true;
    }
    return false;
  });
};

export default isParticipanteUseCase;
