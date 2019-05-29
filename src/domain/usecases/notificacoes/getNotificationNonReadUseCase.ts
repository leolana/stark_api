import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { DateTime } from 'luxon';
import { Usuario, Notificacao, NotificacaoCategoria, UsuarioNotificacao } from '../../../infra/database';

const getNotificationNonReadUseCase = async (userEmail: string) => {
  const user = await Usuario.findOne({
    attributes: ['id'],
    where: {
      email: userEmail
    }
  });

  if (!user) {
    return {
      count: 0,
      rows: [0]
    };
  }

  const today = DateTime.local().toSQLDate();

  const result = Notificacao.findAndCountAll({
    where: {
      dataExpiracao: { $gte: today }
    },
    include: [
      {
        model: NotificacaoCategoria,
        where: { ativo: true },
      },
      {
        model: UsuarioNotificacao,
        where: {
          usuarioId: user.id,
          status: usuarioNotificacaoEnum.naoLido
        },
        as: 'usuarioNotificacao'
      },
    ]
  });

  return (result);
};

export default getNotificationNonReadUseCase;
