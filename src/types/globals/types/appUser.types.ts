export type AppUser = {
  id: string
  email: string
  username: string
  profilePictureUrl: string | null
  role: {
    id: string
    name: string
    privileges: { id: string; name: string }[]
  }
  isActive: boolean
}
