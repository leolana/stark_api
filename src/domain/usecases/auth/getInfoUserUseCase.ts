import AuthProd from '../../../infra/auth/AuthProd';
import { KeycloakUserRepresentation } from '../../../infra/auth/AuthTypes';

const getInfoUserUseCase = (auth: AuthProd) =>

  async (userId: string): Promise<KeycloakUserRepresentation> => {
    try {
      const accessToken = await auth.authenticateAsAdmin();
      const userKeycloak = await auth.getUserByUuid(userId);

      const roles = await <any>auth.request({
        method: 'GET',
        uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}`
          + `/users/${userId}/role-mappings/clients/${auth.settings.clientUUID}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        json: true,
      });

      return {
        roles: roles.map((role: any) => role.name),
        ...userKeycloak,
      };
    } catch (error) {
      auth.logger.error(error);
      return null;
    }
  };

export default getInfoUserUseCase;
