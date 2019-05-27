import AuthProd from '../../../infra/auth/AuthProd';
import { KeycloakUserRepresentation } from '../../../infra/auth/AuthTypes';

const putUserUseCase = (auth: AuthProd) =>

  async (user: KeycloakUserRepresentation): Promise<void> => {
    const accessToken = await auth.authenticateAsAdmin();

    await <any>auth.request({
      method: 'PUT',
      uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}/users/${user.id}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: user,
      json: true,
    });
  };

export default putUserUseCase;
