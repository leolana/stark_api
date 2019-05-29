import { QueryInterface } from 'sequelize';

import rolesEnum from '../../../domain/services/auth/rolesEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = new Date();
    const timestamp = {
      createdAt: now,
      updatedAt: now
    };

    const usuarioAlpe = {
      id: '8a799af7-22f9-417d-9602-c49c80ce5a23',
      nome: 'Alpe',
      email: 'alpe@alpe.com.br',
      celular: '11988887777',
      roles: [rolesEnum.boAdministrador],
      ...timestamp
    };

    const usuarioEC = {
      id: '0b6c801e-a330-48dc-9ccd-53998624ded3',
      nome: 'EC',
      email: 'ec@alpe.com.br',
      celular: '11988887777',
      roles: [rolesEnum.ecAdministrador],
      ...timestamp
    };

    const usuarioFornecedor = {
      id: '5af6002e-1e1d-41f1-92a2-df41b266e0f4',
      nome: 'Fornecedor',
      email: 'fornecedor@alpe.com.br',
      celular: '11988887777',
      roles: [rolesEnum.fcAdministrador],
      ...timestamp
    };

    await queryInterface.bulkInsert(
      'usuario',
      [
        usuarioAlpe,
        usuarioEC,
        usuarioFornecedor
      ]
    );

    await queryInterface.bulkInsert(
      'membro',
      [
        {
          usuarioId: usuarioEC.id,
          participanteId: 1,
          ...timestamp
        },
        {
          usuarioId: usuarioFornecedor.id,
          participanteId: 2,
          ...timestamp
        }
      ]
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('membro', null, {});
    await queryInterface.bulkDelete('usuario', null, {});
  }
};
