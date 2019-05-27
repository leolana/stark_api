import AuthProd from '../AuthProd';

const refreshTokenUseCase = (auth: AuthProd) =>

  async (refreshToken: string) => {
    const result = await <any>auth.request({
      method: 'POST',
      uri: `${auth.settings.address}/auth/realms/${auth.settings.realm}/protocol/openid-connect/token`,
      form: {
        client_id: auth.settings.clientId,
        client_secret: auth.settings.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
    });

    return auth.parseResult(result);
  };

export default refreshTokenUseCase;
