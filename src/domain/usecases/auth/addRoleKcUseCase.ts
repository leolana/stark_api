import AuthProd from '../../../infra/auth/AuthProd';
import { Usuario } from '../../../infra/database/models/usuario';
import { Membro } from '../../../infra/database/models/membro';

const addRoleKcUseCase = (auth: AuthProd) =>

  async (email, roles, pwd) => {
    if (pwd !== 'xpto') return {};

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{
        model: Membro,
        as: 'associacoes',
      }],
    });

    return await auth.changeUserRoles(usuario.id, [], roles);
  };

export default addRoleKcUseCase;
