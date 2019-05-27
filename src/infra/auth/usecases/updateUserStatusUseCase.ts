import AuthProd from '../AuthProd';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const updateUserStatusUseCase = (auth: AuthProd) =>

  async (userId: string, userStatus: boolean) => {
    const keycloakUser = await auth.getUserByUuid(userId);
    if (!keycloakUser) {
      throw new Exceptions.KeycloakUserNotFoundException();
    }

    if (keycloakUser.enabled === userStatus) {
      return;
    }

    keycloakUser.enabled = userStatus;
    await auth.putUser(keycloakUser);
  };

export default updateUserStatusUseCase;
