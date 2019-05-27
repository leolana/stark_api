import AuthProd from '../../../infra/auth/AuthProd';

const addRoleKcUseCase = (auth: AuthProd) =>

  async (email, roles, pwd) => {
    if (pwd !== 'xpto') return {};

    const usuario = await auth.db.entities.usuario.findOne({
      where: { email },
      include: [{
        model: auth.db.entities.membro,
        as: 'associacoes',
      }],
    });

    return await auth.changeUserRoles(usuario.id, [], roles);
  };

export default addRoleKcUseCase;
