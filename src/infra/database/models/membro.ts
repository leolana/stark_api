// tslint:disable:no-magic-numbers
import { Table, Model, Column, BelongsTo, DataType, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { Usuario } from './usuario';

@Table({
  timestamps: true,
  tableName: 'membro'
})
export class Membro extends Model<Membro> {

  @PrimaryKey
  @Column(DataType.INTEGER)
  participanteId: number;

  @PrimaryKey
  @Column(DataType.UUID)
  @ForeignKey(() => Usuario)
  usuarioId: number;

  @BelongsTo(() => Usuario)
  usuarios: Usuario;

}
