import AuthProd from '../AuthProd';

const removeRoleFromUserUseCase = (auth: AuthProd) =>

  async (keycloakId: string, token: string, role: string) => {
    await <any>auth.request({
      method: 'DELETE',
      uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}`
        + `/users/${keycloakId}/role-mappings/clients/${auth.settings.clientUUID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: [{
        id: auth.rolesIds[role],
        name: role,
      }],
      json: true,
    });

  };

export default removeRoleFromUserUseCase;
