"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sparkles, Zap, Database, Users, Lock, ArrowRight, CircuitBoard, Brain } from "lucide-react"
import dynamic from "next/dynamic"

// 动态导入背景组件，防止SSR问题
const DNABackground = dynamic(() => import('@/components/DNABackground'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-5 opacity-30 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 bg-blue-500/5 blur-3xl rounded-full"></div>
    </div>
  )
})

const PulseEffect = dynamic(() => import('@/components/PulseEffect'), { ssr: false })

// 自定义组件：流光效果div
const GlowEffect = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent glow-animation" />
    {children}
  </div>
);

export default function Home() {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // 背景视差效果
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  // 鼠标视差效果
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mouseXY, setMouseXY] = useState({ x: 0, y: 0 })
  
  // 模拟电流效果的状态
  const [electricPulse, setElectricPulse] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState("正在建立连接...")
  const [misakaId] = useState(10000 + Math.floor(Math.random() * 10000))
  const [activePulse, setActivePulse] = useState(false)
  const [pulseColor, setPulseColor] = useState('#00a0e9')
  const [pulsePosition, setPulsePosition] = useState<'top' | 'right' | 'bottom' | 'left'>('left')
  
  useEffect(() => {
    setMounted(true)
    
    // 处理鼠标移动 - 平滑效果
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
      setMouseXY({ x: x * 10, y: y * 10 });
    };
    
    window.addEventListener("mousemove", handleMouseMove)
    
    // 模拟连接到御坂网络的过程
    const statusMessages = [
      "正在建立连接...",
      "正在验证节点身份...",
      "正在同步电磁波频率...",
      "正在连接御坂网络...",
      "连接成功，欢迎来到御坂网络终端",
    ]
    
    statusMessages.forEach((message, index) => {
      setTimeout(() => {
        setConnectionStatus(message)
        
        // 在最后一条消息时触发脉冲效果
        if (index === statusMessages.length - 1) {
          setPulseColor('#00a0e9')
          setPulsePosition('top')
          setActivePulse(true)
          setTimeout(() => setActivePulse(false), 1500)
        }
      }, 1000 * (index + 1))
    })
    
    // 创建电流脉冲效果
    const pulseInterval = setInterval(() => {
      setElectricPulse(prev => (prev + 1) % 100)
    }, 100)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(pulseInterval)
    }
  }, [])

  const navigateToLogin = () => { 
    setPulseColor('#00a0e9')
    setPulsePosition('right')
    setActivePulse(true)
    setTimeout(() => {
      setActivePulse(false)
      router.push("/login") 
    }, 800)
  }
  
  const navigateToRegister = () => { 
    setPulseColor('#9d00ff')
    setPulsePosition('left')
    setActivePulse(true)
    setTimeout(() => {
      setActivePulse(false)
      router.push("/register") 
    }, 800)
  }

  if (!mounted) return null

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden font-mono">
      {/* 动态背景 - 学园都市电磁科技风格 */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a12] to-gray-900 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,160,233,0.05),transparent_70%)] -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.8),rgba(0,0,0,0.2),rgba(0,0,0,0.8))] -z-10" />
      
      {/* 添加霓虹紫的光效 */}
      <div className="fixed inset-0 overflow-hidden -z-5">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#9d00ff]/10 blur-3xl rounded-full"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-[#00a0e9]/10 blur-3xl rounded-full"></div>
      </div>
      
      {/* 集成DNA双螺旋背景 */}
      <DNABackground />
      
      {/* 动态光点 */}
      <motion.div 
        className="fixed w-40 h-40 rounded-full bg-[#00a0e9]/10 blur-3xl -z-5"
        animate={{
          x: mouseXY.x,
          y: mouseXY.y,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 50
        }}
        style={{ 
          left: "calc(50% - 5rem)", 
          top: "calc(30% - 5rem)" 
        }}
      />

      {/* 电路网格效果 */}
      <div 
        className="fixed inset-0 -z-5 grid-background" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 160, 233, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 160, 233, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* 电磁波纹动画 - 简化版本 */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
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

      {/* 主内容区 */}
      <div className="container relative z-10 max-w-6xl px-6 mx-auto">
        {/* 顶部导航 */}
        <motion.header 
          className="flex items-center justify-between py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              御坂网络
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden px-3 py-1 text-xs border rounded-full md:block text-blue-400 border-blue-400/20">
              <span className="font-mono">节点 #{misakaId}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={navigateToLogin}
                className="hover:bg-blue-500/10 hover:text-blue-400 border border-transparent hover:border-blue-400/20"
              >
                登录
              </Button>
              <Button 
                onClick={navigateToRegister}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-0"
              >
                注册
              </Button>
            </div>
          </div>
        </motion.header>

        {/* 英雄区 */}
        <div className="relative flex flex-col items-center justify-center py-20 text-center lg:py-32">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ scale, y: textY }}
          >
            {/* 背景装饰元素 */}
            <div className="absolute top-0 left-1/4 w-20 h-20 border border-blue-400/10 rounded-full" />
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 border border-blue-400/5 rounded-full" />
          </motion.div>

          <GlowEffect className="mb-8">
            <motion.h1 
              className="text-5xl font-bold mb-3 md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              御坂网络终端
            </motion.h1>
          </GlowEffect>

          <motion.p 
            className="max-w-2xl mb-8 text-xl text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            接入学园都市最先进的脑电波通信系统，如此这般，御坂解释道
          </motion.p>

          <motion.div 
            className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              onClick={navigateToRegister}
              className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-500/20"
            >
              <CircuitBoard className="w-5 h-5 mr-2" />
              创建节点
            </Button>
            <Button
              onClick={navigateToLogin}
              variant="outline"
              className="px-8 py-6 text-lg text-blue-400 border-blue-400/20 hover:bg-blue-500/10 hover:border-blue-400/30"
            >
              <Lock className="w-5 h-5 mr-2" />
              节点验证
            </Button>
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="px-4 py-2 text-xs text-blue-400 border border-blue-400/10 rounded-full backdrop-blur-sm bg-blue-500/5">
              {connectionStatus}
            </div>
          </motion.div>
        </div>

        {/* 特性部分 */}
        <motion.h2 
          className="mt-20 mb-10 text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          御坂网络能力
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 mb-20 md:grid-cols-3">
          {[
            { 
              title: "脑电波通信", 
              description: "无论身处何地，御坂网络成员可通过脑电波共享信息，形成无缝连接的姐妹网络",
              icon: <Brain className="w-6 h-6 text-blue-400" />,
              color: "#00a0e9"
            },
            { 
              title: "电磁能力", 
              description: "每个节点都拥有独立的电磁能力，多节点协同工作可形成强大的电磁力场",
              icon: <Zap className="w-6 h-6 text-purple-400" />,
              color: "#9d00ff" 
            },
            { 
              title: "实验数据", 
              description: "接入第七学区研究数据库，获取最新实验结果和科研进展",
              icon: <Database className="w-6 h-6 text-blue-400" />,
              color: "#00a0e9" 
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 transition-all rounded-xl backdrop-blur-md bg-gradient-to-br from-blue-900/10 to-blue-700/5 border border-blue-400/10 hover:shadow-xl hover:border-blue-400/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: `0 0 30px rgba(0, 120, 255, 0.2)`,
                borderColor: 'rgba(0, 150, 255, 0.3)'
              }}
              style={{
                boxShadow: `0 0 ${5 + (electricPulse / 10)}px ${feature.color}${0.03 + (electricPulse % 20) / 500}`
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-400/20">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-medium">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* 加入我们部分 */}
        <motion.div
          className="relative p-8 my-16 overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-400/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          whileHover={{ 
            boxShadow: `0 0 30px rgba(0, 120, 255, 0.2)`,
            borderColor: 'rgba(0, 150, 255, 0.3)'
          }}
        >
          {/* 背景效果 */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full"></div>
          
          <div className="relative flex flex-col items-center md:flex-row md:justify-between">
            <div className="mb-6 text-center md:text-left md:mb-0">
              <h3 className="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                加入御坂网络
              </h3>
              <p className="max-w-md text-gray-400">
                成为20,001个御坂网络节点之一，获取电磁能力与实验数据访问权限
              </p>
            </div>
            <Button
              onClick={navigateToRegister}
              className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-0 shadow-lg shadow-blue-500/20"
            >
              节点注册
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
        
        {/* 底部版权信息 */}
        <motion.div
          className="flex flex-col items-center justify-center my-12 space-y-1 text-xs text-center text-blue-400/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <div>御坂网络 - Protocol v2.0</div>
          <div>学园都市第七学区 - 机密等级3 - 仅限御坂网络成员访问</div>
          <div>「此终端由Last Order管理维护」</div>
        </motion.div>
      </div>

      {/* 流光脉冲效果 */}
      <PulseEffect 
        active={activePulse} 
        color={pulseColor} 
        position={pulsePosition} 
      />

      {/* 添加CSS动画 */}
      <style jsx global>{`
        @keyframes glow {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 0.8; transform: translateX(100%); }
        }
        .glow-animation {
          animation: glow 5s infinite;
        }

        /* 电子脉冲动画 */
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        /* 电网背景动画 */
        @keyframes flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }
        
        /* 添加网格背景 */
        .grid-background {
          background-image: 
            linear-gradient(to right, rgba(0, 160, 233, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 160, 233, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          animation: flicker 4s infinite;
        }
        
        /* 电子传输效果 */
        @keyframes dataTransfer {
          0% { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          50% { 
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
          100% { 
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
        }
        
        .data-transfer {
          animation: dataTransfer 1.5s ease-in-out;
        }

        /* 自定义字体样式 */
        .font-mono {
          font-family: 'JetBrains Mono', monospace, ui-monospace, SFMono-Regular;
          letter-spacing: -0.02em;
        }
        
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        /* 企划书中提到的科技颜色变量 */
        :root {
          --tech-blue: #00a0e9;
          --night-black: #0a0a12;
          --neon-purple: #9d00ff;
        }
      `}</style>
    </div>
  )
}

