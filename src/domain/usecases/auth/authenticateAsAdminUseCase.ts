import AuthProd from '../../../infra/auth/AuthProd';

const authenticateAsAdminUseCase = (auth: AuthProd) =>

  async (): Promise<string> => {
    const result = await <any>auth.request({
      method: 'POST',
      uri: `${auth.settings.address}/auth/realms/${auth.settings.realm}/protocol/openid-connect/token`,
      form: {
        client_id: 'admin-cli',
        username: auth.settings.adminUsername,
        password: auth.settings.adminPassword,
        grant_type: 'password',
      },
    });

    return auth.parseResult(result).accessToken;
  };

export default authenticateAsAdminUseCase;
