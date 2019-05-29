import { UserNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Usuario, Membro } from '../../../infra/database';

const listUserFromIdUseCase = async (idUsuario: string) => {
  const user = await Usuario.findOne({
    where: {
      id: idUsuario
    },
    attributes: [
      'id',
      'nome',
      'email',
      'celular',
      'username',
      'documento',
      'roles',
      'ativo'
    ],
    include: [
      {
        model: Membro,
        as: 'associacoes'
      }
    ],
  });

  if (!user) throw new UserNotFoundException();

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    celular: user.celular,
    documento: user.documento,
    username: user.username,
    roles: user.associacoes.flatMap(membro => membro.roles),
    ativo: user.ativo,
    associacoes: user.associacoes,
  };

};

export default listUserFromIdUseCase;
