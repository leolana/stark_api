// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import * as Exceptions from '../../../../../src/interfaces/rest/exceptions/ApiExceptions';
import generateSessionTokenUseCase from '../../../../../src/infra/auth/usecases/generateSessionTokenUseCase';
import termoTipo from '../../../../../src/domain/entities/termoTipo';
import uuid = require('uuid');

describe('Infra :: Auth :: UseCases :: generateSessionTokenUseCase', () => {

  test(
    `
      Should validate if there is an user with (userUuid) received.
      Shouldn't require (membro) if no (idParticipante) is set.
      Should throw custom exception when user is not found.
    `,
    async (done) => {
      try {
        const userUuid = uuid.v4();
        const idParticipante = 0;

        database.entities.usuario.findOne = async (config: any) => {
          expect(config.where.id).toBe(userUuid);
          expect(config.include[0].as).toBe('associacoes');
          expect(config.include[0]).not.toHaveProperty('where');
          expect(config.include[0].required).toBeFalsy();
          return null;
        };

        const auth: any = {
          db: database
        };

        const generateSessionToken = generateSessionTokenUseCase(
          auth
        );

        await generateSessionToken(
          userUuid,
          idParticipante
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe(new Exceptions.UserNotFoundException().message);
      }

      done();
    }
  );

  test(
    `
      Should validate if there is an user with (userUuid) received.
      Should require (membro) if (idParticipante) is set.
      Should throw custom exception when user is not found.
    `,
    async (done) => {
      try {
        const userUuid = uuid.v4();
        const idParticipante = 7;

        database.entities.usuario.findOne = async (config: any) => {
          expect(config.where.id).toBe(userUuid);
          expect(config.include[0].as).toBe('associacoes');
          expect(config.include[0].where.participanteId).toBe(idParticipante);
          expect(config.include[0].required).toBe(true);
          return null;
        };

        const auth: any = {
          db: database
        };

        const generateSessionToken = generateSessionTokenUseCase(
          auth
        );

        await generateSessionToken(
          userUuid,
          idParticipante
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe(new Exceptions.UserNotFoundException().message);
      }

      done();
    }
  );

  test(
    `
      Should validate if there is an user with (userUuid) received.
      Should require (membro) if (idParticipante) is set.
      Should check if the participant termo was accepted.
      Should set participant type as establishment or provider.
      Should return a valid sessionToken.
    `,
    async (done) => {
      try {
        const userUuid = uuid.v4();
        const idParticipante = 7;

        database.entities.usuario.findOne = async (config: any) => {
          expect(config.where.id).toBe(userUuid);
          expect(config.include[0].as).toBe('associacoes');
          expect(config.include[0].where.participanteId).toBe(idParticipante);
          expect(config.include[0].required).toBe(true);
          return {};
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(idParticipante);
          return {};
        };

        database.entities.participanteEstabelecimento.count = async (config: any) => {
          expect(config.where.participanteId).toBe(idParticipante);
          return 1;
        };

        database.entities.participanteFornecedor.count = async (config: any) => {
          expect(config.where.participanteId).toBe(idParticipante);
          return 0;
        };

        database.entities.termo.findOne = async (config: any) => {
          expect(config.where).toHaveProperty('inicio');
          expect(config.where).toHaveProperty('fim');
          expect(config.where.tipo).toBe(termoTipo.contratoMaeEstabelecimento);
        };

        const auth: any = {
          db: database,
          settings: {
            clientSecret: '123'
          }
        };

        const generateSessionToken = generateSessionTokenUseCase(
          auth
        );

        const result = await generateSessionToken(
          userUuid,
          idParticipante
        );

        expect(result.sessionToken.split('.').length).toBe(3);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
