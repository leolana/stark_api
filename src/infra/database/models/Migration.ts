// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: '_migration'
})
export class Migration extends Model<Migration> {

  @AllowNull(false)
  @Column(DataType.STRING(40))
  key: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  executedAt: Date;

}
