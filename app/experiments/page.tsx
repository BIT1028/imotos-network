"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Beaker, 
  Brain, 
  Zap, 
  BarChart4, 
  Search, 
  Clock, 
  FileText, 
  Users, 
  Shield, 
  Sparkles,
  Plus,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// 使用动态导入防止Three.js相关的SSR问题
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

export default function ExperimentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [misakaId] = useState(10000 + Math.floor(Math.random() * 10000))
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<string>('ongoing')
  const [hoverCard, setHoverCard] = useState<number | null>(null)
  const [activePulse, setActivePulse] = useState(false)
  const [pulseColor, setPulseColor] = useState('#00a0e9')
  const [pulsePosition, setPulsePosition] = useState<'top' | 'right' | 'bottom' | 'left'>('left')

  // 平滑动画状态
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseXY, setMouseXY] = useState({ x: 0, y: 0 });
  const springConfig = { stiffness: 100, damping: 30 };
  
  useEffect(() => {    
    // 处理未认证用户
    if (status === 'unauthenticated') {
      toast({
        title: "未授权访问",
        description: "请先登录以访问御坂网络实验系统",
        variant: "destructive"
      })
      router.push('/login')
    }

    // 处理鼠标移动 - 平滑效果
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
      setMouseXY({ x: x * 10, y: y * 10 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [status, router])
  
  // 生成模拟实验数据
  const generateExperiments = () => {
    const categories = ['电磁波研究', '脑神经网络', '量子纠缠', '电力传输优化', '无线电传输', '意识传递']
    const statuses = ['进行中', '已完成', '计划中', '暂停', '临界状态']
    const researchers = ['御坂美琴', '御坂10032', '御坂19090', '黒子', '佐天涙子', '木山春生']
    
    return Array.from({ length: 20 }).map((_, i) => {
      const id = i + 1
      const category = categories[Math.floor(Math.random() * categories.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const progress = Math.floor(Math.random() * 100)
      const isSecure = Math.random() > 0.3
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30))
      
      return {
        id,
        title: `实验-${id.toString().padStart(4, '0')}: ${category}${['分析', '测试', '研究', '模拟', '强化'][Math.floor(Math.random() * 5)]}`,
        category,
        description: getDescription(category),
        status,
        progress,
        startDate,
        lastUpdated: new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime())),
        researchLead: researchers[Math.floor(Math.random() * researchers.length)],
        participantCount: Math.floor(Math.random() * 30) + 1,
        securityClearance: isSecure ? '高' : '标准',
        riskLevel: Math.floor(Math.random() * 5) + 1,
        location: ['第一实验室', '第七学区', '电磁屏蔽室', '地下实验室', '无线传输站'][Math.floor(Math.random() * 5)]
      }
    })
  }
  
  const getDescription = (category: string) => {
    switch (category) {
      case '电磁波研究':
        return '研究电磁波在御坂网络中的传播特性和其对网络稳定性的影响。'
      case '脑神经网络':
        return '分析御坂网络中的神经脉冲传递模式和意识同步机制。'
      case '量子纠缠':
        return '探索量子纠缠原理在御坂网络节点间无延迟通信中的应用。'
      case '电力传输优化':
        return '优化网络内电力分配，提高能量使用效率和减少信号损失。'
      case '无线电传输':
        return '测试无线电波在不同环境下对御坂网络通信能力的影响。'
      case '意识传递':
        return '研究意识波形在网络中的传递特性，探索增强节点间情感共鸣的方法。'
      default:
        return '实验内容暂时保密。'
    }
  }
  
  const experiments = generateExperiments()
  
  // 过滤和搜索实验
  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = searchQuery === '' || 
      experiment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experiment.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !filterCategory || experiment.category === filterCategory
    
    const matchesTab = 
      (currentTab === 'ongoing' && experiment.status === '进行中') ||
      (currentTab === 'completed' && experiment.status === '已完成') ||
      (currentTab === 'planned' && experiment.status === '计划中') ||
      (currentTab === 'all')
    
    return matchesSearch && matchesCategory && matchesTab
  })
  
  // 获取所有独特的分类
  const uniqueCategories = Array.from(new Set(experiments.map(exp => exp.category)))
  
  // 处理点击实验卡片
  const handleExperimentClick = (experiment: any) => {
    // 根据实验状态设置不同的脉冲颜色
    let color = '#00a0e9' // 默认科技蓝
    if (experiment.status === '已完成') color = '#10b981' // 绿色
    if (experiment.status === '计划中') color = '#9d00ff' // 霓虹紫
    if (experiment.status === '临界状态') color = '#ef4444' // 红色
    
    // 随机选择脉冲位置
    const positions: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left']
    const randomPosition = positions[Math.floor(Math.random() * positions.length)]
    
    setPulseColor(color)
    setPulsePosition(randomPosition)
    setActivePulse(true)
    
    // 重置脉冲状态
    setTimeout(() => {
      setActivePulse(false)
    }, 1500)
    
    // 此处可以添加其他操作，如打开详情页等
    toast({
      title: `连接至实验-${experiment.id}`,
      description: `正在接入脑电波同步系统，请等待数据传输完成...`,
      variant: "default",
    })
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      {/* 增强的背景效果 - 使用企划书中的暗夜黑(#0a0a12)作为基础 */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a12] to-gray-900 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,160,233,0.05),transparent_70%)] -z-10" /> {/* 科技蓝(#00a0e9) */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.8),rgba(0,0,0,0.2),rgba(0,0,0,0.8))] -z-10" />
      
      {/* 添加霓虹紫(#9d00ff)的光效 */}
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
      
      {/* 毛玻璃效果页头 */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/20 border-b border-blue-900/30 shadow-lg shadow-blue-700/5">
        <div className="container flex items-center justify-between py-4 px-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Beaker className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-medium text-gray-100">
              <span className="font-bold">御坂网络</span> <span className="text-sm text-blue-400 font-light">/ 实验系统</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div 
              className="h-1 w-16 bg-gray-800 rounded-full overflow-hidden"
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0.5 }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-600"
                animate={{ 
                  width: ["0%", "100%", "0%"] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
              />
            </motion.div>
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-900/60 border-blue-900/50 text-blue-300 backdrop-blur-md">
              <span className="font-mono">节点 {misakaId}</span>
            </Badge>
          </div>
        </div>
      </header>
      
      <main className="container max-w-6xl mx-auto py-16 px-6 relative z-10">
        <GlowEffect className="mb-16">
          <div className="text-center">
            <motion.h1 
              className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              实验数据库
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              探索、分析和执行御坂网络中的脑电波实验和研究项目
            </motion.p>
          </div>
        </GlowEffect>
        
        {/* 增强的搜索栏 */}
        <motion.div 
          className="relative max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-blue-600/20 blur-xl rounded-full opacity-50" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full opacity-20" />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-blue-400" />
          <Input
            type="text"
            placeholder="搜索实验项目..."
            className="w-full h-12 pl-12 pr-4 rounded-full bg-gray-900/80 border-gray-800 focus:border-blue-500 focus:ring-blue-500 backdrop-blur-md transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
        
        {/* 主内容区 */}
        <div className="space-y-12">
          {/* 过滤器 - 增强动画和样式 */}
          <motion.div 
            className="flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button 
              variant="outline" 
              size="sm"
              className={`rounded-full px-4 backdrop-blur-md transition-all duration-300 ${!filterCategory ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/30' : 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/60 hover:border-gray-700'}`}
              onClick={() => setFilterCategory(null)}
            >
              全部分类
            </Button>
            {uniqueCategories.map(category => (
              <Button 
                key={category}
                variant="outline" 
                size="sm"
                className={`rounded-full px-4 backdrop-blur-md transition-all duration-300 ${filterCategory === category ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/30' : 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/60 hover:border-gray-700'}`}
                onClick={() => setFilterCategory(category)}
              >
                {category}
              </Button>
            ))}
          </motion.div>
          
          {/* 优化的标签页 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Tabs value={currentTab} onValueChange={value => setCurrentTab(value)} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-gray-900/60 backdrop-blur-lg rounded-lg p-1 border border-[#00a0e9]/20">
                <TabsTrigger 
                  value="ongoing" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00a0e9] data-[state=active]:to-[#0077b6] data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  进行中
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00a0e9] data-[state=active]:to-[#0077b6] data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  已完成
                </TabsTrigger>
                <TabsTrigger 
                  value="planned" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00a0e9] data-[state=active]:to-[#0077b6] data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  计划中
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00a0e9] data-[state=active]:to-[#0077b6] data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  全部
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ongoing" className="mt-8">
                <ExperimentList 
                  experiments={filteredExperiments} 
                  mousePosition={mousePosition}
                  hoverCard={hoverCard}
                  setHoverCard={setHoverCard}
                  onExperimentClick={handleExperimentClick}
                />
              </TabsContent>
              
              <TabsContent value="completed" className="mt-8">
                <ExperimentList 
                  experiments={filteredExperiments} 
                  mousePosition={mousePosition}
                  hoverCard={hoverCard}
                  setHoverCard={setHoverCard}
                  onExperimentClick={handleExperimentClick}
                />
              </TabsContent>
              
              <TabsContent value="planned" className="mt-8">
                <ExperimentList 
                  experiments={filteredExperiments} 
                  mousePosition={mousePosition}
                  hoverCard={hoverCard}
                  setHoverCard={setHoverCard}
                  onExperimentClick={handleExperimentClick}
                />
              </TabsContent>
              
              <TabsContent value="all" className="mt-8">
                <ExperimentList 
                  experiments={filteredExperiments} 
                  mousePosition={mousePosition}
                  hoverCard={hoverCard}
                  setHoverCard={setHoverCard}
                  onExperimentClick={handleExperimentClick}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
        
        {/* 添加新实验按钮 - 增强版 */}
        <motion.div 
          className="fixed bottom-8 right-8 z-20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl" />
          <Button 
            className="relative rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/30 border border-blue-500/20"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </main>

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

        /* 电子脉冲动画 - 企划书中提到的流光脉冲效果 */
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

// 实验列表组件 - 优化组件接口，添加额外props
function ExperimentList({ experiments, mousePosition, hoverCard, setHoverCard, onExperimentClick }: { 
  experiments: any[], 
  mousePosition: { x: number, y: number },
  hoverCard: number | null,
  setHoverCard: (id: number | null) => void,
  onExperimentClick?: (experiment: any) => void
}) {
  if (experiments.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 mb-4 rounded-full bg-gray-800/60 backdrop-blur-md border border-gray-700/30">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <p className="mb-2 text-xl font-medium">暂无匹配实验</p>
        <p className="text-gray-500">尝试调整搜索条件或过滤器</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {experiments.map((experiment, index) => (
        <motion.div
          key={experiment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05,
            type: "spring",
            stiffness: 100,
            damping: 20 
          }}
          onClick={() => onExperimentClick?.(experiment)}
        >
          <ExperimentCard 
            experiment={experiment} 
            isHovered={hoverCard === experiment.id}
            onHover={() => setHoverCard(experiment.id)}
            onLeave={() => setHoverCard(null)}
            mousePosition={mousePosition}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// 实验卡片组件 - 增强交互效果
function ExperimentCard({ 
  experiment, 
  isHovered,
  onHover,
  onLeave,
  mousePosition
}: { 
  experiment: any,
  isHovered: boolean,
  onHover: () => void,
  onLeave: () => void,
  mousePosition: { x: number, y: number }
}) {
  // 节点连接动画状态
  const [showConnection, setShowConnection] = useState(false)
  
  // 当卡片被hover时，随机显示节点连接动画
  useEffect(() => {
    if (isHovered && Math.random() > 0.5) {
      const timer = setTimeout(() => {
        setShowConnection(true)
        
        setTimeout(() => {
          setShowConnection(false)
        }, 1000)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [isHovered])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case '进行中': return 'bg-[#00a0e9]' // 使用科技蓝
      case '已完成': return 'bg-green-500'
      case '计划中': return 'bg-[#9d00ff]' // 使用霓虹紫
      case '暂停': return 'bg-amber-500'
      case '临界状态': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case '进行中': return 'text-[#00a0e9]' // 使用科技蓝
      case '已完成': return 'text-green-400'
      case '计划中': return 'text-[#9d00ff]' // 使用霓虹紫
      case '暂停': return 'text-amber-400'
      case '临界状态': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* 光效背景 */}
      <motion.div 
        className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 via-transparent to-blue-700/30 rounded-lg opacity-0 transition-opacity"
        animate={{ opacity: isHovered ? 0.6 : 0 }}
      />
      
      {/* 毛玻璃效果卡片 */}
      <div className="p-6 border border-gray-800 rounded-lg bg-gray-900/60 backdrop-blur-xl hover:bg-gray-900/80 hover:border-blue-900/50 transition-all duration-300 group">
        {/* 卡片内容 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-800/70 backdrop-blur-md border-gray-700/80 text-gray-300">
              <span className="font-mono">#{experiment.id.toString().padStart(4, '0')}</span>
            </Badge>
            <span className={`text-sm font-medium ${getStatusText(experiment.status)}`}>
              {experiment.status}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            更新于 {experiment.lastUpdated.toLocaleDateString()}
          </div>
        </div>
        
        {/* 节点连接可视化 - 企划书中提到的"节点间连线亮度反映通信频率" */}
        {showConnection && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-[#00a0e9] to-transparent"
              style={{ 
                top: '50%',
                left: 0,
                right: 0,
                opacity: 0
              }}
              animate={{
                opacity: [0, 0.8, 0],
                width: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
            />
            {/* 数据传输效果 */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#00a0e9]/20 backdrop-blur-sm p-1 rounded text-xs font-mono text-[#00a0e9]"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0, 1, 0],
                y: [20, 0, -20]
              }}
              transition={{ duration: 1 }}
            >
              数据同步中...
            </motion.div>
          </div>
        )}
        
        <h3 className="text-xl font-medium mb-2 group-hover:text-[#00a0e9] transition-colors">
          {experiment.title}
          <motion.span 
            className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ x: isHovered ? [0, 5, 0] : 0 }}
            transition={{ repeat: isHovered ? Infinity : 0, duration: 1.5 }}
          >
            <ArrowRight className="h-4 w-4 inline-block" />
          </motion.span>
        </h3>
        <p className="text-gray-400 mb-6 font-light">{experiment.description}</p>
        
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-xs text-gray-500 mb-1 font-medium">研究领导</div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mr-2"></div>
              <div>{experiment.researchLead}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 font-medium">参与人数</div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-blue-400 mr-2" />
              <div>{experiment.participantCount}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 font-medium">实验位置</div>
            <div>{experiment.location}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 font-medium">安全等级</div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-blue-400 mr-2" />
              <div>{experiment.securityClearance}</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500 font-medium">进度</div>
            <div className="text-xs text-blue-400 font-mono">{experiment.progress}%</div>
          </div>
          
          {/* 修复Progress组件使用，移除不支持的prop */}
          <div className="relative h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${experiment.progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-gray-800/70 backdrop-blur-md text-blue-400 border-blue-900/40">
              {experiment.category}
            </Badge>
            {experiment.riskLevel >= 4 && (
              <Badge variant="outline" className="bg-gray-800/70 backdrop-blur-md text-red-400 border-red-900/40">
                高风险
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 flex items-center backdrop-blur-md transition-all duration-300"
          >
            详细信息
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}