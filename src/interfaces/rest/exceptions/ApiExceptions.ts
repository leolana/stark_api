import * as Errors from '../errors/ApiErrors';

export class ProviderNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('fornecedor-nao-encontrado');
  }
}

export class NotAvailableOptionException extends Errors.PreconditionFailedError {
  constructor() {
    super('option-not-available');
  }
}

export class NotAuthorizedException extends Errors.UnauthorizedError {
  constructor() {
    super('nao-autorizado');
  }
}

export class LoginFailedException extends Errors.PreconditionFailedError {
  constructor() {
    super('email-senha-invalido');
  }
}

export class NotificationCategoryNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('notification-category-not-found');
  }
}

export class NotImplementedException extends Errors.NotImplementedError {
  constructor() {
    super('not-implemented');
  }
}

export class InviteNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('invite-not-found');
  }
}

export class AccessDeniedException extends Errors.UnauthorizedError {
  constructor() {
    super('access-denied');
  }
}

export class UserIsAlreadyAMemberException extends Errors.ConflictError {
  constructor() {
    super('usuario-ja-e-membro');
  }
}

export class KeycloakException extends Errors.BadRequestError {
  constructor(methodName: string) {
    super(`error-keycloak-${formatAsTagName(methodName)}`);
  }
}

function formatAsTagName(str: string) {
  return String(str)
    .replace(/(?!^)[A-Z]/g, c => `-${c.toLowerCase()}`)
    .replace(/password/g, 'pass');
}

export class NoRoleSuppliedException extends Errors.BadRequestError {
  constructor() {
    super('no-role-supplied');
  }
}

export class UserAlreadyExistsException extends Errors.ConflictError {
  constructor() {
    super('usuario-existente');
  }
}

export class UserNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('usuario-not-found');
  }
}

export class MultipleUsersFoundException extends Errors.PreconditionFailedError {
  constructor() {
    super('multiple-users-found');
  }
}

export class KeycloakUserNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('usuario-keycloak-not-found');
  }
}

export class InvalidTypeOfPersonException extends Errors.NotFoundError {
  constructor() {
    super('tipoPessoa-invalido');
  }
}

export class InviteAlreadyExistsException extends Errors.ConflictError {
  constructor() {
    super('convite-existente');
  }
}

export class InvalidSentDataException extends Errors.BadRequestError {
  constructor() {
    super('invalid-sent-data');
  }
}

export class RegisterNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('registro-nao-encontrado');
  }
}

export class InvalidPersonTypeException extends Errors.BadRequestError {
  constructor() {
    super('tipoPessoa-invalido');
  }
}

export class InvalidUserPasswordSolicitationException extends Errors.PreconditionFailedError {
  constructor() {
    super('solicitacao-invalida');
  }
}

export class UsernameAlreadExist extends Errors.ConflictError {
  constructor() {
    super('username-ja-existe');
  }
}
