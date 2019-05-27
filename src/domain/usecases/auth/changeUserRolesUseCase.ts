import AuthProd from '../../../infra/auth/AuthProd';

const changeUserRolesUseCase = (auth: AuthProd) =>

  async (userId: string, rolesToRemove: string[], rolesToAdd: string[]) => {
    const keycloakUser = await auth.getUserByUuid(userId);
    const accessToken = await auth.authenticateAsAdmin();

    return await Promise.all([
      ...rolesToRemove.map(
        r => auth.removeRoleFromUser(keycloakUser.id, accessToken, r)
      ),
      ...rolesToAdd.map(
        r => auth.addRoleToUser(keycloakUser.id, accessToken, r)
      )
    ]);
  };

export default changeUserRolesUseCase;
