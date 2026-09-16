import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      empresaId: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    empresaId: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    empresaId: number;
  }
}