# iMotos Network (御坂网络)

<div align="center">
  <img src="public/placeholder-logo.svg" alt="iMotos Network Logo" width="200">
  <p>高级脑电波通信系统 - 连接超能力者的未来</p>
</div>

## 项目简介

iMotos Network（御坂网络）是一个基于Next.js构建的现代化Web应用，模拟了一个虚拟的超能力者通信网络系统。项目融合了科幻元素和现代Web技术，为用户提供独特的交互体验。

### 核心特性

- 🧠 **脑电波通信模拟** - 通过WebSocket实现实时通信，模拟超能力者间的脑电波交互
- 🌐 **分布式网络** - 模拟20000个御坂网络节点的分布式通信系统
- 🔐 **安全认证** - 完整的用户认证系统，支持邮箱注册和登录
- 🎮 **沉浸式UI** - 科幻风格的用户界面，包含DNA动画背景和电磁脉冲效果
- 📱 **响应式设计** - 完美支持各种设备尺寸

## 技术栈

- **前端框架**: Next.js 14, React 18
- **样式方案**: TailwindCSS, Framer Motion
- **3D渲染**: Three.js, React Three Fiber
- **状态管理**: React Hooks
- **实时通信**: Socket.IO
- **数据库**: Prisma + SQLite
- **认证**: NextAuth.js
- **开发语言**: TypeScript

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/imotos-network.git
cd imotos-network
```

2. 安装依赖
```bash
pnpm install
```

3. 环境配置
- 复制`.env.example`到`.env`
- 配置必要的环境变量

4. 数据库初始化
```bash
pnpm prisma migrate dev
```

5. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000 查看应用

## 项目结构

```
imotos-network/
├── app/                # Next.js 14 App Router
├── components/         # React组件
├── lib/               # 工具函数和服务
├── prisma/            # 数据库模型和迁移
├── public/            # 静态资源
└── styles/            # 全局样式
```

## 主要功能

- **用户系统**
  - 邮箱注册/登录
  - 个人资料管理
  - Misaka ID分配

- **通信功能**
  - 实时消息传输
  - 广播/点对点通信
  - 网络状态监控

- **实验功能**
  - 电磁波频率同步
  - 节点状态模拟
  - 网络拓扑可视化

## 贡献指南

欢迎提交Issue和Pull Request。在贡献代码前，请确保：

1. 代码符合项目的编码规范
2. 添加必要的测试用例
3. 更新相关文档

## 许可证

本项目采用 ISC 许可证

## 联系方式

- 项目主页：[GitHub Repository](https://github.com/BIT1028/imotos-network)
- 问题反馈：请使用GitHub Issues

---

<div align="center">
  <p>Powered by Next.js and the Power of Science</p>
</div>