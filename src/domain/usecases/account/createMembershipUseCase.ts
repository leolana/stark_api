import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Usuario, Membro } from '../../../infra/database';

const createMembershipsUseCase = async (participanteId: number, usuarioId: string, role: string) => {
  if (!participanteId || isNaN(participanteId) && !usuarioId) {
    throw new Exceptions.CouldNotCreatBondException();
  }

  const usuario = await Usuario.findOne({
    where: {
      id: usuarioId,
      ativo: true
    }
  });

  if (!usuario) {
    throw new Exceptions.CouldNotCreatBondException();
  }

  await Membro.create({
    participanteId,
    usuarioId,
    roles: [role]
  });
};

export default createMembershipsUseCase;
