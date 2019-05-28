// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: '_migration'
})
export class Migration extends Model<Migration> {

  @Column(DataType.STRING(40))
  @AllowNull(false)
  key: string;

  @Column(DataType.DATE)
  @AllowNull(true)
  executedAt: Date;

}
