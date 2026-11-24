export interface UserOption {
  id: string
  name: string
}

export interface ManagedUser {
  id: string
  username: string
  email: string
  roleId: string
  role: UserOption
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserFormOptions {
  roles: UserOption[]
}
