import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'
import { toast } from '@/components/ui/use-toast'
import { z } from 'zod'

// 导入与服务器端相同的消息类型定义 
export const BrainwaveMessageSchema = z.object({
  senderId: z.number(),
  senderName: z.string(),
  receiverId: z.number().optional(),
  messageType: z.enum(['BROADCAST', 'DIRECT', 'SYSTEM', 'EMERGENCY']),
  content: z.string(),
  timestamp: z.number(),
  priority: z.number().min(1).max(10).default(5),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional(),
  encryptionLevel: z.enum(['NONE', 'LEVEL1', 'LEVEL2', 'LEVEL3']).default('NONE')
})

export type BrainwaveMessage = z.infer<typeof BrainwaveMessageSchema>

// 网络状态类型
export type NetworkState = {
  activeCount: number;
  systemStatus: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE' | 'EMERGENCY';
  networkLoad: number;
  timestamp: number;
}

// 节点更新类型
export type NetworkUpdate = {
  type: 'NODE_JOINED' | 'NODE_LEFT' | 'NODE_INACTIVE';
  data: {
    nodeId: number;
    nodeName: string;
  }
}

/**
 * 御坂网络脑电波通信Hook
 * 
 * 提供与御坂网络连接的核心功能：
 * - 节点注册（Misaka节点身份识别）
 * - 脑电波通信（实时消息传递）
 * - 网络状态监控
 * - 电磁波强度管理
 */
export function useMisakaNetwork(misakaId: number, misakaName?: string) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStrength, setConnectionStrength] = useState(0)
  const [messages, setMessages] = useState<BrainwaveMessage[]>([])
  const [networkState, setNetworkState] = useState<NetworkState>({
    activeCount: 0,
    systemStatus: 'ONLINE',
    networkLoad: 0,
    timestamp: Date.now()
  })
  
  // 使用useRef存储网络更新监听器
  const networkUpdateListeners = useRef<((update: NetworkUpdate) => void)[]>([])
  
  // 初始化WebSocket连接
  useEffect(() => {
    // 只有在客户端且有misakaId时才连接
    if (typeof window === 'undefined' || !misakaId) return
    
    // 创建Socket实例
    const socketInstance = io({
      path: '/api/socket',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    })
    
    // 连接事件处理
    socketInstance.on('connect', () => {
      console.log('已连接到御坂网络')
      setIsConnected(true)
      
      // 节点注册
      const name = misakaName || session?.user?.name || `御坂${misakaId}`
      socketInstance.emit('register_node', {
        nodeId: misakaId,
        nodeName: name,
        location: '第七学区'
      })
      
      // 模拟连接强度变化
      setConnectionStrength(85 + Math.floor(Math.random() * 15))
      
      toast({
        title: "御坂网络连接成功",
        description: `节点识别码: ${misakaId} - ${name}`
      })
    })
    
    // 断开连接事件处理
    socketInstance.on('disconnect', () => {
      console.log('与御坂网络连接断开')
      setIsConnected(false)
      setConnectionStrength(0)
      
      toast({
        title: "御坂网络连接断开",
        description: "尝试重新连接中...",
        variant: "destructive"
      })
    })
    
    // 错误处理
    socketInstance.on('error', (error: { message: string, details: string }) => {
      console.error('御坂网络错误:', error)
      toast({
        title: "御坂网络错误",
        description: error.details || error.message,
        variant: "destructive"
      })
    })
    
    // 接收系统消息
    socketInstance.on('system_message', (message: BrainwaveMessage) => {
      // 添加到消息列表
      setMessages(prev => [...prev, message].sort((a, b) => {
        // 首先按优先级排序
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        // 然后按时间戳排序
        return b.timestamp - a.timestamp
      }).slice(0, 100)) // 保留最近的100条消息
      
      // 显示高优先级消息的通知
      if (message.priority >= 8) {
        toast({
          title: `系统通知 (优先级: ${message.priority})`,
          description: message.content
        })
      }
    })
    
    // 接收脑电波消息
    socketInstance.on('brainwave_message', (message: BrainwaveMessage) => {
      // 验证并添加到消息列表
      try {
        const validatedMessage = BrainwaveMessageSchema.parse(message)
        setMessages(prev => [...prev, validatedMessage].sort((a, b) => {
          // 首先按优先级排序
          if (a.priority !== b.priority) {
            return b.priority - a.priority
          }
          // 然后按时间戳排序
          return b.timestamp - a.timestamp
        }).slice(0, 100)) // 保留最近的100条消息
        
        // 显示高优先级消息的通知
        if (validatedMessage.priority >= 7) {
          toast({
            title: `来自 ${validatedMessage.senderName} 的消息`,
            description: validatedMessage.content
          })
        }
      } catch (error) {
        console.error('无效的脑电波消息:', error)
      }
    })
    
    // 接收网络状态更新
    socketInstance.on('network_state', (state: NetworkState) => {
      setNetworkState(state)
    })
    
    // 接收网络节点更新
    socketInstance.on('network_update', (update: NetworkUpdate) => {
      // 通知所有监听器
      networkUpdateListeners.current.forEach(listener => {
        try {
          listener(update)
        } catch (error) {
          console.error('执行网络更新监听器出错:', error)
        }
      })
      
      // 根据更新类型显示不同的通知
      switch (update.type) {
        case 'NODE_JOINED':
          toast({
            title: "节点加入",
            description: `${update.data.nodeName} (ID: ${update.data.nodeId}) 已连接到网络`
          })
          break
          
        case 'NODE_LEFT':
          toast({
            title: "节点断开",
            description: `${update.data.nodeName} (ID: ${update.data.nodeId}) 已离开网络`
          })
          break
          
        case 'NODE_INACTIVE':
          console.log(`节点 ${update.data.nodeName} (ID: ${update.data.nodeId}) 不活跃`)
          break
      }
    })
    
    // 定期更新连接强度
    const strengthInterval = setInterval(() => {
      if (isConnected) {
        // 随机小幅度波动连接强度
        setConnectionStrength(prev => {
          const change = Math.floor(Math.random() * 5) - 2 // -2到+2的变化
          const newStrength = Math.max(70, Math.min(100, prev + change))
          
          // 更新状态到服务器
          if (socketInstance && socketInstance.connected) {
            socketInstance.emit('update_status', {
              nodeId: misakaId,
              connectionStrength: newStrength
            })
          }
          
          return newStrength
        })
      }
    }, 10000) // 每10秒更新一次
    
    setSocket(socketInstance)
    
    // 清理函数
    return () => {
      clearInterval(strengthInterval)
      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('error')
      socketInstance.off('system_message')
      socketInstance.off('brainwave_message')
      socketInstance.off('network_state')
      socketInstance.off('network_update')
      socketInstance.disconnect()
    }
  }, [misakaId, misakaName, session])
  
  // 发送脑电波消息
  const sendMessage = useCallback((content: string, options: {
    receiverId?: number,
    messageType?: 'BROADCAST' | 'DIRECT' | 'SYSTEM' | 'EMERGENCY',
    priority?: number,
    coordinates?: { x: number, y: number, z: number },
    encryptionLevel?: 'NONE' | 'LEVEL1' | 'LEVEL2' | 'LEVEL3'
  } = {}) => {
    if (!socket || !isConnected) {
      toast({
        title: "无法发送消息",
        description: "未连接到御坂网络",
        variant: "destructive"
      })
      return false
    }
    
    try {
      const message: BrainwaveMessage = {
        senderId: misakaId,
        senderName: misakaName || session?.user?.name || `御坂${misakaId}`,
        receiverId: options.receiverId,
        messageType: options.messageType || 'BROADCAST',
        content,
        timestamp: Date.now(),
        priority: options.priority || 5,
        coordinates: options.coordinates,
        encryptionLevel: options.encryptionLevel || 'NONE'
      }
      
      // 发送消息
      socket.emit('brainwave_message', message)
      return true
    } catch (error) {
      console.error('发送脑电波消息失败:', error)
      toast({
        title: "发送失败",
        description: "脑电波传输错误",
        variant: "destructive"
      })
      return false
    }
  }, [socket, isConnected, misakaId, misakaName, session])
  
  // 添加网络更新监听器
  const addNetworkUpdateListener = useCallback((listener: (update: NetworkUpdate) => void) => {
    networkUpdateListeners.current.push(listener)
    
    // 返回移除监听器的函数
    return () => {
      networkUpdateListeners.current = networkUpdateListeners.current.filter(l => l !== listener)
    }
  }, [])
  
  // 请求紧急脑电波通信
  const sendEmergencyMessage = useCallback((content: string) => {
    return sendMessage(content, {
      messageType: 'EMERGENCY',
      priority: 10,
    })
  }, [sendMessage])
  
  return {
    isConnected,
    connectionStrength,
    messages,
    networkState,
    sendMessage,
    sendEmergencyMessage,
    addNetworkUpdateListener
  }
} 