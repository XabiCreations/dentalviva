export interface Profile {
  id: string
  full_name: string
  birth_date: string
  dni: string
  email: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  identifier: string // email or DNI
  password: string
}

export interface RegisterCredentials {
  full_name: string
  birth_date: string
  dni: string
  email: string
  password: string
  confirm_password: string
}
