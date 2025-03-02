"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Zap, AlertCircle, Send, Users, Search, Filter, X, ChevronRight, ChevronDown, Edit, MoreVertical, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { useMisakaNetwork, BrainwaveMessage, NetworkUpdate } from '@/hooks/useMisakaNetwork'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [misakaId] = useState(10000 + Math.floor(Math.random() * 10000))
  const { 
    isConnected, 
    connectionStrength, 
    messages, 
    networkState, 
    sendMessage, 
    sendEmergencyMessage,
    addNetworkUpdateListener
  } = useMisakaNetwork(misakaId)
  
  const [inputMessage, setInputMessage] = useState('')
  const [currentTab, setCurrentTab] = useState('broadcast')
  const [directRecipient, setDirectRecipient] = useState<number | null>(null)
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // 处理未认证用户
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast({
        title: "未授权访问",
        description: "请先登录以访问御坂网络脑电波通信系统",
        variant: "destructive"
      })
      router.push('/login')
    }
  }, [status, router])
  
  // 监听网络更新
  useEffect(() => {
    const removeListener = addNetworkUpdateListener((update: NetworkUpdate) => {
      console.log('网络更新:', update)
    })
    
    return () => removeListener()
  }, [addNetworkUpdateListener])
  
  // 发送消息处理
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    let options: {
      messageType: 'BROADCAST' | 'DIRECT' | 'EMERGENCY',
      receiverId?: number,
      priority: number
    } = {
      messageType: 'BROADCAST',
      priority: 5
    }
    
    // 根据当前选项卡设置消息类型
    if (currentTab === 'direct' && directRecipient) {
      options.messageType = 'DIRECT'
      options.receiverId = directRecipient
    } else if (currentTab === 'emergency') {
      options.messageType = 'EMERGENCY'
      options.priority = 10
    }
    
    // 发送消息
    const success = sendMessage(inputMessage, options)
    
    if (success) {
      setInputMessage('')
      if (currentTab === 'emergency') {
        setShowEmergencyAlert(false)
      }
    }
  }
  
  // 过滤当前选项卡相关的消息
  const filteredMessages = messages.filter(msg => {
    if (currentTab === 'broadcast') {
      return msg.messageType === 'BROADCAST'
    } else if (currentTab === 'direct') {
      return msg.messageType === 'DIRECT' && (
        msg.senderId === directRecipient || 
        msg.receiverId === directRecipient
      )
    } else if (currentTab === 'emergency') {
      return msg.messageType === 'EMERGENCY'
    } else if (currentTab === 'system') {
      return msg.messageType === 'SYSTEM'
    }
    return true
  })
  
  // 紧急消息确认对话框
  const EmergencyConfirmation = () => (
    <Dialog open={showEmergencyAlert} onOpenChange={setShowEmergencyAlert}>
      <DialogContent className="bg-red-900/90 border-red-500 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-300" />
            紧急通信确认
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center">
          <p className="mb-4">您即将发送紧急优先级脑电波，此操作将通知所有连接到御坂网络的节点。</p>
          <p className="mb-6 text-red-300">请确认这是一个真正的紧急情况。</p>
          <div className="flex justify-center space-x-3">
            <Button 
              variant="outline" 
              className="border-red-300 text-red-300 hover:bg-red-800"
              onClick={() => setShowEmergencyAlert(false)}
            >
              取消
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleSendMessage}
            >
              确认发送紧急消息
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
  
  // 处理紧急消息请求
  const handleEmergencyRequest = () => {
    setCurrentTab('emergency')
    setShowEmergencyAlert(true)
  }
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-950">
        <div className="p-8 text-center">
          <div className="mb-4 text-xl font-mono text-blue-400">正在连接御坂网络...</div>
          <div className="w-12 h-12 mx-auto border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-blue-950 font-mono">
      <EmergencyConfirmation />
      
      {/* 电磁场背景效果 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* 网格背景 */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 119, 182, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 119, 182, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* 电磁波纹动画 */}
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
      
      <header className="sticky top-0 z-20 p-4 bg-white/80 dark:bg-blue-950/80 backdrop-blur-md border-b border-blue-400/10 shadow-sm">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              御坂网络 - 脑电波通信
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-3 py-1 space-x-2 text-xs border rounded-full bg-blue-500/5 border-blue-400/20">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{isConnected ? '已连接' : '连接断开'}</span>
              {isConnected && (
                <span className="px-1 py-0.5 text-xs bg-blue-500/10 rounded-md">
                  {connectionStrength}%
                </span>
              )}
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleEmergencyRequest}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>紧急优先通信</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>
      
      <main className="container grid p-4 pb-24 mx-auto md:grid-cols-4 gap-4">
        {/* 网络状态侧边栏 */}
        <aside className="p-4 rounded-xl bg-gradient-to-br from-blue-900/10 to-blue-700/5 backdrop-blur-md border border-blue-400/10 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">网络状态监控</h2>
            <Badge variant="outline" className="text-xs border-blue-400/30">
              v2.0
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 text-xs border rounded-lg bg-blue-900/5 border-blue-400/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">节点数量</span>
                <span className="text-blue-500">{networkState.activeCount}</span>
              </div>
              <div className="h-1 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(100, networkState.activeCount / 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            <div className="p-3 text-xs border rounded-lg bg-blue-900/5 border-blue-400/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">网络负载</span>
                <span className="text-blue-500">{networkState.networkLoad}%</span>
              </div>
              <div className="h-1 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                  initial={{ width: "0%" }}
                  animate={{ width: `${networkState.networkLoad}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            <div className="p-3 text-xs border rounded-lg bg-blue-900/5 border-blue-400/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">系统状态</span>
                <span className="flex items-center text-blue-500">
                  <span className="w-1.5 h-1.5 mr-1 bg-blue-500 rounded-full animate-pulse" />
                  {networkState.systemStatus}
                </span>
              </div>
            </div>
            
            <div className="p-3 space-y-2 border rounded-lg bg-blue-900/5 border-blue-400/10">
              <div className="text-xs text-gray-500 dark:text-gray-400">本节点信息</div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                  M
                </div>
                <div>
                  <div className="text-sm">{session?.user?.name || `御坂${misakaId}`}</div>
                  <div className="text-xs text-gray-500">ID: {misakaId}</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 space-y-2 border rounded-lg bg-blue-900/5 border-blue-400/10">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">通信端点</div>
                <Button variant="ghost" size="icon" className="w-5 h-5">
                  <Search className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Button 
                    key={i}
                    variant="ghost" 
                    className="flex items-center justify-between w-full h-auto p-2 text-left"
                    onClick={() => {
                      setDirectRecipient(10000 + i)
                      setCurrentTab('direct')
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                      <div>
                        <div className="text-xs">御坂{10000 + i}</div>
                        <div className="text-xs text-gray-500">学园都市</div>
                      </div>
                    </div>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </aside>
        
        {/* 消息区域 */}
        <div className="relative flex flex-col md:col-span-3 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-blue-400/10 shadow-md">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">
            <div className="flex items-center justify-between p-3 border-b border-blue-400/10">
              <TabsList className="bg-blue-500/5">
                <TabsTrigger value="broadcast" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-1" />
                  广播
                </TabsTrigger>
                <TabsTrigger value="direct" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  直接通信
                </TabsTrigger>
                <TabsTrigger value="emergency" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  紧急
                </TabsTrigger>
                <TabsTrigger value="system" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Zap className="w-4 h-4 mr-1" />
                  系统
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <TabsContent value="broadcast" className="space-y-4 mt-0 h-full min-h-[400px]">
                <div className="text-xs text-center text-gray-500">
                  广播消息将发送给所有连接的节点
                </div>
                <AnimatePresence>
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                      <div className="p-4 mb-4 rounded-full bg-blue-500/10">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="mb-2 text-sm text-gray-500">暂无广播消息</p>
                      <p className="text-xs text-gray-400">第一条广播消息将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMessages.map((msg, index) => (
                        <motion.div
                          key={`${msg.senderId}-${msg.timestamp}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${msg.senderId === misakaId ? 'justify-end' : ''}`}
                        >
                          <div 
                            className={`max-w-3/4 rounded-lg p-3 ${
                              msg.senderId === misakaId 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-500/10 border border-blue-400/20'
                            }`}
                          >
                            <div className="flex items-center mb-1 space-x-2">
                              <span className="font-medium text-xs">{msg.senderName}</span>
                              <span className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="direct" className="space-y-4 mt-0 h-full min-h-[400px]">
                {directRecipient ? (
                  <>
                    <div className="p-2 mb-4 text-xs border rounded-lg bg-blue-500/5 border-blue-400/20 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span>直接通信: 御坂{directRecipient}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-5 h-5" 
                        onClick={() => setDirectRecipient(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <AnimatePresence>
                      {filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10">
                          <div className="p-4 mb-4 rounded-full bg-blue-500/10">
                            <MessageSquare className="w-8 h-8 text-blue-500" />
                          </div>
                          <p className="mb-2 text-sm text-gray-500">暂无直接通信消息</p>
                          <p className="text-xs text-gray-400">与御坂{directRecipient}的通信记录将显示在这里</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredMessages.map((msg, index) => (
                            <motion.div
                              key={`${msg.senderId}-${msg.timestamp}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex ${msg.senderId === misakaId ? 'justify-end' : ''}`}
                            >
                              <div 
                                className={`max-w-3/4 rounded-lg p-3 ${
                                  msg.senderId === misakaId 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-500/10 border border-blue-400/20'
                                }`}
                              >
                                <div className="flex items-center mb-1 space-x-2">
                                  <span className="font-medium text-xs">{msg.senderName}</span>
                                  <span className="text-xs opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            </motion.div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <div className="p-4 mb-4 rounded-full bg-blue-500/10">
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="mb-2 text-sm text-gray-500">选择一个通信端点</p>
                    <p className="text-xs text-gray-400">从左侧边栏选择一个节点开始直接通信</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="emergency" className="space-y-4 mt-0 h-full min-h-[400px]">
                <div className="text-xs text-center text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/20">
                  紧急通信优先级最高，将立即通知所有节点
                </div>
                <AnimatePresence>
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                      <div className="p-4 mb-4 rounded-full bg-red-500/10">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="mb-2 text-sm text-gray-500">暂无紧急通信</p>
                      <p className="text-xs text-gray-400">紧急优先级消息将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMessages.map((msg, index) => (
                        <motion.div
                          key={`${msg.senderId}-${msg.timestamp}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${msg.senderId === misakaId ? 'justify-end' : ''}`}
                        >
                          <div 
                            className={`max-w-3/4 rounded-lg p-3 ${
                              msg.senderId === misakaId 
                                ? 'bg-red-500 text-white' 
                                : 'bg-red-500/10 border border-red-400/20'
                            }`}
                          >
                            <div className="flex items-center mb-1 space-x-2">
                              <AlertCircle className="w-3 h-3" />
                              <span className="font-medium text-xs">{msg.senderName}</span>
                              <span className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="system" className="space-y-4 mt-0 h-full min-h-[400px]">
                <div className="text-xs text-center text-blue-500 bg-blue-500/5 p-2 rounded-lg border border-blue-500/20">
                  系统通知和御坂网络状态更新
                </div>
                <AnimatePresence>
                  {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                      <div className="p-4 mb-4 rounded-full bg-blue-500/10">
                        <Zap className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="mb-2 text-sm text-gray-500">暂无系统消息</p>
                      <p className="text-xs text-gray-400">御坂网络系统通知将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMessages.map((msg, index) => (
                        <motion.div
                          key={`${msg.senderId}-${msg.timestamp}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex"
                        >
                          <div className="max-w-3/4 rounded-lg p-3 bg-blue-900/20 border border-blue-400/20">
                            <div className="flex items-center mb-1 space-x-2">
                              <Zap className="w-3 h-3 text-blue-400" />
                              <span className="font-medium text-xs text-blue-400">{msg.senderName}</span>
                              <span className="text-xs opacity-70">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </div>
            
            {/* 消息输入区域 */}
            <div className="p-3 border-t border-blue-400/10">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (
                      currentTab === 'emergency' ? setShowEmergencyAlert(true) : handleSendMessage()
                    )}
                    placeholder={
                      currentTab === 'broadcast' ? "输入广播消息..." :
                      currentTab === 'direct' ? `发送给御坂${directRecipient || '...'}` :
                      currentTab === 'emergency' ? "紧急消息内容..." :
                      "系统通知内容..."
                    }
                    className="pr-10 border-blue-400/20 bg-blue-500/5 focus-visible:ring-blue-500"
                    disabled={!isConnected || (currentTab === 'direct' && !directRecipient) || currentTab === 'system'}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  className={`${
                    currentTab === 'emergency' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  size="icon"
                  disabled={!isConnected || !inputMessage.trim() || (currentTab === 'direct' && !directRecipient) || currentTab === 'system'}
                  onClick={() => currentTab === 'emergency' ? setShowEmergencyAlert(true) : handleSendMessage()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  {isConnected ? (
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 mr-1 bg-green-500 rounded-full" />
                      御坂网络已连接
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 mr-1 bg-red-500 rounded-full" />
                      连接断开
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {currentTab === 'broadcast' && '广播模式'}
                  {currentTab === 'direct' && directRecipient && `直接通信: 御坂${directRecipient}`}
                  {currentTab === 'emergency' && '紧急优先模式'}
                  {currentTab === 'system' && '系统模式（只读）'}
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 