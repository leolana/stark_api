import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';
import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import tiposPessoa from '../../../domain/entities/tiposPessoa';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const indicacoes = [
      {
        participanteId: null,
        tipoPessoa: tiposPessoa.juridica,
        documento: '13769015000160',
        nome: 'Xerxes Autopeças',
        email: 'xerxes@itlab.com.br',
        telefone: '1128943783',
        canalEntrada: participateNominationSourceEnum.indicacaoPorEc,
        usuario: defaultUser,
        status: participanteIndicacaoStatus.pendente,
        ...timestamp
      },
      {
        participanteId: null,
        tipoPessoa: tiposPessoa.juridica,
        documento: '37404888000138',
        nome: 'Navarro Oficinas',
        email: 'navarro@itlab.com.br',
        telefone: '1144539801',
        canalEntrada: participateNominationSourceEnum.indicacaoPorFornecedor,
        usuario: defaultUser,
        status: participanteIndicacaoStatus.pendente,
        ...timestamp
      }
    ];

    const [ecs, fornecedores] = (await Promise.all([
      sequelize.query(
        'SELECT "participanteId" FROM "participanteEstabelecimento" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT "participanteId" FROM "participanteFornecedor" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
    ])) as any[][];

    const ec = ecs[0].participanteId;
    const fornecedor = fornecedores[0].participanteId;

    indicacoes.forEach((i) => {
      i.participanteId = i.canalEntrada === participateNominationSourceEnum.indicacaoPorEc
        ? ec
        : fornecedor;
    });

    return queryInterface.bulkInsert('participanteIndicacao', indicacoes, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('indicacaoFornecedorFalha', null, {});
    return queryInterface.bulkDelete('participanteIndicacao', null, {});
  }
};
