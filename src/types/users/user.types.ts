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
  departmentId: string | null
  department: UserOption | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserFormOptions {
  roles: UserOption[]
  departments: UserOption[]
}
