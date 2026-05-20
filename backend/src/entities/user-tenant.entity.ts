import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { UserEntity } from './user.entity'
import { TenantEntity } from './tenant.entity'

export enum UserTenantRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

@Entity('user_tenants')
export class UserTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid' })
  userId: string

  @Column({ type: 'uuid' })
  tenantId: string

  @Column({
    type: 'enum',
    enum: UserTenantRole,
    default: UserTenantRole.VIEWER,
  })
  role: UserTenantRole

  @ManyToOne(() => UserEntity, (u) => u.userTenants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @ManyToOne(() => TenantEntity, (t) => t.userTenants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
