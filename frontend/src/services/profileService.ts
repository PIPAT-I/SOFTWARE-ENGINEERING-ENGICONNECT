import apiClient from "./apiClient";
import type {
  UpdateProfileData,
  UploadAvatarResponse,
  ProfileUpdateResponse,
} from "@/interfaces/profile";

export async function getMyProfile() {
  return await apiClient
    .get("/profiles/me")
    .then((res) => res.data)
    .catch((e) => e.response);
}

export async function getUserProfile(userId: string) {
  return await apiClient
    .get(`/profiles/${userId}`)
    .then((res) => res.data)
    .catch((e) => e.response);
}

export async function updateMyProfile(
  data: UpdateProfileData
): Promise<ProfileUpdateResponse> {
  return await apiClient
    .put("/profiles/me", data)
    .then((res) => res.data)
    .catch((e) => e.response);
}

export async function uploadAvatar(
  sutId: string,
  file: File
): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append("sut_id", sutId.toUpperCase());
  formData.append("avatar", file);
  return await apiClient
    .post("/upload/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data)
    .catch((e) => e.response);
}
