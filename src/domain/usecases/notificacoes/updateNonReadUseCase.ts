import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { UsuarioNotificacao } from '../../../infra/database';

const updateNonReadUseCase = async (notifications: any[]) => {
  if (!notifications || !notifications.length) {
    return;
  }

  const ids = notifications.map(n => n.id);

  await UsuarioNotificacao.update({ status: usuarioNotificacaoEnum.lido }, {
    where: {
      notificacaoId: {
        $in: ids
      }
    },
  });
};

export default updateNonReadUseCase;
