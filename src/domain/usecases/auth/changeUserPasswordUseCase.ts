import AuthProd from '../../../infra/auth/AuthProd';

const changeUserPasswordUseCase = (auth: AuthProd) =>

  async (user) => {
    const keycloakUser = await auth.getUserByUuid(user.id);

    const accessToken = await auth.authenticateAsAdmin();

    return await <any>auth.request({
      method: 'PUT',
      uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}/users/${keycloakUser.id}/reset-password`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        type: 'password',
        temporary: false,
        value: user.newPassword,
      },
      json: true,
    });
  };

export default changeUserPasswordUseCase;
