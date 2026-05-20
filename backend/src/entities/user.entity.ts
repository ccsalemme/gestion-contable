import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { UserTenantEntity } from './user-tenant.entity'
import { PermissionEntity } from './permission.entity'

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_CLIENT = 'ADMIN_CLIENT',
  USER_FINAL = 'USER_FINAL',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar' })
  passwordHash: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER_FINAL })
  role: UserRole

  @Column({ type: 'boolean', default: true })
  active: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => UserTenantEntity, (ut) => ut.user, { cascade: true })
  userTenants: UserTenantEntity[]

  @ManyToMany(() => PermissionEntity, { lazy: true })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[]
}
