// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, IsIn, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import notificacaoCategoriaEnum from '../../../domain/services/notificacoes/notificacaoCategoriaEnum';
import { Usuario } from './usuario';
import { NotificacaoCategoria } from './notificacaoCategoria';
import { UsuarioNotificacao } from './usuarioNotificacao';

@Table({
  timestamps: true
})
export class Notificacao extends Model<Notificacao> {

  @ForeignKey(() => NotificacaoCategoria)
  @Column(DataType.INTEGER)
  @AllowNull(false)
  @IsIn([Object.values(notificacaoCategoriaEnum)])
  categoriaId: notificacaoCategoriaEnum;

  @ForeignKey(() => Usuario)
  @Column(DataType.UUID)
  @AllowNull(true)
  criadorId: number;

  @Column(DataType.STRING(200))
  @AllowNull(false)
  mensagem: string;

  @Column(DataType.DATE)
  @AllowNull(false)
  dataExpiracao: Date;

  @BelongsTo(() => NotificacaoCategoria)
  notificacaoCategoria: NotificacaoCategoria;

  @BelongsTo(() => Usuario)
  usuario: Usuario;

  @HasMany(() => UsuarioNotificacao)
  usuarioNotificacao: UsuarioNotificacao[];

}
