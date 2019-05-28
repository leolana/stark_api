import AuthProd from '../../../infra/auth/AuthProd';
import { Usuario, Membro } from '../../../infra/database';

const addRoleKcUseCase = (auth: AuthProd) =>

  async (email: string, roles: string[], pwd: string) => {
    if (pwd !== 'xpto') {
      return {};
    }

    const usuario = await Usuario.findOne({
      where: {
        email
      },
      include: [{
        model: Membro,
        as: 'associacoes',
      }],
    });

    return await auth.changeUserRoles(usuario.id, [], roles);
  };

export default addRoleKcUseCase;
