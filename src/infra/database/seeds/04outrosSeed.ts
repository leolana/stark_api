import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // ...
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('usuarioSolicitacaoSenha', null, {});
  },
};
