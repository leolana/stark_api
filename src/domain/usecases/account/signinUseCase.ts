import sequelize = require('sequelize');
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Usuario } from '../../../infra/database/models/usuario';

const signinUseCase = (
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
      const usuarios = (await Usuario.findAll({
        where: <any>[sequelize.or(
          { email },
          { documento }
        )]
      })).map((u: any) => u.dataValues);

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
