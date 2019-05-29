import { DateTime } from 'luxon';
import { Usuario, Membro, UsuarioConvite } from '../../../infra/database';

const checkMembershipsUseCase = async (emails: string[]) => {
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
      roles: membro.roles,
    }));
  });

  return {
    convites,
    memberships
  };

};

export default checkMembershipsUseCase;
