// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, IsIn, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import notificacaoCategoriaEnum from '../../../domain/services/notificacoes/notificacaoCategoriaEnum';
import { Usuario } from './Usuario';
import { NotificacaoCategoria } from './NotificacaoCategoria';
import { UsuarioNotificacao } from './UsuarioNotificacao';

@Table({
  timestamps: true,
  tableName: 'notificacao'
})
export class Notificacao extends Model<Notificacao> {

  @ForeignKey(() => NotificacaoCategoria)
  @AllowNull(false)
  @IsIn([Object.values(notificacaoCategoriaEnum)])
  @Column(DataType.INTEGER)
  categoriaId: notificacaoCategoriaEnum;

  @ForeignKey(() => Usuario)
  @AllowNull(true)
  @Column(DataType.UUID)
  criadorId: number;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  mensagem: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  dataExpiracao: Date;

  @BelongsTo(() => NotificacaoCategoria)
  notificacaoCategoria: NotificacaoCategoria;

  @BelongsTo(() => Usuario)
  usuario: Usuario;

  @HasMany(() => UsuarioNotificacao)
  usuarioNotificacao: UsuarioNotificacao[];

}
