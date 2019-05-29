import { QueryInterface } from 'sequelize';

import rolesEnum from '../../../domain/services/auth/rolesEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    await queryInterface.bulkInsert(
      'usuarioConvite',
      [
        {
          participante: 1,
          codigo: '00000000-0000-0000-0000-000000000000',
          nome: 'Marcelo Néias',
          email: 'marcelo@itlab',
          celular: '11922223333',
          roles: [rolesEnum.super],
          convidadoPor: 'alpe@alpe.com.br',
          expiraEm: '2019-01-01',
          ...timestamp
        }
      ]
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('usuarioConvite', null, {});
  }
};
