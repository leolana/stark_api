// tslint:disable:no-magic-numbers
import { Table, Model, Column, BelongsTo, DataType, ForeignKey, PrimaryKey } from 'sequelize-typescript';
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

  @BelongsTo(() => Usuario)
  usuario: Usuario;

}
