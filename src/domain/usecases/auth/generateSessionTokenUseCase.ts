import AuthProd from '../../../infra/auth/AuthProd';
import termoTipo from '../../../domain/entities/termoTipo';
import { DateTime } from 'luxon';
import * as jwt from 'jsonwebtoken';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const generateSessionTokenUseCase = (auth: AuthProd) =>

  async (userUuid: string, idParticipante: number, impersonate = false) => {
    if (!impersonate) {
      const membroInclude: any = {
        model: auth.db.entities.membro,
        as: 'associacoes',
        attributes: ['participanteId']
      };

      if (idParticipante) {
        membroInclude.where = { participanteId: idParticipante };
        membroInclude.required = true;
      }

      const usuario = await auth.db.entities.usuario.findOne({
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
      const [participante, countEstabelecimentos, countFornecedores] = await Promise.all(
        [
          auth.db.entities.participante.findOne({
            where: {
              id: idParticipante
            },
            attributes: ['nome']
          }),
          auth.db.entities.participanteEstabelecimento.count({
            where: {
              participanteId: idParticipante
            }
          }),
          auth.db.entities.participanteFornecedor.count({
            where: {
              participanteId: idParticipante
            }
          })
        ]
      );

      payload.participanteNome = participante.nome;
      payload.participanteEstabelecimento = countEstabelecimentos > 0;
      payload.participanteFornecedor = countFornecedores > 0;
    }

    if (!impersonate) {
      const termo = await auth.db.entities.termo.findOne({
        where: {
          inicio: {
            $lte: DateTime.local().startOf('day').toSQLDate()
          },
          fim: {
            $or: {
              $eq: null,
              $gt: DateTime.local().toSQLDate()
            }
          },
          tipo: payload.participanteEstabelecimento
            ? termoTipo.contratoMaeEstabelecimento
            : termoTipo.contratoMaeFornecedor
        },
        include: [
          {
            model: auth.db.entities.participanteAceiteTermo,
            as: 'aceites',
            where: {
              participanteId: idParticipante
            }
          }
        ],
      });

      payload.acceptedTerms = !!termo;
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
