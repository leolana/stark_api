import AuthProd from '../AuthProd';

const recreateUserUseCase = (auth: AuthProd) =>

  async (user: any) => {
    let keycloakUser = await auth.getUserByUuid(user.id);

    if (!keycloakUser) {
      keycloakUser = await auth.getUserByEmail(user.email);
    }

    if (keycloakUser) {
      const accessToken = await auth.authenticateAsAdmin();

      await <any>auth.request({
        method: 'DELETE',
        uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}/users/${keycloakUser.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    const newUserId = await auth.createUser(user, false);
    await auth.recoverPassword({ email: user.email }, true);

    return newUserId;
  };

export default recreateUserUseCase;
