import apiClient from "./apiClient";
import type {
  CreateTopicsRequest,
  UpdateTopicRequest,
  DeleteTopicRequest,
  SubmitEvaluationRequest,
} from "@/interfaces/evaluation";


export async function GetMyRegisteredPosts() {
  return await apiClient
    .get("/evaluation/activity")
    .then((res) => res)
    .catch((e) => e.response);
}


export async function GetTopicsByPost(postId: number) {
  return await apiClient
    .get(`/evaluation/topics/${postId}`)
    .then((res) => res)
    .catch((e) => e.response);
}

export async function SubmitEvaluation(data: SubmitEvaluationRequest) {
  return await apiClient
    .post("/evaluation/submit", data)
    .then((res) => res)
    .catch((e) => e.response);
}


export async function CreateTopics(data: CreateTopicsRequest) {
  return await apiClient
    .post("/evaluation/topics", data)
    .then((res) => res)
    .catch((e) => e.response);
}


export async function UpdateTopic(req: UpdateTopicRequest) {
  return await apiClient
    .put(`/evaluation/topics/${req.id}`, {
      name: req.name,
      description: req.description,
    })
    .then((res) => res)
    .catch((e) => e.response);
}


export async function DeleteTopic(req: DeleteTopicRequest) {
  return await apiClient
    .delete(`/evaluation/topics/${req.id}`)
    .then((res) => res)
    .catch((e) => e.response);
}


export async function GetPostsWithEvaluations() {
  return await apiClient
    .get("/evaluation/summary")
    .then((res) => res)
    .catch((e) => e.response);
}


export async function GetEvaluationResults(postId: number) {
  return await apiClient
    .get(`/evaluation/results/${postId}`)
    .then((res) => res)
    .catch((e) => e.response);
}
