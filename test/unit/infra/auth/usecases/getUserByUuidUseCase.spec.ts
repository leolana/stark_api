// tslint:disable:no-magic-numbers
import getUserByUuidUseCase from '../../../../../src/domain/usecases/auth/getUserByUuidUseCase';
import uuid = require('uuid');
import * as Exceptions from '../../../../../src/interfaces/rest/exceptions/ApiExceptions';

describe('Infra :: Auth :: UseCases :: getUserByUuidUseCase', () => {

  test(
    `
      Should throw custom exception if multiple users are found at keycloak
    `,
    async (done) => {
      try {

        const userId = uuid.v4();
        const twoUsers = [{}, {}];

        const auth: any = {
          authenticateAsAdmin: async () => {
            return 'accessToken';
          },
          request: async (config: any) => {
            expect(config.method).toBe('GET');
            expect(config.headers).toHaveProperty('Authorization');
            expect(config.json).toBe(true);
            expect(config.qs.username).toBe(userId);
            return twoUsers;
          },
          settings: {}
        };

        const getUserByUuid = getUserByUuidUseCase(
          auth
        );

        await getUserByUuid(
          userId
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe(new Exceptions.MultipleUsersFoundException().message);
      }

      done();
    }
  );

  test(
    `
      Should return found user at kwycloak
    `,
    async (done) => {
      try {

        const userId = uuid.v4();
        const keycloakUser = {};

        const auth: any = {
          authenticateAsAdmin: async () => {
            return 'accessToken';
          },
          request: async (config: any) => {
            expect(config.method).toBe('GET');
            expect(config.headers).toHaveProperty('Authorization');
            expect(config.json).toBe(true);
            expect(config.qs.username).toBe(userId);
            return [keycloakUser];
          },
          settings: {}
        };

        const getUserByUuid = getUserByUuidUseCase(
          auth
        );

        const found = await getUserByUuid(
          userId
        );

        expect(found).toBe(keycloakUser);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
