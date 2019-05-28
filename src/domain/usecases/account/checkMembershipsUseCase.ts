import { Sequelize } from 'sequelize-typescript';
import { DateTime } from 'luxon';
import { Usuario } from '../../../infra/database/models/usuario';
import { Membro } from '../../../infra/database/models/membro';
import { UsuarioConvite } from '../../../infra/database/models/usuarioConvite';

const checkMembershipsUseCase = (db: Sequelize) => async (emails: string[]) => {
  const users = await Usuario.findAll({
    where: { email: emails },
    attributes: ['id', 'email', 'roles'],
    include: [
      {
        model: Membro,
        attributes: ['participanteId'],
        as: 'associacoes'
      }
    ]
  });

  const today = DateTime.local().toSQLDate();

  const convites = await UsuarioConvite.findAll({
    attributes: ['email', 'roles'],
    where: {
      email: emails,
      expiraEm: { $gte: today }
    },
  });

  const memberships = users.map((user) => {
    return user.associacoes.map(membro => ({
      email: user.email,
      userId: user.id,
      memberId: membro.participanteId,
      roles: user.roles,
    }));
  });

  return {
    convites,
    memberships
  };

};

export default checkMembershipsUseCase;
