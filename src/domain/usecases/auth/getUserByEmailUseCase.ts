import AuthProd from '../../../infra/auth/AuthProd';
import { KeycloakUserRepresentation } from '../../../infra/auth/AuthTypes';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const getUserByEmailUseCase = (auth: AuthProd) =>

  async (userEmail: string): Promise<KeycloakUserRepresentation> => {
    const accessToken = await auth.authenticateAsAdmin();

    const keycloakUsers = await <any>auth.request({
      method: 'GET',
      uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}/users`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      qs: {
        email: userEmail
      }
    });

    if (!keycloakUsers || !keycloakUsers.length) {
      return null;
    }

    if (keycloakUsers.length > 1) {
      throw new Exceptions.MultipleUsersFoundException();
    }

    return keycloakUsers[0];
  };

export default getUserByEmailUseCase;
