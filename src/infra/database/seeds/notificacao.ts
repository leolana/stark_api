import { QueryInterface, QueryTypes } from 'sequelize';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { DateTime } from 'luxon';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = new Date();
    const timestamp = {
      createdAt: now,
      updatedAt: now
    };

    const notificacaoesCategorias = [
      {
        ativo: true,
        categoria: 'Movidesk',
        ...timestamp
      }
    ];

    const categoriesInserted = <any[]>await queryInterface.bulkInsert(
      'notificacaoCategoria',
      notificacaoesCategorias
    );

    const notificacao = [
      {
        categoriaId: categoriesInserted[0].id,
        criadorId: null,
        mensagem: 'Estabelecimento It Lab (n° 1 / CNPJ:01510345000158) Integrou-se',
        dataExpiracao: DateTime.local().plus({ days: 5 }).toSQL(),
        ...timestamp
      },
    ];

    const notificationsInserted = <any[]>await queryInterface.bulkInsert(
      'notificacao',
      notificacao,
      {}
    );

    const usuario: any[] = await queryInterface.sequelize.query(
      'SELECT id FROM usuario LIMIT 1;',
      { type: QueryTypes.SELECT }
    );

    const usuarioNotificacao = [
      {
        notificacaoId: notificationsInserted[0].id,
        usuarioId: usuario[0].id,
        status: usuarioNotificacaoEnum.naoLido,
        ...timestamp
      }
    ];

    return queryInterface.bulkInsert(
      'usuarioNotificacao',
      usuarioNotificacao,
      {}
    );
  },
  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('usuarioNotificacao', null, {}),
      queryInterface.bulkDelete('notificacao', null, {}),
      queryInterface.bulkDelete('notificacaoCategoria', null, {})
    ]);
  },
};
