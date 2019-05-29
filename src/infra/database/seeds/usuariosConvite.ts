import { QueryInterface, QueryTypes } from 'sequelize';

import rolesEnum from '../../../domain/services/auth/rolesEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const estabelecimento: any[] = await sequelize.query(
      'SELECT "participanteId" FROM "participanteEstabelecimento" LIMIT 1;',
      { type: QueryTypes.SELECT }
    );

    return queryInterface.bulkInsert(
      'usuarioConvite',
      [
        {
          participante: estabelecimento[0].participanteId,
          codigo: '00000000-0000-0000-0000-000000000000',
          nome: 'Marcelo Néias',
          email: 'marcelo@itlab',
          celular: '11922223333',
          roles: [rolesEnum.super],
          convidadoPor: 'alpe@alpe.com.br',
          expiraEm: '2019-01-01',
          ...timestamp
        }
      ],
      {}
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('usuarioConvite', null, {});
  }
};
