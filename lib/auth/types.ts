import { User } from "firebase/auth"

export interface AuthContextValue {
  user: User | null
  loading: boolean
}

export interface AuthProviderProps {
  children: React.ReactNode
}
