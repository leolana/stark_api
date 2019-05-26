const listService = db => (recusaTipoId) => {
  const find = id => db.entities.motivoRecusa
    .findAll({
      attributes: ['descricao', 'requerObservacao'],
      where: {
        ativo: true,
      },
      include: [{
        model: db.entities.motivoTipoRecusa,
        as: 'tiposRecusa',
        where: { recusaTipoId: id },
        attributes: ['id'],
        required: true,
      }],
    });

  const map = (data) => {
    const motivos = data.map(m => ({
      descricao: m.descricao,
      requerObservacao: m.requerObservacao,
      id: m.tiposRecusa[0].id,
    }));

    return motivos;
  };

  return find(recusaTipoId)
    .then(map);
};

export default listService;
