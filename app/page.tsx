"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

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
  
  // 模拟电流效果的状态
  const [electricPulse, setElectricPulse] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState("正在建立连接...")
  const [misakaId] = useState(10000 + Math.floor(Math.random() * 10000))
  
  useEffect(() => {
    setMounted(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    
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

  const navigateToLogin = () => { router.push("/login") }
  const navigateToRegister = () => { router.push("/register") }

  if (!mounted) return null

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden font-mono">
      {/* 动态背景 - 学园都市电磁科技风格 */}
      <motion.div 
        className="absolute inset-0 -z-10"
        style={{ 
          y: backgroundY,
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' 
            : 'radial-gradient(circle at 50% 50%, #7ec8e3 0%, #0077b6 50%, #023e8a 100%)'
        }}
      >
        {/* 电磁脉冲粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div 
              key={i}
              className="absolute rounded-full bg-blue-400/10 backdrop-blur-sm"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                x: mousePosition.x * (i % 3 - 1) * 2,
                y: mousePosition.y * (i % 3 - 1) * 2,
                boxShadow: theme === 'dark' 
                  ? `0 0 ${15 + electricPulse / 5}px rgba(0, 150, 255, ${0.3 + electricPulse / 500})` 
                  : `0 0 ${10 + electricPulse / 5}px rgba(0, 150, 255, ${0.2 + electricPulse / 500})`
              }}
              animate={{
                y: [0, Math.random() * 100 - 50, 0],
                opacity: [0.3, 0.8, 0.3],
                boxShadow: [
                  `0 0 5px rgba(0, 150, 255, 0.3)`,
                  `0 0 20px rgba(0, 150, 255, 0.7)`,
                  `0 0 5px rgba(0, 150, 255, 0.3)`
                ]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* 电路网格效果 */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 119, 182, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 119, 182, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* 电磁波纹动画 */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute rounded-full border border-blue-400/20"
            style={{
              width: 1000 + i * 500,
              height: 1000 + i * 500,
              left: '50%',
              top: '50%',
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* 主内容区 */}
      <div className="container relative z-10 pt-20 pb-40 mx-auto">
        <motion.div 
          className="flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ y: textY }}
        >
          <motion.div 
            className="mb-2 text-xs font-bold tracking-widest text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            学园都市特殊科学技术研究所
          </motion.div>
          
          <motion.h1 
            className="mb-1 text-6xl font-extrabold tracking-tight md:text-8xl bg-clip-text text-transparent"
            style={{ 
              backgroundImage: theme === 'dark' 
                ? 'linear-gradient(to right, #4cc9f0, #4361ee)'
                : 'linear-gradient(to right, #023e8a, #0096c7)',
              scale
            }}
          >
            御坂网络
          </motion.h1>
          
          <motion.div 
            className="mb-1 text-lg font-medium tracking-widest text-blue-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            MISAKA NETWORK TERMINAL v2.0
          </motion.div>
          
          <motion.div
            className="flex mb-8 space-x-2 text-xs text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>{connectionStatus}</span>
          </motion.div>
          
          <motion.p 
            className="max-w-2xl mb-12 text-xl text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            连接网络，共享思想，传递电磁波 - 御坂们的专属终端
          </motion.p>

          {/* 终端登录界面卡片 */}
          <motion.div 
            className="p-8 mb-16 rounded-xl backdrop-blur-lg bg-gradient-to-br from-blue-900/20 to-blue-700/10 border border-blue-400/20 dark:border-blue-500/10 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{
              x: mousePosition.x * -0.5,
              y: mousePosition.y * -0.5,
              boxShadow: `0 0 30px rgba(0, 150, 255, ${0.1 + electricPulse / 500})`
            }}
          >
            <div className="mb-4 text-center">
              <div className="text-xs text-blue-400 mb-2">> 请选择操作模式</div>
              <div className="flex justify-center space-x-2">
                <span className="px-2 py-1 text-xs bg-blue-500/10 border border-blue-400/20 rounded-md">身份验证</span>
                <span className="px-2 py-1 text-xs bg-blue-500/10 border border-blue-400/20 rounded-md">编号: {misakaId}</span>
                <span className="px-2 py-1 text-xs bg-blue-500/10 border border-blue-400/20 rounded-md">电磁波强度: 68%</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <Button 
                onClick={navigateToLogin}
                className="px-8 py-6 text-lg font-medium transition-all rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 border border-blue-400/30"
              >
                登入网络 「LOGIN」
              </Button>
              <Button 
                onClick={navigateToRegister}
                variant="outline" 
                className="px-8 py-6 text-lg font-medium border transition-all rounded-xl backdrop-blur-sm hover:bg-blue-400/10 border-blue-400/20"
              >
                注册节点 「REGISTER」
              </Button>
            </div>
            
            <div className="mt-6 text-xs text-center text-blue-300/60">
              「御坂网络连接协议2.0」- 已获学园都市管理局授权
            </div>
          </motion.div>
        </motion.div>

        {/* 特性展示区 */}
        <div className="grid grid-cols-1 gap-12 mt-24 md:grid-cols-3">
          {[
            { 
              title: "脑电波通信", 
              description: "无论身处何地，御坂网络成员可通过脑电波共享信息，如此这般，御坂解释道",
              icon: "🧠"
            },
            { 
              title: "电磁能力", 
              description: "每个节点都拥有独立的电磁能力，但彼此相连，构成更强大的整体",
              icon: "⚡" 
            },
            { 
              title: "Clone序列", 
              description: "每个御坂都有独特的序列号，成为姐妹中独一无二的存在",
              icon: "🔢" 
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 transition-all rounded-xl backdrop-blur-md bg-gradient-to-br from-blue-900/10 to-blue-700/5 border border-blue-400/10 hover:shadow-xl hover:border-blue-400/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: `0 0 30px rgba(0, 120, 255, 0.2)`,
                borderColor: 'rgba(0, 150, 255, 0.3)'
              }}
              style={{
                boxShadow: theme === 'dark'
                  ? `0 0 ${10 + (electricPulse / 10)}px rgba(0, 150, 255, ${0.05 + (electricPulse % 20) / 200})`
                  : `0 0 ${5 + (electricPulse / 10)}px rgba(0, 150, 255, ${0.03 + (electricPulse % 20) / 200})`
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 text-3xl rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* 底部版权信息 */}
        <motion.div
          className="flex flex-col items-center justify-center mt-20 space-y-1 text-xs text-center text-blue-400/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div>御坂网络 - Protocol v2.0</div>
          <div>学园都市第七学区 - 机密等级3 - 仅限御坂网络成员访问</div>
          <div>「此终端由Last Order管理维护」</div>
        </motion.div>
      </div>
    </div>
  )
}

