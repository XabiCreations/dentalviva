export interface Profile {
  id: string
  full_name: string
  last_name?: string | null
  dni: string
  email: string
  phone?: string | null
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  identifier: string // email or DNI
  password: string
}

export interface RegisterCredentials {
  full_name: string
  last_name: string
  dni: string
  email: string
  phone?: string
  password: string
  confirm_password: string
  newsletter?: boolean
}
