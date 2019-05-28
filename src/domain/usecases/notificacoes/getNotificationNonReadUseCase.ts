import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { DateTime } from 'luxon';
import { Usuario } from '../../../infra/database/models/usuario';
import { Notificacao } from '../../../infra/database/models/notificacao';
import { NotificacaoCategoria } from '../../../infra/database/models/notificacaoCategoria';
import { UsuarioNotificacao } from '../../../infra/database/models/usuarioNotificacao';

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
