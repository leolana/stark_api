import { Membro, Usuario } from '../../../infra/database';

const listUsersFromParticipantUseCase = async (idParticipante: number) => {
  const membros = await Membro.findAll({
    where: {
      participanteId: idParticipante,
    },
    attributes: [],
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: [
          'id',
          'nome',
          'email',
          'celular',
          ['roles', 'perfis'],
          'ativo'
        ]
      }
    ]
  });

  const usuarios = membros.map(membro => membro.usuario);

  return (usuarios);
};

export default listUsersFromParticipantUseCase;
