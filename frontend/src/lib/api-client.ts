import type {
  Document,
  Conversation,
  ChatResponse,
} from "@/types";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/backend"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const headers: HeadersInit = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(customHeaders ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      import("@/lib/auth-client").then(({ signOut }) => {
        signOut().catch(() => {}).finally(() => {
          window.location.href = "/login";
        });
      });
    }

    const error = await response.json().catch(() => ({
      message: "An unexpected error occurred",
    }));

    throw new ApiError(
      response.status,
      error.message || error.detail || "Request failed"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  documents: {
    upload: async (formData: FormData): Promise<Document> => {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
          import("@/lib/auth-client").then(({ signOut }) => {
            signOut().catch(() => {}).finally(() => {
              window.location.href = "/login";
            });
          });
        }

        const error = await response.json().catch(() => ({
          message: "Upload failed",
        }));

        throw new ApiError(
          response.status,
          error.message || error.detail || "Upload failed"
        );
      }

      return response.json();
    },

    list: (): Promise<Document[]> =>
      request<Document[]>("/documents", {
        method: "GET",
      }),

    delete: (id: string): Promise<void> =>
      request<void>(`/documents/${id}`, {
        method: "DELETE",
      }),
  },

  chat: {
    send: (payload: {
      question: string;
      document_id?: string;
      conversation_id?: string;
    }): Promise<ChatResponse> =>
      request<ChatResponse>("/chat", {
        method: "POST",
        body: payload,
      }),
  },

  conversations: {
    list: (): Promise<Conversation[]> =>
      request<Conversation[]>("/conversations", {
        method: "GET",
      }),

    get: (id: string): Promise<Conversation> =>
      request<Conversation>(`/conversations/${id}`, {
        method: "GET",
      }),

    delete: (id: string): Promise<void> =>
      request<void>(`/conversations/${id}`, {
        method: "DELETE",
      }),
  },
};
