import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 验证请求数据
    if (!email || !password) {
      return NextResponse.json(
        { message: "邮箱和密码是必填项" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 密码加密
    const hashedPassword = await hash(password, 10);

    // 生成随机的Misaka ID (10000-20000之间)
    const misakaId = Math.floor(Math.random() * 10000) + 10000;

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: name || `Misaka`,
        email,
        password: hashedPassword,
        misakaId,
      },
    });

    // 返回成功响应，不包含密码
    return NextResponse.json(
      {
        message: "注册成功",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          misakaId: user.misakaId,
        },
        misakaId: user.misakaId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { message: "服务器内部错误" },
      { status: 500 }
    );
  }
} 