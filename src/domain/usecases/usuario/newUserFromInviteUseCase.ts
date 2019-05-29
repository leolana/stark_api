import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Auth } from '../../../infra/auth';
import { UsuarioConvite, Usuario, Membro } from '../../../infra/database';
import uuid = require('uuid');

const newUserFromInviteUseCase = (
  auth: Auth
) =>

  async (
    codigo: string,
    email: string,
    password: string,
    participantRoles: any[]
  ) => {

    const [invite, user] = await Promise.all([
      UsuarioConvite.findOne({
        where: <any>{
          codigo,
          email,
          expiraEm: { $gte: new Date() }
        }
      }),
      Usuario.findOne({
        where: { email }
      })
    ]);

    if (!invite) {
      throw new Exceptions.InviteNotFoundException();
    }

    if (user) {
      throw new Exceptions.UserAlreadyExistsException();
    }

    const newUser = await Usuario.create({
      id: uuid.v4(),
      nome: invite.nome,
      email: invite.email,
      celular: invite.celular,
      roles: invite.roles
    });

    await auth.createUser({
      password,
      username: newUser.id,
      email: invite.email,
      name: invite.nome,
      roles: invite.roles
    });

    if (invite.roles.some(role => participantRoles.includes(role))) {
      await Membro.create({
        usuarioId: newUser.id,
        participanteId: invite.participante
      });
    }

    await invite.destroy();

  };

export default newUserFromInviteUseCase;
