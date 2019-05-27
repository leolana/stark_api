import sequelize = require('sequelize');
import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const signinUseCase = (
  db: Sequelize,
  auth: Auth,
  logger: LoggerInterface
) =>

  /**
   * Busca o uuid do usuário no postgres com base nos (email) e (documento) recebidos.
   * Autentica no keyCloak o (uuid) encontrado com a (password) informada.
   * Retorna os tokens [accessToken] e [refreshToken].
   */
  async (
    email: string,
    documento: string,
    password: string
  ) => {
    try {
      const usuarios = (await db.entities.usuario.findAll({
        where: [sequelize.or(
          { email },
          { documento }
        )]
      })).map(u => u.dataValues);

      if (usuarios.length > 1) {
        throw new Exceptions.MultipleUsersFoundException();
      }

      const [usuario] = usuarios;
      if (!usuario) {
        throw new Exceptions.UserNotFoundException();
      }

      try {
        const userUuid = usuario.id;
        const tokens = await auth.authenticate(
          userUuid,
          password
        );
        return (tokens);

      } catch (e) {
        const tokens = await auth.authenticate(
          usuario.email,
          password
        );
        return (tokens);
      }
    } catch (error) {
      logger.info('Autenticação não permitida');
      logger.error(error);

      throw new Exceptions.LoginFailedException();
    }
  };

export default signinUseCase;
