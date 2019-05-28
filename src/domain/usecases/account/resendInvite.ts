import paramsEnum from '../../../domain/services/account/paramsEnum';
import { MailerEnv } from '../../../infra/environment/Environment';
import { Mailer } from '../../../infra/mailer';
import { UsuarioConvite } from '../../../infra/database/models/usuarioConvite';
import { LoggerInterface } from '../../../infra/logging';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { DateTime } from 'luxon';

const resendInvite = (logger: LoggerInterface, mailer: Mailer, emailTemplates: any, settings: MailerEnv) => async (
  userEmail: string
) => {

  const invite = await UsuarioConvite.findOne({
    where: {
      email: userEmail
    }
  });

  if (!invite) {
    throw new Exceptions.InviteNotFoundException();
  }

  invite.expiraEm = DateTime.local()
    .plus({ days: paramsEnum.prazoExpiracaoConviteEmDias })
    .toUTC().toJSDate();

  await invite.save();

  const inviteConfig = {
    templateName: emailTemplates.DEFINIR_SENHA,
    destinatary: invite.email,
    substitutions: {
      loginAcesso: invite.email,
      linkRedefinirSenha: `${settings.baseUrl}/registrar/${invite.email}/${invite.codigo}`
    }
  };

  mailer.enviar(inviteConfig).catch((error) => {
    logger.error(error);
  });

};

export default resendInvite;
