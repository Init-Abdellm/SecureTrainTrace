import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data, isLoading } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  return {
    user: null,
    isLoading,
    isAuthenticated: data?.isAuthenticated ?? false,
  };
}
