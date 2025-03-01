"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion"
import { useTheme } from "next-themes"
import { Bell, LogOut, Search, Home, User, Settings, MessageSquare, Menu, X, MessageCircle, Share2, Bookmark, Plus, Zap, Database, FileTerminal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useInView } from "react-intersection-observer"

type Post = {
  id: string
  author: {
    name: string
    avatar: string
    id: number
  }
  content: string
  title?: string
  date: string
  likes: number
  comments: number
  category: string
  imageUrl?: string | null
}

// 定义组件props类型
type UserInfoProps = {
  status: string
  session: any
  misakaId: number
  connectionStrength: number
  mousePosition: { x: number, y: number }
  electricPulse: number
}

type PostCardProps = {
  post: Post
  index: number
  electricPulse: number
}

// 使用React.memo优化UserInfo组件
const UserInfo = memo(({ status, session, misakaId, connectionStrength, mousePosition, electricPulse }: UserInfoProps) => {
  if (status === "authenticated" && session?.user) {
    return (
      <motion.div 
        className="flex items-center p-4 mb-6 space-x-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-md border border-blue-400/10 dark:border-blue-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          x: mousePosition.x * -0.2,
          boxShadow: `0 0 10px rgba(0, 150, 255, 0.1)`
        }}
        whileHover={{
          boxShadow: `0 0 20px rgba(0, 150, 255, 0.3)`
        }}
      >
        <div className="relative overflow-hidden rounded-full w-14 h-14">
          {session.user.image ? (
            <Image 
              src={session.user.image} 
              alt={session.user.name || "用户头像"} 
              width={56}
              height={56}
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600">
              {session.user.name?.[0] || "M"}
            </div>
          )}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/30" />
        </div>
        <div>
          <h3 className="font-medium text-md">{session.user.name || `Misaka ${misakaId}`}</h3>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">电磁波强度: {connectionStrength}%</p>
          </div>
        </div>
      </motion.div>
    )
  }
  
  return (
    <motion.div 
      className="p-4 mb-6 space-y-2 rounded-xl bg-gradient-to-r from-gray-500/10 to-gray-600/10 backdrop-blur-md border border-blue-400/10 dark:border-blue-500/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-sm font-medium font-mono">访客模式</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">未授权访问</p>
      <div className="flex pt-2 space-x-2">
        <Link href="/login" className="text-xs text-blue-500 hover:text-blue-400">
          登入网络
        </Link>
        <span className="text-xs text-gray-400">|</span>
        <Link href="/register" className="text-xs text-blue-500 hover:text-blue-400">
          注册节点
        </Link>
      </div>
    </motion.div>
  )
});

// 优化的PostCard组件
const PostCard = memo(({ post, index, electricPulse }: PostCardProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.article
      ref={ref}
      key={post.id}
      className="overflow-hidden transition-all rounded-xl bg-gradient-to-br from-blue-900/10 to-blue-700/5 backdrop-blur-md border border-blue-400/10 dark:border-blue-500/5 shadow-lg hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -5,
        boxShadow: `0 0 30px rgba(0, 120, 255, 0.2)`,
        borderColor: "rgba(0, 150, 255, 0.3)"
      }}
    >
      {post.imageUrl && (
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.title || post.content}
            width={400}
            height={160}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center mb-3 space-x-3">
          <div className="relative w-8 h-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="object-cover"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 rounded-full border border-blue-400/30" />
          </div>
          <div>
            <div className="flex items-center text-sm font-medium">
              <p>{post.author.name}</p>
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-blue-500/10 border border-blue-400/20 font-mono">
                #{post.author.id}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono">{post.date}</p>
          </div>
        </div>
        {post.title && (
          <div className="mb-2">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              {post.title}
            </h3>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
          </div>
        )}
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 font-mono">
          {post.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button 
              className="flex items-center text-blue-400 hover:text-blue-500 transition-colors"
            >
              <Zap className="w-4 h-4 mr-1" />
              <span>{post.likes}</span>
            </button>
            <button 
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{post.comments}</span>
            </button>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-400/20">
            {post.category}
          </span>
        </div>
      </div>
    </motion.article>
  )
});

export default function FeedPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()
  const feedRef = useRef(null)
  
  // 修复水合错误：将随机值生成移到客户端
  const [misakaId, setMisakaId] = useState(10032) // 固定的初始值，避免水合错误
  const [connectionStrength, setConnectionStrength] = useState(90) // 固定的初始值，避免水合错误
  const [electricPulse, setElectricPulse] = useState(0)
  const [systemStatus, setSystemStatus] = useState("同步中...")
  
  // 使用useEffect在客户端渲染后设置随机值
  useEffect(() => {
    // 在客户端设置随机值
    setMisakaId(10000 + Math.floor(Math.random() * 10000))
    setConnectionStrength(85 + Math.floor(Math.random() * 10))
  }, [])

  // 滚动动画控制
  const { scrollYProgress } = useScroll({
    target: feedRef,
    offset: ["start start", "end start"],
  })
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8])
  const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8])
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -10])
  
  // 使用useSpring平滑处理鼠标位置，减少重新渲染
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const smoothMouseX = useSpring(0, { stiffness: 100, damping: 20 })
  const smoothMouseY = useSpring(0, { stiffness: 100, damping: 20 })
  
  // 优化鼠标移动处理
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10
    const y = (e.clientY / window.innerHeight - 0.5) * 10
    smoothMouseX.set(x)
    smoothMouseY.set(y)
    
    // 使用节流函数减少状态更新频率
    // 只在鼠标位置变化超过阈值时更新状态
    if (Math.abs(x - mousePosition.x) > 1 || Math.abs(y - mousePosition.y) > 1) {
      setMousePosition({ x, y })
    }
  }, [mousePosition, smoothMouseX, smoothMouseY])
  
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    
    // 降低电流脉冲更新频率为500ms
    const pulseInterval = setInterval(() => {
      setElectricPulse(prev => (prev + 1) % 100)
    }, 500)
    
    // 模拟系统状态更新
    const statusMessages = [
      "同步中...",
      "读取Sisters数据...",
      "连接中...",
      "验证节点身份...",
      "接入御坂网络...",
      "准备就绪",
    ]
    
    statusMessages.forEach((message, index) => {
      setTimeout(() => {
        setSystemStatus(message)
      }, 500 * (index + 1))
    })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(pulseInterval)
    }
  }, [handleMouseMove])

  useEffect(() => {
    // 检查登录状态
    if (status === "authenticated") {
      toast({
        title: "御坂网络连接成功",
        description: `御坂编号 ${session?.user?.name || misakaId} 已接入网络，如此这般，御坂确认道`,
      })
    } else if (status === "unauthenticated") {
    toast({
        title: "访客模式",
        description: "检测到未授权访问，部分功能已限制，御坂警告道",
        variant: "destructive",
      })
    }

    // 模拟获取帖子数据
    const timer = setTimeout(() => {
      setPosts(generateMockPosts())
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [status, session, misakaId])

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/" })
  }, [])

  // 使用useMemo过滤帖子
  const filteredPosts = useMemo(() => {
    return selectedCategory === "全部" 
      ? posts 
      : posts.filter(post => post.category === selectedCategory)
  }, [posts, selectedCategory])

  // 生成模拟数据 - 使用useMemo缓存
  const generateMockPosts = useCallback(() => {
    const categories = ["学术", "实验", "技术", "观测", "研究"];
    const avatars = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    ];
    const images = [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      "https://images.unsplash.com/photo-1523374228107-6e44bd2b524e",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      "https://images.unsplash.com/photo-1605379399642-870262d3d051",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    ];
    
    // 使用固定种子生成帖子ID，避免客户端和服务器端不一致
    const baseId = 10032;
    
    return Array.from({ length: 9 }, (_, i) => ({
      id: `post-${i}`,
      title: `实验报告 #${(baseId + i).toString().padStart(5, '0')}`,
      content: `【御坂网络实验报告】
实验编号: ${(baseId + i).toString().padStart(5, '0')}
实验目标: ${
      i % 2 === 0
        ? "测试电磁能力在第七学区环境下的稳定性" 
        : "研究Sisters间脑电波共享效率的提升方法"
    }
实验结果: ${
      i % 2 === 0
        ? "电磁能力输出提升了15.7%，如此这般，御坂报告着实验结果" 
        : "发现新的脑电波同步方法，可以减少47%的能量消耗，御坂如是说"
    }`,
      author: {
        name: `御坂 ${baseId + i}`,
        avatar: avatars[i % avatars.length],
        id: baseId + i
      },
      category: categories[i % categories.length],
      date: `${new Date().getMonth() + 1}月${new Date().getDate() - (i % 7)}日 | 第七学区`,
      likes: 100 + (i * 10), // 使用确定性计算而非随机数
      comments: 30 + (i * 3), // 使用确定性计算而非随机数
      imageUrl: i % 3 !== 0 ? images[i % images.length] : null, // 使用确定性条件而非随机数
    }));
  }, []);

  return (
    <div 
      ref={feedRef} 
      className="min-h-screen font-mono bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-blue-950"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 119, 182, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 119, 182, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    >
      {/* 减少电磁波纹动画数量和复杂度 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute rounded-full border border-blue-400/10"
          style={{
            width: 1500,
            height: 1500,
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-blue-950/90 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">御坂网络</div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-white" />
                </Button>
              </div>
              
              <UserInfo 
                status={status} 
                session={session} 
                misakaId={misakaId} 
                connectionStrength={connectionStrength} 
                mousePosition={mousePosition} 
                electricPulse={electricPulse} 
              />
              
              <nav className="flex-1 space-y-2">
                {[
                  { icon: <Home className="w-5 h-5" />, label: "主控制台", path: "/feed" },
                  { icon: <User className="w-5 h-5" />, label: "个人终端", path: "/profile" },
                  { icon: <MessageSquare className="w-5 h-5" />, label: "脑电波通信", path: "/messages" },
                  { icon: <Bell className="w-5 h-5" />, label: "系统通知", path: "/notifications" },
                  { icon: <Settings className="w-5 h-5" />, label: "参数设置", path: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.path}
                    className="flex items-center px-4 py-3 space-x-3 text-white border border-blue-500/10 rounded-lg hover:bg-blue-500/10"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              
              <Button onClick={logout} variant="outline" className="mt-auto text-white border-blue-400/20">
                <LogOut className="w-4 h-4 mr-2" />
                断开连接
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 桌面端侧边栏 */}
      <motion.aside 
        className="fixed top-0 hidden w-64 h-screen p-4 md:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col h-full p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-700/10 backdrop-blur-md border border-blue-400/20 dark:border-blue-500/10 shadow-xl">
          <div className="mb-8 text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            御坂网络
          </div>
          
          <UserInfo 
            status={status} 
            session={session} 
            misakaId={misakaId} 
            connectionStrength={connectionStrength} 
            mousePosition={mousePosition} 
            electricPulse={electricPulse} 
          />
          
          {/* 系统状态指示器 */}
          <div 
            className="p-3 mb-6 text-xs border rounded-lg bg-blue-900/10 border-blue-400/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">系统状态</span>
              <span className="flex items-center text-blue-500">
                <span className="w-1.5 h-1.5 mr-1 bg-blue-500 rounded-full animate-pulse" />
                {systemStatus}
              </span>
            </div>
            <div className="h-1 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                initial={{ width: "0%" }}
                animate={{ width: systemStatus === "准备就绪" ? "100%" : `${electricPulse}%` }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeOut" 
                }}
              />
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            {[
              { icon: <Home className="w-5 h-5" />, label: "主控制台", path: "/feed" },
              { icon: <User className="w-5 h-5" />, label: "个人终端", path: "/profile" },
              { icon: <Zap className="w-5 h-5" />, label: "电磁能力", path: "/powers" },
              { icon: <MessageSquare className="w-5 h-5" />, label: "脑电波通信", path: "/messages" },
              { icon: <Bell className="w-5 h-5" />, label: "系统通知", path: "/notifications" },
              { icon: <Database className="w-5 h-5" />, label: "实验数据", path: "/experiments" },
              { icon: <Settings className="w-5 h-5" />, label: "参数设置", path: "/settings" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="flex items-center px-4 py-3 space-x-3 rounded-lg hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-400/10"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="pt-4 mt-auto border-t border-blue-400/10 dark:border-blue-500/10">
            <Button 
              onClick={logout} 
              variant="outline" 
              className="w-full justify-start border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              断开连接
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* 主内容区 */}
      <main className="md:ml-64 relative">
        {/* 顶部导航栏 - 在滚动时变化 */}
        <motion.header 
          className="sticky top-0 z-40 w-full p-4 bg-gradient-to-b from-blue-900/10 to-blue-900/5 backdrop-blur-md border-b border-blue-400/10 dark:border-blue-500/5 shadow-sm"
          style={{ 
            opacity: headerOpacity,
            backdropFilter: `blur(${headerBlur}px)`,
            y: headerY
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="text-xl font-bold md:hidden text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">御坂网络</div>
            
            <div className="relative flex-1 max-w-md mx-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索实验记录..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-blue-900/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-400/20 dark:border-blue-500/10 transition-all font-mono text-sm"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-blue-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={logout}>
                <LogOut className="w-5 h-5 text-blue-400" />
              </Button>
            </div>
          </div>
          
          {/* 系统状态指示条 - 仅在移动设备显示 */}
          <div className="flex items-center justify-between mt-2 text-xs md:hidden">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-500">{systemStatus}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400">Misaka #{misakaId}</span>
              <span className="px-1.5 py-0.5 text-xs rounded-md bg-blue-500/10 border border-blue-400/20">{connectionStrength}%</span>
            </div>
          </div>
        </motion.header>

        {/* 固定在底部的创建帖子按钮 - 简化样式和动画 */}
        <button
          className="fixed right-6 bottom-6 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* 内容区域 */}
        <div className="container p-4 mx-auto pb-24">
          {/* 实验区域分类标签 */}
          <div 
            className="p-4 mb-6 overflow-x-auto rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-700/10 backdrop-blur-md border border-blue-400/20 dark:border-blue-500/10 shadow-md"
          >
            <div className="text-xs text-center text-blue-400 mb-2 font-mono">{'>'} 请选择实验数据分类</div>
            <div className="flex space-x-2">
              {["全部", "学术", "实验", "技术", "观测", "研究"].map((category) => (
                <button
                  key={category}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all",
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "bg-blue-500/5 backdrop-blur-sm hover:bg-blue-500/10 border border-blue-400/10 dark:border-blue-500/10"
                  )}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 帖子列表 */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-blue-900/5 backdrop-blur-sm animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  index={index} 
                  electricPulse={electricPulse} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

