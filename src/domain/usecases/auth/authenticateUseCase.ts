import AuthProd from '../../../infra/auth/AuthProd';

const authenticateUseCase = (auth: AuthProd) =>

  async (userUuid: string, pass: string) => {
    const result = await <any>auth.request({
      method: 'POST',
      uri: `${auth.settings.address}/auth/realms/${auth.settings.realm}/protocol/openid-connect/token`,
      form: {
        client_id: auth.settings.clientId,
        client_secret: auth.settings.clientSecret,
        username: userUuid,
        password: pass,
        grant_type: 'password',
      },
    });

    return auth.parseResult(result);
  };

export default authenticateUseCase;
