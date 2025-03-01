"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { toast } from "@/components/ui/use-toast";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          title: "登录失败",
          description: "邮箱或密码不正确，请重试",
          variant: "destructive",
        });
      } else {
        toast({
          title: "登录成功",
          description: "正在连接到姐妹网络...",
          className: "bg-gray-900 border border-blue-800",
        });
        router.push("/feed");
        router.refresh();
      }
    } catch (error) {
      console.error("登录错误:", error);
      toast({
        title: "登录失败",
        description: "发生未知错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 ${montserrat.variable}`}>
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-lg border border-gray-700 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">姐妹网络</h1>
          <p className="text-gray-400">Sisters Network Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              邮箱 | Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="misaka@academy-city.jp"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              密码 | Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "连接中..." : "登录 | Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            没有账号？{" "}
            <Link href="/register" className="text-blue-400 hover:underline">
              注册新Misaka
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 