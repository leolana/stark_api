import { Usuario } from '../../../infra/database';

const checkUsernameExistenceUseCase = async (idUsuario: number, username: string) => {
  if (!username) {
    return null;
  }

  const where: any = {
    username
  };

  if (idUsuario) {
    where.id = {
      $ne: idUsuario
    };
  }

  const users = await Usuario.findAll({
    where
  });

  return (users);
};

export default checkUsernameExistenceUseCase;
