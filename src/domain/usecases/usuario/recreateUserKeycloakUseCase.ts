import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';
import { Usuario } from '../../../infra/database';

const recreateUserKeycloakUseCase = (
  auth: Auth,
  logger: LoggerInterface,
) =>

  async (
    userData: any,
    emailLogged: string
  ) => {

    const user = await Usuario.findOne({
      where: {
        email: userData.email,
        id: userData.id
      }
    });

    if (!user) {
      throw new Exceptions.UserNotFoundException();
    }

    const oldId = user.id;
    const newId = await auth.recreateUser({
      id: oldId,
      username: user.email,
      email: user.email,
      name: user.nome,
      roles: user.roles
    });

    await Usuario.update(
      { id: newId },
      { where: { id: oldId } }
    );

    logger.info(
      `"${emailLogged}" recriou o usuário ${user.email}" no keycloak com id "${newId}", antigo id "${oldId}".`
    );

  };

export default recreateUserKeycloakUseCase;
