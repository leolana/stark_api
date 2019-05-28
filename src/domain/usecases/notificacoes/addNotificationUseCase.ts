import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { Usuario } from '../../../infra/database/models/usuario';
import { NotificacaoCategoria } from '../../../infra/database/models/notificacaoCategoria';
import { Notificacao } from '../../../infra/database/models/notificacao';
import { UsuarioNotificacao } from '../../../infra/database/models/usuarioNotificacao';

const addNotificationUseCase = async (
  data: any,
  role: string[],
  userEmail: string,
  participanteId?: number
) => {
  if (!participanteId && !data.mensagem) {
    throw new Exceptions.ParticipanteNotFoundException();
  }

  if (!userEmail) {
    throw new Exceptions.UserNotFoundException();
  }

  const usuarios = await Usuario.findAll({
    attributes: ['id', 'email'],
    where: { roles: { $overlap: role }, ativo: true }
  },
  );

  if (!usuarios.length) {
    throw new Exceptions.UserNotFoundException();
  }

  const criador = usuarios.find(u => u.email === userEmail);

  const notifications = usuarios.map(u => ({
    ...data,
    criadorId: criador.id,
    usuarioNotificacao: {
      status: u.email === userEmail ? usuarioNotificacaoEnum.lido : usuarioNotificacaoEnum.naoLido,
      usuarioId: u.id
    }
  }));

  const notificacaoCategoria = await NotificacaoCategoria.findOne({
    where: {
      id: data.categoriaId
    }
  });

  if (!notificacaoCategoria) {
    throw new Exceptions.NotificationCategoryNotFoundException();
  }

  const promises = notifications.map((n) => {
    return Notificacao.create(n, {
      include: [
        {
          model: UsuarioNotificacao,
          as: 'usuarioNotificacao'
        }
      ]
    });
  });
  await Promise.all(promises);

};

export default addNotificationUseCase;
