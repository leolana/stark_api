// tslint:disable:no-magic-numbers
import { Table, Column, PrimaryKey, DataType, Model, Default, AllowNull } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'usuarioSolicitacaoSenha'
})
export class UsuarioSolicitacaoSenha extends Model<UsuarioSolicitacaoSenha> {

  @PrimaryKey
  @Default(DataType.UUIDV1)
  @Column(DataType.UUID)
  codigo: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  email: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiraEm: Date;

}
