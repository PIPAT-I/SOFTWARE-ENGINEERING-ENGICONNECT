import apiClient from "./apiClient";
import type { AddUserPayload } from "@/interfaces/registration";
export async function GetRegistrations() {
  return await apiClient
    .get(`/registration`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetRegistrationById(id: number) {
  return await apiClient
    .get(`/registration/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetRegistrationsByPostId(postId: number) {
  return await apiClient
    .get(`/registration/post/${postId}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function getUserByStudentId(studentId: string) {
  return await apiClient
    .get(`/users/sut-id/${studentId}`)  
    .then((res) => res)
    .catch((e) => e.response);
}

export async function CreateRegistration(data: any) {
  return await apiClient
    .post(`/registration`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function UpdateRegistration(
  id: number,
  data: { team_name: string; description?: string }
) {
  return apiClient.patch(`/registration/${id}`, {
    team_name: data.team_name,
    description: data.description ?? "",
  });
}

export async function UpdateRegistrationStatus(id: number, data: { status: string; reason?: string }) {
  return await apiClient
    .put(`/registration/${id}/status`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function DeleteRegistration(id: number) {
  return await apiClient
    .delete(`/registration/${id}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function AddUserToRegistration(
  registrationId: number,
  data: AddUserPayload
) {
  return await apiClient
    .post(`/registration/${registrationId}/users`, data)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function RemoveUserFromRegistration(registrationId: number, data: { user_id: number }) {
  return await apiClient
    .delete(`/registration/${registrationId}/users`, { data })
    .then((res) => res)
    .catch((e) => e.response);
}

export async function GetMyRegistrations() {
  return await apiClient
    .get("/registration/my")
    .then((res) => res)
    .catch((e) => e.response);
}