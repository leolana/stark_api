import AuthProd from '../../../infra/auth/AuthProd';
import uuid = require('uuid');

const createUserUseCase = (auth: AuthProd) =>

  async (user: any, setPassword = true) => {
    const newUserId = uuid.v4();

    let setCredentials = null;

    if (setPassword) {
      setCredentials = [{
        type: 'password',
        temporary: false,
        value: user.password,
      }];
    }

    const accessToken = await auth.authenticateAsAdmin();

    await <any>auth.request({
      method: 'POST',
      uri: `${auth.settings.address}/auth/admin/realms/${auth.settings.realm}/users`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        username: newUserId,
        firstName: (user.name || '').split(' ').slice(0, -1).join(' '),
        lastName: (user.name || '').split(' ').slice(1).slice(-1)[0],
        email: user.email,
        emailVerified: true,
        enabled: true,
        credentials: setCredentials,
      },
      json: true,
    });

    const keycloakUser = await auth.getUserByUuid(newUserId);

    await Promise.all(user.roles.map(
      (role: any) => auth.addRoleToUser(keycloakUser.id, accessToken, role)
    ));

    return newUserId;
  };

export default createUserUseCase;
