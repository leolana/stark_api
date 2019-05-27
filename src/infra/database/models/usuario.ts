// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, HasMany, PrimaryKey, AllowNull } from 'sequelize-typescript';
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

  @Column({
    type: DataType.STRING(11),
    allowNull: false
  }) celular: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  }) username: string;

  @Column({
    type: DataType.STRING(18),
    allowNull: true,
  }) documento: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING(50)),
    allowNull: false,
    validate: {
      areKnownRoles: (value: string[]) => {
        const roles = Object.values(rolesEnum);

        if (value.some(v => !roles.includes(v))) {
          throw new Exceptions.InvalidSentDataException();
        }
      }
    }
  }) roles: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }) ativo: boolean;

  @HasMany(() => Membro)
  associacoes: Membro[];

}
