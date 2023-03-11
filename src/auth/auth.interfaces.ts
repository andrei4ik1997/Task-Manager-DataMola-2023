export interface LoginRequest {
  userId: number;
  token: string;
}

export interface RegisterRequest {
  id: number;
  login: string;
  userName: string;
  password: string;
  token: string;
}
