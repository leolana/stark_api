import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-typescript';

const createMembershipsUseCase = (
  db: Sequelize
) => async (participanteId: number, usuarioId: string, role?: string) => {
  if (!participanteId || isNaN(participanteId) && !usuarioId) {
    throw new Exceptions.CouldNotCreatBondException();
  }

  const usuario = await db.entities.usuario.findOne({
    where: { id: usuarioId, ativo: true }
  });

  const participante = await db.entities.participante.findOne({
    where: { id: participanteId, ativo: true }
  });

  if (!participante || !usuario) {
    throw new Exceptions.CouldNotCreatBondException();
  }

  if (role) {
    const jaTemRole = usuario.roles.find(userRole => userRole === role);
    if (!jaTemRole) {
      const roles = [...usuario.roles, role];
      try {
        await usuario.update({ roles });
      } catch (error) {
        throw new Exceptions.CouldNotCreatBondException();
      }
    }
  }

  await db.entities.membro.create({
    participanteId,
    usuarioId
  });

};

export default createMembershipsUseCase;
