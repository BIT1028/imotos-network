import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * 扩展默认的session类型
   */
  interface Session {
    user: {
      /** 用户ID */
      id: string;
      /** Misaka ID编号 */
      misakaId?: number;
    } & DefaultSession["user"];
  }
} 