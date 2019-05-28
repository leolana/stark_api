import { UsuarioConvite } from '../../../infra/database';

const listInvitesFromParticipantUseCase = async (idParticipante: number) => {
  const convites = await UsuarioConvite.findAll({
    where: {
      participante: idParticipante,
    },
    attributes: [
      'nome',
      'email',
      'celular',
      ['roles', 'perfis'],
      'expiraEm'
    ],
  });

  convites.forEach((convite: any) => {
    convite.dataValues.status = new Date(convite.expiraEm) < new Date() ? 'Expirado' : 'Pendente';
  });

  return convites;
};

export default listInvitesFromParticipantUseCase;
