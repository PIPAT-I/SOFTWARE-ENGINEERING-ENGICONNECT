import apiClient from './apiClient';

export interface Result {
  id: number;
  award_id: number;
  registration_id: number;
  detail?: string;
}

export const createResult = async (payload: { award_id: number; registration_id: number; detail?: string; award_name?: string }) => {
  return apiClient.post(`/results`, payload);
};

export const createResultsBulk = async (results: Array<{ award_id: number; registration_id: number; detail?: string }>) => {
  return apiClient.post(`/results/bulk`, { results });
};

export const updateResult = async (id: number, payload: { award_id: number; registration_id: number; detail?: string }) => {
  return apiClient.put(`/results/${id}`, payload);
};

export const deleteResult = async (id: number) => {
  return apiClient.delete(`/results/${id}`);
};