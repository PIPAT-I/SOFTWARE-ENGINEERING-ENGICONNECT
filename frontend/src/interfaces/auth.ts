import type { SocialMedia } from "./user";

export interface Login {
  sut_id: string;
  password: string;
}

export interface Register {
  sut_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  year: number;
  faculty_id: number;
  major_id: number;
  bio?: string;
  skills?: string[];
  tools?: string[];
  interests?: string[];
  socials?: SocialMedia[];
}

export interface LoginResponse {
  message: string;
  token_type: string;
  token: string;
}


export interface RegisterResponse {
  message: string;
}


export interface RegisterRequest extends Register { }
