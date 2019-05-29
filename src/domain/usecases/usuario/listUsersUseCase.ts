
import usuarioStatus from '../../entities/usuarioStatus';
import { setDatatableOptionsService } from '../../../domain/services/datatable/setDatatableOptionsService';
import { Membro, Usuario } from '../../../infra/database';

const listUsersUseCase = async (participanteId: number, filter: any, datatableOptions: any) => {
  const where: any = {};

  if (participanteId) {
    where.participanteId = participanteId;
  }

  if (datatableOptions.sortColumn === 'perfis') {
    datatableOptions.sortColumn = 'roles';
  }

  const config = {
    attributes: ['id', 'nome', 'email', 'celular', 'roles', 'ativo'],
    include: [{
      where,
      model: Membro,
      as: 'associacoes'
    }],
    where: {
      ativo: usuarioStatus.ativo === filter.status
    }
  };

  if (!isNaN(datatableOptions.pageSize) && !isNaN(datatableOptions.pageIndex)) {
    setDatatableOptionsService(datatableOptions, config);
  }

  const users = await Usuario.findAll(config);
  const usersLength = users.length;

  const arrayUsers = users.map(user => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    celular: user.celular,
    roles: user.associacoes.flatMap(membro => membro.roles),
    ativo: user.ativo,
  }));

  return {
    usersLength,
    users: arrayUsers
  };

};

export default listUsersUseCase;
