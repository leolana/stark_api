import AuthProd from '../../../infra/auth/AuthProd';

const updateUserDataUseCase = (auth: AuthProd) =>

  async (user, changes) => {
    const keycloakUser = await auth.getUserByUuid(user.id);
    const accessToken = await auth.authenticateAsAdmin();

    const oldRole = user.role;
    const newRole = changes.role;

    const promises: any[] = [
      auth.request({
        method: 'PUT',
        uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}`
          + `/users/${keycloakUser.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          firstName: changes.nome,
        },
        json: true,
      })
    ];

    if (oldRole !== newRole) {
      promises.push(
        auth.request({
          method: 'DELETE',
          uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}`
            + `/users/${keycloakUser.id}/role-mappings`
            + `/clients/${auth.settings.clientUUID}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: [{
            id: auth.rolesIds[oldRole],
            name: oldRole
          }],
          json: true
        }),
        auth.addRoleToUser(keycloakUser.id, accessToken, newRole)
      );
    }

    return await Promise.all(promises);
  };

export default updateUserDataUseCase;
