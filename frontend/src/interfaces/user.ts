import type { Major } from "./major";
import type { Faculty } from "./faculty";
import type { Role } from "./role";


import type { PortfolioInterface } from "./portfolio";

export interface SocialMedia {
  platform: string;
  link: string;
}

export interface CertificateDTO {
  id: number;
  title_th: string;
  title_en: string;
  type: string;
  picture_participation: string;
  activity_picture: string;
  activity_title: string;
  organizer: string;
  date: string;
}

export interface User {
  membership_level: string;
  id?: number;
  sut_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  year: number;
  bio: string;
  avatar_url: string;
  faculty_id: number;
  faculty: Faculty;
  major_id: number;
  major: Major;
  role_id: number;
  role: Role;
  skills: string[];
  interests: string[];
  tools: string[];
  socials: SocialMedia[];
  portfolios: PortfolioInterface[];
  certificates: CertificateDTO[];
}
