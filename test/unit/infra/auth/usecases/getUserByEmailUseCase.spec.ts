// tslint:disable:no-magic-numbers
import getUserByEmailUseCase from '../../../../../src/domain/usecases/auth/getUserByEmailUseCase';
import * as Exceptions from '../../../../../src/interfaces/rest/exceptions/ApiExceptions';

describe('Infra :: Auth :: UseCases :: getUserByEmailUseCase', () => {

  test(
    `
      Should throw custom exception if multiple users are found at keycloak
    `,
    async (done) => {
      try {

        const userEmail = 'test@gmail.com';
        const twoUsers = [{}, {}];

        const auth: any = {
          authenticateAsAdmin: async () => {
            return 'accessToken';
          },
          request: async (config: any) => {
            expect(config.method).toBe('GET');
            expect(config.headers).toHaveProperty('Authorization');
            expect(config.json).toBe(true);
            expect(config.qs.email).toBe(userEmail);
            return twoUsers;
          },
          settings: {}
        };

        const getUserByEmail = getUserByEmailUseCase(
          auth
        );

        await getUserByEmail(
          userEmail
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

        const userEmail = 'test@gmail.com';
        const keycloakUser = {};

        const auth: any = {
          authenticateAsAdmin: async () => {
            return 'accessToken';
          },
          request: async (config: any) => {
            expect(config.method).toBe('GET');
            expect(config.headers).toHaveProperty('Authorization');
            expect(config.json).toBe(true);
            expect(config.qs.email).toBe(userEmail);
            return [keycloakUser];
          },
          settings: {}
        };

        const getUserByEmail = getUserByEmailUseCase(
          auth
        );

        const found = await getUserByEmail(
          userEmail
        );

        expect(found).toBe(keycloakUser);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
