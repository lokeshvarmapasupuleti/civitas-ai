const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Submission {
  id: string;
  category: string;
  ward: string;
  description: string;
  reporter_name: string | null;
  sentiment: string;
  date: string;
  status: string;
  audio_path?: string;
  image_path?: string;
}

export interface AssistantResponse {
  answer: string;
  query_type: string;
  confidence: number;
  data: any;
  suggested_followups: string[];
}

export interface Recommendation {
  id?: number;
  title: string;
  ward: string;
  score: number;
  budget: string;
  impact: string;
  completion_time: string;
  risk_level: string;
  ai_reasoning: string;
}

export interface Hotspot {
  name: string;
  position: [number, number];
  requests: number;
  color: string;
}

export interface MonthlyStat {
  month: string;
  requests: number;
  is_current: boolean;
}

export interface KPIs {
  citizen_requests: number;
  ai_recommendations: number;
  demand_hotspots: number;
  pending_reviews: number;
}

export interface AnalyticsData {
  hotspots: Hotspot[];
  stats: MonthlyStat[];
  trend_description: string;
  kpis: KPIs;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const headers: HeadersInit = {};
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
  }

  return response.json();
}

export const api = {
  getSubmissions: async (category?: string, ward?: string): Promise<Submission[]> => {
    let path = "/submissions";
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (ward) params.append("ward", ward);
    const queryString = params.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
    return apiRequest<Submission[]>(path);
  },

  submitSubmission: async (data: {
    category: string;
    ward: string;
    description?: string;
    reporter_name?: string;
    audio_file?: File | null;
    image_file?: File | null;
  }): Promise<Submission> => {
    const formData = new FormData();
    formData.append("category", data.category);
    formData.append("ward", data.ward);
    if (data.description) formData.append("description", data.description);
    if (data.reporter_name) formData.append("reporter_name", data.reporter_name);
    if (data.audio_file) formData.append("audio_file", data.audio_file);
    if (data.image_file) formData.append("image_file", data.image_file);

    return apiRequest<Submission>("/submissions", {
      method: "POST",
      body: formData,
    });
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    return apiRequest<Recommendation[]>("/recommendations");
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    return apiRequest<AnalyticsData>("/analytics");
  },

  processAISubmission: async (submissionId: string): Promise<any> => {
    const encodedId = encodeURIComponent(submissionId);
    return apiRequest<any>(`/ai/process/${encodedId}`, {
      method: "POST",
    });
  },

  queryAssistant: async (query: string): Promise<AssistantResponse> => {
    return apiRequest<AssistantResponse>("/assistant/query", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  },
};
