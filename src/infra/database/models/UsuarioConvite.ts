// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, Default, PrimaryKey, AllowNull, Is } from 'sequelize-typescript';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { rolesEnum } from '../../../domain/services/auth/rolesEnum';

@Table({
  timestamps: true,
  tableName: 'usuarioConvite'
})
export class UsuarioConvite extends Model<UsuarioConvite> {

  @PrimaryKey
  @Default(DataType.UUIDV1)
  @Column(DataType.UUID)
  codigo: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(11))
  celular: string;

  @AllowNull(false)
  @Is('knownRoles', knownRolesValidation)
  @Column(DataType.ARRAY(DataType.STRING(50)))
  roles: string[];

  @AllowNull(false)
  @Column(DataType.STRING(100))
  convidadoPor: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participante: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiraEm: Date;

}

function knownRolesValidation(value: any) {
  const roles = Object.values(rolesEnum);

  if (value.some((v: any) => !roles.includes(v))) {
    throw new Exceptions.InvalidSentDataException();
  }
}
