import type { PostStatus } from "./poststatus";
import type { User } from "./user";

export interface Post {
    ID: number;
    title: string;
    detail: string;
    objective?: string;
    picture?: string;
    type?: string;
    organizer?: string;
    start_date: string;
    stop_date: string;
    user_id?: number;
    user?: User;
    status_id?: number;
    start?: string;
    stop?: string;
    status?: PostStatus;
    location_id?: number;
    comment?: string;
    post_point?: number;
}

export interface CreatePostRequest {
    title: string;
    detail: string;
    picture?: string;
    type?: string;
    organizer?: string;
    start_date: string;
    stop_date: string;
    comment?: string;
    start?: string;
    stop?: string;
    user_id: number;
    status_id: number;
    location_id?: number;
}

export interface UpdatePostRequest {
    ID: number;
    title?: string;
    detail?: string;
    picture?: string;
    type?: string;
    organizer?: string;
    start_date?: string;
    stop_date?: string;
    start?: string;
    stop?: string;

    user_id?: number;
    status_id?: number;
    location_id?: number;
    comment?: string;
    post_point?: number;
}

export interface DeletePostRequest {
    ID: number;
}

export interface GetPostResponse extends Post { }
