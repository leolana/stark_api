import AuthProd from '../../../infra/auth/AuthProd';
import { UsuarioSolicitacaoSenha } from '../../../infra/database';

const recoverPasswordUseCase = (auth: AuthProd) =>

  (solicitacao, administrador = false) => {
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 1);

    solicitacao.expiraEm = dataExpiracao;

    return UsuarioSolicitacaoSenha
      .create(solicitacao)
      .then(novaSolicitacao => auth.mailer.enviar(
        {
          templateName: administrador
            ? auth.emailTemplates.ADMINISTRADOR_RESETA_SENHA
            : auth.emailTemplates.RESETAR_SENHA,
          destinatary: novaSolicitacao.email,
          substitutions: {
            linkRedefinirSenha: `${auth.settings.baseUrl}/redefinir-senha`
              + `/${novaSolicitacao.email}/${novaSolicitacao.codigo}`,
          },
        }));
  };

export default recoverPasswordUseCase;
