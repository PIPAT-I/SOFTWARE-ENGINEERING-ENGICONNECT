import type { Post } from "./post";

export interface Certificatemanage {
    ID: number;
    title_th: string;
    title_en: string;
    detail: string;
    organizer: string;
    // picture_url: string;
    picture_participation?: string;
    picture_winner?: string;
    // signature_1_url: string;
    // signature_2_url: string;
    // date: string;
    type: string;
    post_id?: number;
    post?: Post;



}

export interface CreateCertificateRequest {

    title_th: string;
    title_en: string;
    detail: string;
    organizer: string;
    // picture_url: string;
    picture_participation?: string;
    picture_winner?: string;
    // signature_1_url: string;
    // signature_2_url: string;
    // date: string;
    type: string;

    user_id?: number;
    result_id?: number;
    registration_id?: number;
    post_id?: number;
    post?: Post;
}

export interface UpdateCertificateRequest {
    ID: number;
    title_th: string;
    title_en: string;
    detail: string;
    organizer: string;
    // picture_url: string;
    // signature_1_url: string;
    // signature_2_url: string;
    // date: string;
    type: string;
    post_id?: number;
    post?: Post;
}

export interface DeleteCertificateRequest {
    ID: number;
}

export interface GetCertificateResponse extends Certificatemanage { }