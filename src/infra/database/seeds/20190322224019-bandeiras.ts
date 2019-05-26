import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const bandeiras = [
      { nome: 'Mastercard', ...timestamp },
      { nome: 'Visa', ...timestamp },
      { nome: 'Elo', ...timestamp },
      { nome: 'Hipercard', ...timestamp },
    ];

    return queryInterface.bulkInsert('bandeira', bandeiras, {});
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('bandeira', null, {});
  },
};
