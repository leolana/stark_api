import { Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { typeEnum as tiposParticipante } from '../../domain/services/participante/typeEnum';
import { rolesEnum } from '../../domain/services/auth/rolesEnum';
import { KeycloakUserRepresentation } from './AuthTypes';

interface Auth {
  /**
   * Pega os tokens usando o refreshToken
   */
  refreshToken: (refreshToken: string) => Promise<{ accessToken: string, refreshToken: string }>;

  /**
   * Informa se a requisição (req) foi feita por um dos participantes em (tipos).
   */
  isParticipante: (req: Request, ...tipos: tiposParticipante[]) => boolean;

  /**
   * Middleware que valida a requisição (req).
   *
   * Se feita por um dos participantes em (tipos), será chamado o pŕoximo middleware (next).
   * Se não feita por um dos participantes em (tipos), irá estourar uma exception de Acesso Negado.
   */
  requireParticipante: (...tipos: tiposParticipante[]) => (req: Request, res: Response, next: NextFunction) => any;

  /**
   * 1. Valida se o usuário é membro do participante (idParticipante) quando não é (impersonate)
   * 2. Busca os dados do participante estabelecimento ou fornecedor
   * 3. Verifica se o participante já aceitou os termos quando não é (impersonate)
   * 4. Pega o (sessionToken) usando o (jwt.sign)
   */
  generateSessionToken: (
    userUuid: string,
    idParticipante: number,
    impersonate: boolean
  ) => Promise<{ sessionToken: string }>;

  /**
   * Retorna um array com as roles do usuário que fez a requisição (req).
   */
  getUserRoles: (req: Request) => rolesEnum[];

  /**
   * Retorna se o usuário que fez a requisição (req) possui alguma das roles exigidas para acesso (accessRoles).
   *
   * Se o usuário da requisição (req) tiver a role "super" o método sempre retornará true.
   */
  hasPermission: (req: Request, ...accessRoles: rolesEnum[]) => boolean;

  changeUserRoles: any;
  getRolesIds: any;

  /**
   * Autentica o login userUuid/pass no keycloak
   */
  authenticate: (userUuid: string, pass: string) => Promise<{ accessToken: string, refreshToken: string }>;

  require: Function;
  inviteUser: (convite: any, transaction?: any) => any;
  createUser: any;
  updateUserData: any;

  /**
   * Apaga o usuário no Keycloak com o indentificador passado (userId),
   * Depois recria o mesmo usuário, gerando um novo id,
   * Envia um email ao usuário para recriar a senha
   * e retorna o id criado
   */
  recreateUser: (user: any) => Promise<string>;

  /**
   * Encontra o usuário com identificador (userId) no keycloak e atualiza
   * a propriedade (enabled) para o valor informado em (userStatus: boolean)
   */
  updateUserStatus: (userId: string, userStatus: boolean) => Promise<void>;

  changeUserPassword: any;
  recoverPassword: any;

  /**
   * Retorna o (accessToken) para acesso ao keyCloak como admin
   */
  authenticateAsAdmin: () => Promise<string>;

  /**
   * Retorna os dados do Keycloak referentes ao usuário identificado por (userId)
   * Os dados retornados estão mapeados na interface (KeycloakUserRepresentation)
   */
  getUserByUuid: (userId: string) => Promise<KeycloakUserRepresentation>;

  /**
   * Retorna os dados do Keycloak referentes ao usuário identificado por (userEmail)
   * Os dados retornados estão mapeados na interface (KeycloakUserRepresentation)
   */
  getUserByEmail: (userEmail: string) => Promise<KeycloakUserRepresentation>;

  /**
 * Retorna um array com as roles do id do usuário passado por parametro.
 */
  getInfoUser: (userId: string) => Promise<KeycloakUserRepresentation>;

  /**
   * Atualiza todos os dados no Keycloak.
   * Os dados devem estar correspondentes à interface (KeycloakUserRepresentation)
   * que é retornada no método auth.getUserByUuid(userId)
   */
  putUser: (user: KeycloakUserRepresentation) => Promise<void>;

  addRoleKc: (email, roles, pwd) => any;
}

export default Auth;
