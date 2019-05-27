// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import signinUseCase from '../../../../../src/domain/usecases/account/signinUseCase';
import * as Exceptions from '../../../../../src/interfaces/rest/exceptions/ApiExceptions';

// tslint:disable:no-big-function
describe('Domain :: UseCases :: Account :: signinUseCase', () => {

  test(
    `
      When multiple users are found, should log custom exception error,
      and should also throw login failed exception.
      Shouldn't give hints to the user about why the login failed.
    `,
    async (done) => {
      try {
        const usuarios = [
          { dataValues: {} },
          { dataValues: {} }
        ];

        database.entities.usuario.findAll = async (config: any) => {
          expect(Array.isArray(config.where)).toBe(true);
          return usuarios;
        };

        const auth = null;
        const logger: any = {
          info: async () => null,
          error: async (error: any) => {
            expect(error.message).toBe(new Exceptions.MultipleUsersFoundException().message);
          }
        };

        const signin = signinUseCase(
          database,
          auth,
          logger
        );

        const email = null;
        const documento = null;
        const password = null;

        await signin(
          email,
          documento,
          password
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe(new Exceptions.LoginFailedException().message);
      }

      done();
    }
  );

  test(
    `
      When no user is found, should log custom exception error,
      and should also throw login failed exception.
      Shouldn't give hints to the user about why the login failed.
    `,
    async (done) => {
      try {
        const usuarios = [];

        database.entities.usuario.findAll = async (config: any) => {
          expect(Array.isArray(config.where)).toBe(true);
          return usuarios;
        };

        const auth = null;
        const logger: any = {
          info: async () => null,
          error: async (error: any) => {
            expect(error.message).toBe(new Exceptions.UserNotFoundException().message);
          }
        };

        const signin = signinUseCase(
          database,
          auth,
          logger
        );

        const email = null;
        const documento = null;
        const password = null;

        await signin(
          email,
          documento,
          password
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe(new Exceptions.LoginFailedException().message);
      }

      done();
    }
  );

  test(
    `
      Should try to authenticate with found (user.id)
    `,
    async (done) => {
      try {
        const usuarios = [
          { dataValues: { id: 8 } }
        ];

        const email = null;
        const documento = null;
        const credentials = 'password';

        database.entities.usuario.findAll = async (config: any) => {
          expect(Array.isArray(config.where)).toBe(true);
          return usuarios;
        };

        const tokens = {};

        const auth: any = {
          authenticate: async (userUuid: string, password: string) => {
            expect(userUuid).toBe(usuarios[0].dataValues.id);
            expect(password).toBe(credentials);
            return tokens;
          }
        };

        const logger: any = {
          info: async () => null,
          error: async (error: any) => {
            expect(error).toBe(null);
          }
        };

        const signin = signinUseCase(
          database,
          auth,
          logger
        );

        const result = await signin(
          email,
          documento,
          credentials
        );

        expect(result).toBe(tokens);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should try to authenticate with found (user.email)
      when authenticating with found (user.id) fails
    `,
    async (done) => {
      try {
        const usuarios = [
          { dataValues: { id: 8, email: 'ec@alpe.com.br' } }
        ];

        const email = null;
        const documento = null;
        const credentials = 'password';

        database.entities.usuario.findAll = async (config: any) => {
          expect(Array.isArray(config.where)).toBe(true);
          return usuarios;
        };

        const tokens = {};
        let authenticateTentatives = 0;

        const auth: any = {
          authenticate: async (userUuid: string, password: string) => {
            authenticateTentatives += 1;

            if (authenticateTentatives === 1) {
              expect(userUuid).toBe(usuarios[0].dataValues.id);
              expect(password).toBe(credentials);
              throw new Exceptions.UserNotFoundException();
            }

            if (authenticateTentatives === 2) {
              expect(userUuid).toBe(usuarios[0].dataValues.email);
              expect(password).toBe(credentials);
              return tokens;
            }

            return expect('not').toBe('here');
          }
        };

        const logger: any = {
          info: async () => null,
          error: async (error: any) => {
            expect(error).toBe(null);
          }
        };

        const signin = signinUseCase(
          database,
          auth,
          logger
        );

        const result = await signin(
          email,
          documento,
          credentials
        );

        expect(authenticateTentatives).toBe(2);
        expect(result).toBe(tokens);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
