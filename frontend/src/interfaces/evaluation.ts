
// Student - Feedback Page
// ใช้ใน: student/feedback/index.tsx, modalEvaluation.tsx

export interface PostInfo {
  ID: number;
  title: string;
  organizer: string;
  detail: string;
  picture: string;
}

export interface MyRegistration {
  ID: number;
  team_name: string;
  post: PostInfo;
}

export interface EvaluationTopic {
  ID: number;
  name: string;
  description: string;
  post_id: number;
}

export interface ScoreInput {
  topic_id: number;
  score: number;
}

export interface SubmitEvaluationRequest {
  registration_id: number;
  suggestion: string;
  scores: ScoreInput[];
}


// Admin - Create/Edit Topics Page
// ใช้ใน: admin/feedback/index.tsx, evaluationService.ts


export interface TopicInput {
  name: string;
  description: string;
}

export interface CreateTopicsRequest {
  post_id: number;
  topics: TopicInput[];
}

export interface UpdateTopicRequest {
  id: number;
  name: string;
  description: string;
}

export interface DeleteTopicRequest {
  id: number;
}

export interface TopicItem {
  id: number;
  name: string;
  isNew: boolean;
}


// Admin - Evaluation Results Page
// ใช้ใน: admin/feedback/result.tsx, FilterExport.tsx

export interface TopicScoreResult {
  topic_id: number;
  topic_name: string;
  score: number;
  max_score: number;
}

export interface EvaluationResultItem {
  response_id: number;
  user_id: number;
  user_name: string;
  student_id: string;
  team_name: string;
  avatar: string;
  avg_score: number;
  suggestion: string;
  scores: TopicScoreResult[];
}
