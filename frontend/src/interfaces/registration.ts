
import type { User } from "./user";
import type { Post } from "./post";

export type UserWithID = User & {
  ID?: number;
};

export type RegistrationStatus = "pending" | "approved" | "rejected" | "completed";

export interface RegistrationInterface {
  
  ID?: number;
  id?: number;

  team_name: string;
  description: string;
  status: RegistrationStatus;
  registration_date: string; 

  post_id: number;

  
  post?: Post;

  
  users?: UserWithID[];

  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}


export interface CreateRegistrationRequest {
  team_name: string;
  description: string;
  post_id: number;
  user_ids: number[];  

  
  status?: RegistrationStatus; 
  registration_date?: string;  
}

export interface UpdateRegistrationRequest {
  team_name?: string;
  description?: string;
  status?: RegistrationStatus;
}

export interface UpdateRegistrationStatusRequest {
  status: RegistrationStatus; 
}

export interface AddUserRequest {
  user_id: number;
}

export interface RemoveUserRequest {
  user_id: number;
}

export interface RegistrationResponse {
  message?: string;
  data?: RegistrationInterface;
  registrations?: RegistrationInterface[];
  error?: string;
}

export interface RegistrationListResponse {
  data: RegistrationInterface[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface AddUserPayload {
  user_id?: number;
  sut_id?: string;
}