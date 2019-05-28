import { Sequelize } from 'sequelize-typescript';

const checkUsernameExistenceUseCase = (db: Sequelize) => async (idUsuario, username) => {
  if (!username) return null;
  const where: any = { username };
  if (idUsuario !== 'null') where.id = { $ne: idUsuario };

  return db.entities.usuario.findAll({ where });

};

export default checkUsernameExistenceUseCase;
