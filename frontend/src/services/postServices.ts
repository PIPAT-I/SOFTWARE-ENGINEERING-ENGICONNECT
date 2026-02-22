import type { CreatePostRequest, UpdatePostRequest } from "../interfaces/post";
import apiClient from "./apiClient";

export async function CreatePost(data: CreatePostRequest) {
  console.log("Creating post with payload:", data);
  return await apiClient
    .post(`/post`, data)
    .then((res) => res)
    .catch((e) => {
      console.error("Create post error:", e.response?.data);
      return e.response;
    });
}

export async function GetPost() {
  return await apiClient
    .get(`/post/my`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function UpdatePost(id: number, data: UpdatePostRequest) {
  return await apiClient
    .put(`/post/${id}`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function DeletePost(id: number) {
  return await apiClient
    .delete(`/post/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetAllPosts() {
  return await apiClient
    .get(`/post`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetStudentPosts() {
  return await apiClient
    .get(`/post/student`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetPostById(id: number | string) {
  return await apiClient
    .get(`/post/${id}`)
    .then((res) => res)
    .catch((e) => {
      console.error("GetPostById error:", e.response?.data);
      return e.response;
    });
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function formatBase64ToDataURL(
  base64: string | undefined,
  mimeType: string = "image/jpeg"
): string {
  if (!base64) return "";
  if (base64.startsWith("data:")) return base64;
  return `data:${mimeType};base64,${base64}`;
}
