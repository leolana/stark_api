import usuarioStatus from '../../entities/usuarioStatus';
import { setDatatableOptionsService } from '../../../domain/services/datatable/setDatatableOptionsService';
import { UsuarioConvite } from '../../../infra/database';

const listInvitesUseCase = async (participanteId: number, filter: any, datatableOptions: any) => {

  let expiraEm: any;

  if (filter.status === usuarioStatus.expirado) {
    expiraEm = { $lte: new Date() };
  } else {
    expiraEm = { $gt: new Date() };
  }

  const where: any = {
    expiraEm,
  };

  if (participanteId) {
    where.participante = participanteId;
  }

  if (datatableOptions.sortColumn === 'perfis') {
    datatableOptions.sortColumn = 'roles';
  }

  const config = {
    where,
    attributes: ['nome', 'email', 'celular', 'roles', 'expiraEm'],
  };

  if (!isNaN(datatableOptions.pageSize) && !isNaN(datatableOptions.pageIndex)) {
    setDatatableOptionsService(datatableOptions, config);
  }

  const [invitesLength, invites] = await Promise.all([
    UsuarioConvite.count({ where }),
    UsuarioConvite.findAll(config)
  ]);

  const arrayInvites = invites.map(invite => ({
    nome: invite.nome,
    email: invite.email,
    celular: invite.celular,
    roles: invite.roles,
    expiraEm: invite.expiraEm
  }));

  return {
    invitesLength,
    invites: arrayInvites
  };
};

export default listInvitesUseCase;
