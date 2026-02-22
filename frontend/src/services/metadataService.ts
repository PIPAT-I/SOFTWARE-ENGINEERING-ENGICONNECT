import apiClient from "./apiClient";
import type { Faculty } from "@/interfaces/faculty";
import type { Major } from "@/interfaces/major";
import type { LocationInterface } from "@/interfaces/Location";

export async function getFaculties() {
  return await apiClient
    .get<Faculty[]>("/metadata/faculties")
    .then((res) => res.data)
    .catch((e) => e.response);
}

export async function getMajors() {
  return await apiClient
    .get<Major[]>("/metadata/majors")
    .then((res) => res.data)
    .catch((e) => e.response);
}

export async function getLocations() {
  return await apiClient
    .get<LocationInterface[]>("/metadata/locations")
    .then((res) => res.data)
    .catch((e) => e.response);
}

