import AuthProd from '../../../infra/auth/AuthProd';
import * as jwt from 'jsonwebtoken';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Membro, Usuario } from '../../../infra/database';

const generateSessionTokenUseCase = (auth: AuthProd) =>

  async (userUuid: string, idParticipante: number, impersonate = false) => {
    if (!impersonate) {
      const membroInclude: any = {
        model: Membro,
        as: 'associacoes',
        attributes: ['participanteId']
      };

      if (idParticipante) {
        membroInclude.where = { participanteId: idParticipante };
        membroInclude.required = true;
      }

      const usuario = await Usuario.findOne({
        where: { id: userUuid },
        include: [membroInclude]
      });

      if (!usuario) {
        throw new Exceptions.UserNotFoundException();
      }
    }

    const payload = {
      participante: idParticipante,
      participanteNome: '',
      participanteEstabelecimento: false,
      participanteFornecedor: false,
      acceptedTerms: false
    };

    if (idParticipante) {
      // todo: pegar participante.nome e se eh estabelecimento/fornecedor
      const participante = { nome: undefined };
      const countEstabelecimentos = 0;
      const countFornecedores = 0;

      payload.participanteNome = participante.nome;
      payload.participanteEstabelecimento = countEstabelecimentos > 0;
      payload.participanteFornecedor = countFornecedores > 0;
    }

    if (!impersonate) {
      // todo: conferir termos
      const acceptedTerms = true;
      payload.acceptedTerms = acceptedTerms;
    }

    const result = {
      sessionToken: null,
    };

    await new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        auth.settings.clientSecret,
        { expiresIn: '24h' },
        (error: any, token: string) => {
          if (error) {
            reject(error);
          } else {
            result.sessionToken = token;
            resolve();
          }
        }
      );
    });

    return result;
  };

export default generateSessionTokenUseCase;
