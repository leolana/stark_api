const sendNotification = (db, mailer, mailerSettings, logger) => (cession) => {
  const contatoInclude = () => ({
    model: db.entities.participanteContato,
    as: 'contatos',
    attributes: ['participanteId', 'email'],
    where: { ativo: true },
  });

  const participanteInclude = () => ({
    model: db.entities.participante,
    as: 'participante',
    attributes: ['id', 'nome'],
    include: [contatoInclude()],
    where: { ativo: true },
  });

  const findSupplier = supplierId => db.entities.participanteFornecedor
    .findOne({
      where: { participanteId: supplierId },
      attributes: ['participanteId'],
      include: [participanteInclude()],
    });

  const findEstablishment = establishmentId => (
    db.entities.participanteEstabelecimento.findOne({
      where: { participanteId: establishmentId },
      attributes: ['participanteId'],
      include: [participanteInclude()],
    })
  );

  const sendMail = async (codigoCessao, id, recipient, template, options) => {
    try {
      await mailer.enviar({
        templateName: template,
        destinatary: recipient,
        substitutions: {
          codigoCessao,
          linkCessaoAprovacao: `${mailerSettings.baseUrl}/cessao/detalhe/${id}`,
          ...options,
        },
      });
    } catch (err) {
      logger.error(err);
    }
  };

  const sendMailSupplier = (codigoCessao, cessionId, recipient, name) => sendMail(
    codigoCessao,
    cessionId,
    recipient,
    mailer.emailTemplates.SOLICITAR_CESSAO_FORNECEDOR,
    { estabelecimento: name },
  );

  const sendMailEstablishment = (codigoCessao, cessionId, recipient, name) => sendMail(
    codigoCessao,
    cessionId,
    recipient,
    mailer.emailTemplates.SOLICITAR_CESSAO_ESTABELECIMENTO,
    { fornecedor: name },
  );

  const notify = (supplier, establishment) => Promise.all([
    sendMailSupplier(
      cession.codigoCessao,
      cession.id,
      supplier.participante.contatos[0].email,
      establishment.participante.nome
    ),
    sendMailEstablishment(
      cession.codigoCessao,
      cession.id,
      establishment.participante.contatos[0].email,
      supplier.participante.nome,
    ),
  ]);

  return Promise.all([
    findSupplier(
      cession.participanteVinculo.participanteFornecedorId
    ),
    findEstablishment(
      cession.participanteVinculo.participanteEstabelecimentoId
    ),
  ])
    .then(results => notify(...results));
};

export default sendNotification;
