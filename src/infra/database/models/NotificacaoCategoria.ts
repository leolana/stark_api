// tslint:disable:no-magic-numbers
import { Table, Column, AllowNull, DataType, Default, Model } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'notificacaoCategoria'
})
export class NotificacaoCategoria extends Model<NotificacaoCategoria> {

  @AllowNull(false)
  @Column(DataType.STRING(50))
  categoria: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

}
