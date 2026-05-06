export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  role?: "MEMBER" | "TRAINER" | "ADMIN" | "FRONT_DESK";
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
