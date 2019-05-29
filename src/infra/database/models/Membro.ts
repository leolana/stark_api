// tslint:disable:no-magic-numbers
import { Table, Model, Column, BelongsTo, DataType, ForeignKey, PrimaryKey, AllowNull, Is } from 'sequelize-typescript';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { rolesEnum } from '../../../domain/services/auth/rolesEnum';
import { Usuario } from './Usuario';

@Table({
  timestamps: true,
  tableName: 'membro'
})
export class Membro extends Model<Membro> {

  @PrimaryKey
  @Column(DataType.INTEGER)
  participanteId: number;

  @PrimaryKey
  @ForeignKey(() => Usuario)
  @Column(DataType.UUID)
  usuarioId: number;

  @Is('knownRoles', knownRolesValidation)
  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING(50)))
  roles: string[];

  @BelongsTo(() => Usuario)
  usuario: Usuario;

}

function knownRolesValidation(value: string[]) {
  const roles = Object.values(rolesEnum);

  if (value.some(v => !roles.includes(v))) {
    throw new Exceptions.InvalidSentDataException();
  }
}
