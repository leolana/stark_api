import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Auth } from '../../../infra/auth';
import { Usuario } from '../../../infra/database';

const validateKeycloakUserStatusUseCase = (
  auth: Auth
) => async (userId: string): Promise<{ userStatus: boolean }> => {

  const user = await Usuario.findOne({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new Exceptions.UserNotFoundException();
  }

  const keycloakUser = await auth.getUserByUuid(
    userId
  );

  if (!keycloakUser) {
    throw new Exceptions.KeycloakUserNotFoundException();
  }

  if (user.ativo !== keycloakUser.enabled) {
    keycloakUser.enabled = user.ativo;

    await auth.putUser(
      keycloakUser
    );
  }

  return {
    userStatus: user.ativo
  };
};

export default validateKeycloakUserStatusUseCase;
