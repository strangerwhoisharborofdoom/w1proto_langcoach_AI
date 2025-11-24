import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, fullName: string, role: "teacher" | "student" | "admin") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data: currentUser, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const user = await apiRequest<User>("POST", "/api/auth/login", { username, password });
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      username: string;
      password: string;
      email: string;
      fullName: string;
      role: "teacher" | "student" | "admin";
    }) => {
      const user = await apiRequest<User>("POST", "/api/auth/register", data);
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const register = async (
    username: string,
    password: string,
    email: string,
    fullName: string,
    role: "teacher" | "student" | "admin"
  ) => {
    await registerMutation.mutateAsync({ username, password, email, fullName, role });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
