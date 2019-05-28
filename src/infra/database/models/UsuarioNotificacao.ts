// tslint:disable:no-magic-numbers
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { Table, Model, Column, DataType, AllowNull, Default, IsIn, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Notificacao } from './Notificacao';

@Table({
  timestamps: true,
  tableName: 'usuarioNotificacao'
})
export class UsuarioNotificacao extends Model<UsuarioNotificacao> {

  @ForeignKey(() => Notificacao)
  @Column(DataType.INTEGER)
  @AllowNull(false)
  notificacaoId: number;

  @ForeignKey(() => Usuario)
  @Column(DataType.UUID)
  @AllowNull(false)
  usuarioId: string;

  @Column(DataType.INTEGER)
  @AllowNull(false)
  @Default(usuarioNotificacaoEnum.naoLido)
  @IsIn([Object.values(usuarioNotificacaoEnum)])
  status: usuarioNotificacaoEnum;

  @BelongsTo(() => Usuario)
  usuario: Usuario;

  @BelongsTo(() => Notificacao)
  notificacao: Notificacao;

}
