import AuthProd from '../AuthProd';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { paramsEnum as accountParams } from '../../../domain/services/account/paramsEnum';

const inviteUserUseCase = (auth: AuthProd) =>

  (convite, transaction) => {
    const findUser = () => auth.db.entities.usuario.findOne({
      where: { email: convite.email },
      include: [{
        model: auth.db.entities.membro,
        as: 'associacoes',
      }],
    });

    const checaUsuarioMembro = (usuario) => {
      if (!usuario) return true;

      if (usuario.associacoes && usuario.associacoes.some(
        a => a.participanteId === convite.participante
      )) {
        throw new Exceptions.UserIsAlreadyAMemberException();
      }

      usuario.roles.push(...convite.roles);

      return Promise.all([
        usuario.update(
          { roles: usuario.roles },
          { transaction }),
        auth.db.entities.membro.create(
          {
            usuarioId: usuario.id,
            participanteId: convite.participante,
          },
          { transaction }
        ),
        auth.changeUserRoles(usuario.id, [], convite.roles),
      ])
        .then(() => false);
    };

    const enviaConvite = (invite) => {
      if (!invite) return null;

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate()
        + accountParams.prazoExpiracaoConviteEmDias);

      convite.expiraEm = dataExpiracao;

      return auth.db.entities.usuarioConvite
        .create(convite, { transaction })
        .then(novoConvite => auth.mailer.enviar(
          {
            templateName: auth.emailTemplates.DEFINIR_SENHA,
            destinatary: novoConvite.email,
            substitutions: {
              loginAcesso: novoConvite.email,
              linkRedefinirSenha: `${auth.settings.baseUrl}/registrar/`
                + `${novoConvite.email}/${novoConvite.codigo}`,
            },
          }));
    };

    return findUser()
      .then(checaUsuarioMembro)
      .then(enviaConvite);
  };

export default inviteUserUseCase;
