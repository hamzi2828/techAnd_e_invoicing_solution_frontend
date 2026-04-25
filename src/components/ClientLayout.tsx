'use client';

import AuthMiddleware from "./AuthMiddleware";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthMiddleware>
        <main>{children}</main>
      </AuthMiddleware>
    </ThemeProvider>
  );
}