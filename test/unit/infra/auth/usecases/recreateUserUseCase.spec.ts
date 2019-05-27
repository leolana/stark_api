// tslint:disable:no-magic-numbers
import recreateUserUseCase from '../../../../../src/infra/auth/usecases/recreateUserUseCase';
import uuid = require('uuid');

describe('Infra :: Auth :: UseCases :: recreateUserUseCase', () => {

  const user = {
    id: uuid.v4(),
    email: 'email@test.com'
  };
  const newUserId = uuid.v4();

  const auth: any = {
    createUser: async (model: any, setPassword: boolean) => {
      expect(model).toBe(user);
      expect(setPassword).toBe(false);
      return newUserId;
    },
    recoverPassword: async (solicitacao: any, admin: boolean) => {
      expect(solicitacao.email).toBe(user.email);
      expect(admin).toBe(true);
    },
    settings: {}
  };

  test(
    `
      Should create user without deleting when the user uuid or email is not found.
    `,
    async (done) => {
      try {

        auth.getUserByUuid = async (id: string) => {
          expect(id).toBe(user.id);
        };
        auth.getUserByEmail = async (email: string) => {
          expect(email).toBe(user.email);
        };
        auth.authenticateAsAdmin = async () => {
          expect('not').toBe('here');
        };
        auth.request = async () => {
          expect('not').toBe('here');
        };

        const recreateUser = recreateUserUseCase(
          auth
        );

        const result = await recreateUser(
          user
        );

        expect(result).toBe(newUserId);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should delete user when its found.
      Should always create the user at keycloak.
    `,
    async (done) => {
      try {

        auth.getUserByUuid = async (id: string) => {
          expect(id).toBe(user.id);
          return {};
        };
        auth.getUserByEmail = async () => {
          expect('not').toBe('here becasue keycloak user was found by uuid');
        };
        auth.authenticateAsAdmin = async () => {
          return 'accessToken';
        };
        auth.request = async (config: any) => {
          expect(config.method).toBe('DELETE');
          expect(config.headers).toHaveProperty('Authorization');
        };

        const recreateUser = recreateUserUseCase(
          auth
        );

        const result = await recreateUser(
          user
        );

        expect(result).toBe(newUserId);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
