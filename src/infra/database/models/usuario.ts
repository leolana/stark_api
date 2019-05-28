// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, HasMany, PrimaryKey, AllowNull, Is, Default } from 'sequelize-typescript';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { rolesEnum } from '../../../domain/services/auth/rolesEnum';
import { Membro } from './membro';

@Table({
  timestamps: true
})
export class Usuario extends Model<Usuario> {

  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(11))
  celular: string;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  username: string;

  @AllowNull(true)
  @Column(DataType.STRING(18))
  documento: string;

  @Is('knownRoles', knownRolesValidation)
  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING(50)))
  roles: string[];

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

  @HasMany(() => Membro)
  associacoes: Membro[];

}

function knownRolesValidation(value: string[]) {
  const roles = Object.values(rolesEnum);

  if (value.some(v => !roles.includes(v))) {
    throw new Exceptions.InvalidSentDataException();
  }
}
