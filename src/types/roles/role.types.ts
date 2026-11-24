export interface RolePrivilege {
  id: string
  name: string
}

export interface Role {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface RoleDetails extends Role {
  privileges: RolePrivilege[]
}
