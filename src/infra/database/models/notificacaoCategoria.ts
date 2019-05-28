// tslint:disable:no-magic-numbers
import { Table, Column, AllowNull, DataType, Default, Model } from 'sequelize-typescript';

@Table({
  timestamps: true
})
export class NotificacaoCategoria extends Model<NotificacaoCategoria> {

  @Column(DataType.STRING(50))
  @AllowNull(false)
  categoria: string;

  @Column(DataType.BOOLEAN)
  @AllowNull(false)
  @Default(true)
  ativo: boolean;

}
