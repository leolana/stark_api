// tslint:disable:no-magic-numbers
import { Table, Column, PrimaryKey, DataType, Model, Default, AllowNull } from 'sequelize-typescript';

@Table({
  timestamps: true
})
export class UsuarioSolicitacaoSenha extends Model<UsuarioSolicitacaoSenha> {

  @Column(DataType.UUID)
  @PrimaryKey
  @Default(DataType.UUIDV1)
  codigo: string;

  @Column(DataType.STRING(100))
  @AllowNull(false)
  email: string;

  @Column(DataType.DATE)
  @AllowNull(false)
  expiraEm: Date;

}
