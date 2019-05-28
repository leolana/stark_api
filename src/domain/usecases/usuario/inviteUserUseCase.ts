import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-typescript';
import { Auth } from '../../../infra/auth';
import { AccountUseCases } from '../account';
import { Usuario, UsuarioConvite } from '../../../infra/database';

const inviteUserUseCase = (
  db: Sequelize,
  auth: Auth,
  accountUseCases: AccountUseCases
) =>

  async (
    nome: string,
    email: string,
    celular: string,
    roles: any[],
    participanteId: number,
    convidadoPor: string
  ) => {
    const transaction = await db.transaction();

    try {
      const user = await Usuario.findOne({
        transaction,
        where: { email }
      });

      const invite = await UsuarioConvite.findOne({
        transaction,
        where: { email }
      });

      if (user) {
        throw new Exceptions.UserAlreadyExistsException();
      }

      if (invite && invite.expiraEm >= new Date()) {
        throw new Exceptions.InviteAlreadyExistsException();
      }

      if (invite) {
        await accountUseCases.deleteInvite(invite.codigo, transaction);
      }

      await auth.inviteUser(
        {
          nome,
          email,
          celular,
          roles,
          convidadoPor,
          participante: participanteId
        },
        transaction
      );

      await transaction.commit();
      return true;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

export default inviteUserUseCase;
