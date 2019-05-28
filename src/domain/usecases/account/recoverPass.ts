import { Auth } from '../../../infra/auth';
import { Usuario } from '../../../infra/database/models/usuario';

const recoverPass = (auth: Auth) => async (userEmail: string) => {

  const user = Usuario.findOne({
    where: {
      email: userEmail
    }
  });

  const email = userEmail;

  if (user) {
    await auth.recoverPassword({ email });
    return true;
  }

  return false;
};

export default recoverPass;
