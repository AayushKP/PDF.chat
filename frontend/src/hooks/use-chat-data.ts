import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await authClient.getSession();
      return res.data;
    },
    staleTime: Infinity,          // Keep session cache valid permanently during client lifecycle
    refetchOnWindowFocus: false,  // Do not refetch on app/tab switch focus
    refetchOnMount: false,        // Do not refetch when components mount
    refetchOnReconnect: false,    // Do not refetch on reconnect
    retry: false,
  });
}

export function useDocuments(options?: { refetchInterval?: number | false | ((query: any) => number | false) }) {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => apiClient.documents.list(),
    ...options,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => apiClient.documents.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.documents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiClient.conversations.list(),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () => (id ? apiClient.conversations.get(id) : null),
    enabled: Boolean(id),
  });
}

export function useSendChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      question: string;
      document_id?: string;
      conversation_id?: string;
    }) => apiClient.chat.send(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (data?.conversation_id) {
        queryClient.invalidateQueries({
          queryKey: ["conversations", data.conversation_id],
        });
      }
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.conversations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
