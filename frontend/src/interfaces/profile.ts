

import type { SocialMedia } from "./user";

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  faculty_id: number;
  major_id: number;
  year: number;
  bio?: string;
  skills?: string[];
  interests?: string[];
  tools?: string[];
  socials?: SocialMedia[];
}

export interface UploadAvatarResponse {
  message?: string;
  avatar_url?: string;
  error?: string;
}

export interface ProfileUpdateResponse {
  message?: string;
  error?: string;
}
