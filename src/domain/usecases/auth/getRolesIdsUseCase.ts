import AuthProd from '../../../infra/auth/AuthProd';

const getRolesIdsUseCase = (auth: AuthProd) =>

  async () => {
    const accessToken = await auth.authenticateAsAdmin();

    const roles = await <any>auth.request({
      method: 'GET',
      uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}`
        + `/clients/${auth.settings.clientUUID}/roles`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: true,
    });

    roles.forEach((role) => {
      auth.rolesIds[role.name] = role.id;
    });

    return auth.rolesIds;
  };

export default getRolesIdsUseCase;
