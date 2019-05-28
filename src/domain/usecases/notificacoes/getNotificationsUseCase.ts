import { Usuario, Notificacao, NotificacaoCategoria, UsuarioNotificacao } from '../../../infra/database';

const getNotificationUseCase = async (page: number, limit: number, userObj: { email: string }) => {

  const user = await Usuario.findOne({
    attributes: ['id'],
    where: {
      email: userObj.email
    }
  });

  if (!user) {
    return null;
  }

  const notificacoes = await Notificacao.findAll({
    limit,
    order: [['createdAt', 'DESC']],
    offset: page,
    include: [
      {
        model: NotificacaoCategoria,
        where: { ativo: true },
      },
      {
        model: UsuarioNotificacao,
        where: { usuarioId: user.id },
        as: 'usuarioNotificacao'
      },
    ]
  });

  return (notificacoes);
};

export default getNotificationUseCase;
