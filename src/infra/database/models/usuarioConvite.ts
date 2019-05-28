// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, Default, PrimaryKey, AllowNull, Is } from 'sequelize-typescript';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { rolesEnum } from '../../../domain/services/auth/rolesEnum';

@Table({
  timestamps: true
})
export class UsuarioConvite extends Model<UsuarioConvite> {

  @PrimaryKey
  @Default(DataType.UUIDV1)
  @Column(DataType.UUID)
  codigo: string;

  @Column(DataType.STRING(100))
  @AllowNull(false)
  nome: string;

  @Column(DataType.STRING(100))
  @AllowNull(false)
  email: string;

  @Column(DataType.STRING(11))
  @AllowNull(false)
  celular: string;

  @Column(DataType.ARRAY(DataType.STRING(50)))
  @AllowNull(false)
  @Is('knownRoles', knownRolesValidation)
  roles: string[];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  convidadoPor: string;

  @Column(DataType.INTEGER)
  @AllowNull(false)
  participante: number;

  @Column(DataType.DATE)
  @AllowNull(false)
  expiraEm: Date;

}

function knownRolesValidation(value: any) {
  const roles = Object.values(rolesEnum);

  if (value.some((v: any) => !roles.includes(v))) {
    throw new Exceptions.InvalidSentDataException();
  }
}
