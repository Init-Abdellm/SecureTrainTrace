import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data, isLoading, error } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ["/api/auth/status"],
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // If there's an error (API not available), treat as not authenticated
  if (error) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  return {
    user: null,
    isLoading,
    isAuthenticated: data?.isAuthenticated ?? false,
  };
}
