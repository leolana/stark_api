// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, HasMany, PrimaryKey, AllowNull, Default } from 'sequelize-typescript';
import { Membro } from './Membro';

@Table({
  timestamps: true,
  tableName: 'usuario'
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

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

  @HasMany(() => Membro)
  associacoes: Membro[];

}
