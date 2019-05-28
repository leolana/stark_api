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
  @AllowNull(false)
  @Column(DataType.INTEGER)
  notificacaoId: number;

  @ForeignKey(() => Usuario)
  @AllowNull(false)
  @Column(DataType.UUID)
  usuarioId: string;

  @AllowNull(false)
  @Default(usuarioNotificacaoEnum.naoLido)
  @IsIn([Object.values(usuarioNotificacaoEnum)])
  @Column(DataType.INTEGER)
  status: usuarioNotificacaoEnum;

  @BelongsTo(() => Usuario)
  usuario: Usuario;

  @BelongsTo(() => Notificacao)
  notificacao: Notificacao;

}
