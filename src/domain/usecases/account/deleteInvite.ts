import { InviteNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';
import { UsuarioConvite } from '../../../infra/database/models/usuarioConvite';
import { Transaction } from 'sequelize';

const deleteInvite = async (inviteId: string, transaction: Transaction) => {
  const invite = await UsuarioConvite.findOne({
    transaction,
    where: { codigo: inviteId }
  });

  if (!invite) {
    throw new InviteNotFoundException();
  }

  await invite.destroy({ transaction });
};

export default deleteInvite;
