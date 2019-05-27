// tslint:disable:no-magic-numbers
import createUserUseCase from '../../../../../src/domain/usecases/auth/createUserUseCase';
import uuid = require('uuid');

describe('Infra :: Auth :: UseCases :: createUserUseCase', () => {

  const accessToken = uuid.v4();
  const keycloakUser = {
    id: uuid.v4()
  };

  const auth: any = {
    authenticateAsAdmin: async () => {
      return accessToken;
    },
    getUserByUuid: async (newUserId: string) => {
      expect(newUserId.length).toBe(36);
      expect(newUserId.split('-').length).toBe(5);
      return keycloakUser;
    },
    addRoleToUser: async (id: string, token: string, role: string) => {
      expect(id).toBe(keycloakUser.id);
      expect(token).toBe(accessToken);
      expect(role).toMatch(/^teste[12]$/);
    },
    settings: {}
  };

  test(
    `
      Should create an UUID to the new user being created at keycloak,
      this UUID should be the username for authentication at keycloak.
      Should set user data accordingly as received.
    `,
    async (done) => {
      try {
        const user = {
          password: uuid.v4(),
          name: 'Nome Usuário Teste',
          email: 'email@test.com',
          roles: ['teste1', 'teste2']
        };
        const setPassword = true;

        auth.request = async (config: any) => {
          expect(config.method).toBe('POST');
          expect(config.headers).toHaveProperty('Authorization');
          expect(config.body.username.length).toBe(36);
          expect(config.body.username.split('-').length).toBe(5);
          expect(config.body.firstName).toBe('Nome Usuário');
          expect(config.body.lastName).toBe('Teste');
          expect(config.body.email).toBe(user.email);
          expect(config.body.emailVerified).toBe(true);
          expect(config.body.enabled).toBe(true);
          expect(config.body.credentials[0].type).toBe('password');
          expect(config.body.credentials[0].temporary).toBe(false);
          expect(config.body.credentials[0].value).toBe(user.password);
          expect(config.json).toBe(true);
        };

        const createUser = createUserUseCase(
          auth
        );

        const result = await createUser(
          user,
          setPassword
        );

        expect(result.length).toBe(36);
        expect(result.split('-').length).toBe(5);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should create an UUID to the new user being created at keycloak,
      this UUID should be the username for authentication at keycloak.
      Should set user data accordingly as received.
    `,
    async (done) => {
      try {
        const user = {
          password: uuid.v4(),
          name: 'Nome Usuário Teste',
          email: 'email@test.com',
          roles: ['teste1', 'teste2']
        };
        const setPassword = false;

        auth.request = async (config: any) => {
          expect(config.method).toBe('POST');
          expect(config.headers).toHaveProperty('Authorization');
          expect(config.body.username.length).toBe(36);
          expect(config.body.username.split('-').length).toBe(5);
          expect(config.body.firstName).toBe('Nome Usuário');
          expect(config.body.lastName).toBe('Teste');
          expect(config.body.email).toBe(user.email);
          expect(config.body.emailVerified).toBe(true);
          expect(config.body.enabled).toBe(true);
          expect(config.body.credentials).toBeFalsy();
          expect(config.json).toBe(true);
        };

        const createUser = createUserUseCase(
          auth
        );

        const result = await createUser(
          user,
          setPassword
        );

        expect(result.length).toBe(36);
        expect(result.split('-').length).toBe(5);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
