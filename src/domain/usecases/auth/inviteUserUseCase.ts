import AuthProd from '../../../infra/auth/AuthProd';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Usuario } from '../../../infra/database/models/usuario';
import { Membro } from '../../../infra/database/models/membro';
import { UsuarioConvite } from '../../../infra/database/models/usuarioConvite';
import paramsEnum from '../../../domain/services/account/paramsEnum';

const inviteUserUseCase = (auth: AuthProd) =>

  (convite, transaction) => {
    const findUser = () => Usuario.findOne({
      where: { email: convite.email },
      include: [{
        model: Membro,
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
        Membro.create(
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
        + paramsEnum.prazoExpiracaoConviteEmDias);

      convite.expiraEm = dataExpiracao;

      return UsuarioConvite
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
