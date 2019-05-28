import { QueryInterface } from 'sequelize';

module.exports = {
  // tslint:disable-next-line:no-empty
  up: async (queryInterface: QueryInterface) => { },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('usuarioSolicitacaoSenha', null, {});
  },
};
