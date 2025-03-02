import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO, Socket } from 'socket.io'
import { z } from 'zod'

// 脑电波消息类型定义
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

// 网络状态类型定义
export type MisakaNetworkState = {
  activeNodes: Map<number, NodeStatus>;
  systemStatus: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE' | 'EMERGENCY';
  networkLoad: number; // 0-100
  lastSyncTimestamp: number;
}

// 节点状态类型定义
export type NodeStatus = {
  nodeId: number;
  nodeName: string;
  connectionStrength: number; // 0-100
  lastActive: number;
  location: string;
  capabilities: string[];
  isAdmin: boolean;
}

// 全局网络状态
const networkState: MisakaNetworkState = {
  activeNodes: new Map(),
  systemStatus: 'ONLINE',
  networkLoad: 0,
  lastSyncTimestamp: Date.now()
}

// Socket.io 配置
export const config = {
  api: {
    bodyParser: false,
  },
}

// 创建Socket服务器实例或获取已有实例
const getSocketServer = (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    // 设置连接事件处理
    io.on('connection', (socket: Socket) => {
      console.log(`节点连接: ${socket.id}`)

      // 用户加入时获取ID和名称
      socket.on('register_node', (data: { nodeId: number; nodeName: string; location: string }) => {
        try {
          // 验证数据
          if (!data.nodeId || !data.nodeName) {
            throw new Error('节点ID和名称必须提供')
          }

          // 更新活跃节点状态
          networkState.activeNodes.set(data.nodeId, {
            nodeId: data.nodeId,
            nodeName: data.nodeName,
            connectionStrength: 85 + Math.floor(Math.random() * 15),
            lastActive: Date.now(),
            location: data.location || '学园都市',
            capabilities: ['BASIC_COMMUNICATION'],
            isAdmin: data.nodeId === 1 // 只有原型有管理权限
          })

          // 更新节点和socketId的映射
          nodeToSocket.set(data.nodeId, socket.id)
          socketToNode.set(socket.id, data.nodeId)

          // 更新网络负载
          networkState.networkLoad = Math.min(100, Math.floor((networkState.activeNodes.size / 20000) * 100))
          networkState.lastSyncTimestamp = Date.now()

          // 发送欢迎消息
          socket.emit('system_message', {
            senderId: 1,
            senderName: '御坂网络控制中心',
            messageType: 'SYSTEM',
            content: `欢迎加入御坂网络, ${data.nodeName} (ID: ${data.nodeId})`,
            timestamp: Date.now(),
            priority: 8
          })

          // 广播有新节点加入的消息
          socket.broadcast.emit('network_update', {
            type: 'NODE_JOINED',
            data: {
              nodeId: data.nodeId,
              nodeName: data.nodeName
            }
          })

          // 将此节点加入到特定位置的房间
          if (data.location) {
            socket.join(`location_${data.location}`)
          }

          // 发送当前网络状态给新连接的客户端
          socket.emit('network_state', {
            activeCount: networkState.activeNodes.size,
            systemStatus: networkState.systemStatus,
            networkLoad: networkState.networkLoad,
            timestamp: networkState.lastSyncTimestamp
          })

          console.log(`节点注册: ${data.nodeName} (ID: ${data.nodeId})`)
        } catch (error) {
          console.error('节点注册错误:', error)
          socket.emit('error', {
            message: '节点注册失败',
            details: error instanceof Error ? error.message : '未知错误'
          })
        }
      })

      // 处理脑电波消息
      socket.on('brainwave_message', (message: BrainwaveMessage) => {
        try {
          // 验证消息数据
          const validatedMessage = BrainwaveMessageSchema.parse(message)
          
          // 更新发送方节点的最后活跃时间
          const senderNode = networkState.activeNodes.get(validatedMessage.senderId)
          if (senderNode) {
            senderNode.lastActive = Date.now()
            networkState.activeNodes.set(validatedMessage.senderId, senderNode)
          }

          // 根据消息类型处理
          switch (validatedMessage.messageType) {
            case 'BROADCAST':
              // 广播给所有连接的节点
              io.emit('brainwave_message', validatedMessage)
              break
              
            case 'DIRECT':
              if (validatedMessage.receiverId) {
                // 获取接收方的socketId (这里需要维护一个nodeId到socketId的映射)
                const receiverSocketId = getUserSocketId(validatedMessage.receiverId)
                if (receiverSocketId) {
                  io.to(receiverSocketId).emit('brainwave_message', validatedMessage)
                  // 确认消息发送成功
                  socket.emit('message_delivered', {
                    messageId: validatedMessage.timestamp.toString(), // 简单使用时间戳作为ID
                    receiverId: validatedMessage.receiverId
                  })
                } else {
                  // 接收方不在线，存储为离线消息
                  storeOfflineMessage(validatedMessage)
                  socket.emit('message_pending', {
                    messageId: validatedMessage.timestamp.toString(),
                    receiverId: validatedMessage.receiverId,
                    status: 'OFFLINE_STORAGE'
                  })
                }
              }
              break
              
            case 'EMERGENCY':
              // 紧急消息优先处理，广播给所有节点并发送系统通知
              io.emit('brainwave_message', {
                ...validatedMessage,
                priority: 10 // 强制设为最高优先级
              })
              io.emit('system_message', {
                senderId: 1,
                senderName: '御坂网络控制中心',
                messageType: 'SYSTEM',
                content: `紧急通知: 来自 ${validatedMessage.senderName} 的紧急消息`,
                timestamp: Date.now(),
                priority: 10
              })
              break
              
            case 'SYSTEM':
              // 验证发送者是否有系统消息权限
              const node = networkState.activeNodes.get(validatedMessage.senderId)
              if (node && node.isAdmin) {
                io.emit('system_message', validatedMessage)
              } else {
                socket.emit('error', {
                  message: '权限不足',
                  details: '您没有发送系统消息的权限'
                })
              }
              break
          }
          
          console.log(`接收消息: ${validatedMessage.messageType} from ${validatedMessage.senderName}`)
        } catch (error) {
          console.error('消息处理错误:', error)
          socket.emit('error', {
            message: '消息处理失败',
            details: error instanceof Error ? error.message : '未知错误'
          })
        }
      })

      // 处理节点状态更新
      socket.on('update_status', (data: { nodeId: number, connectionStrength?: number, capabilities?: string[] }) => {
        const node = networkState.activeNodes.get(data.nodeId)
        if (node) {
          if (data.connectionStrength !== undefined) {
            node.connectionStrength = data.connectionStrength
          }
          if (data.capabilities) {
            node.capabilities = [...new Set([...node.capabilities, ...data.capabilities])]
          }
          node.lastActive = Date.now()
          networkState.activeNodes.set(data.nodeId, node)
        }
      })

      // 处理断开连接
      socket.on('disconnect', () => {
        // 查找断开连接的节点
        const nodeId = getNodeIdBySocketId(socket.id)
        if (nodeId) {
          const node = networkState.activeNodes.get(nodeId)
          if (node) {
            // 从活跃节点中移除
            networkState.activeNodes.delete(nodeId)
            
            // 清理映射
            nodeToSocket.delete(nodeId)
            socketToNode.delete(socket.id)
            
            // 更新网络负载
            networkState.networkLoad = Math.min(100, Math.floor((networkState.activeNodes.size / 20000) * 100))
            networkState.lastSyncTimestamp = Date.now()
            
            // 广播节点断开的信息
            socket.broadcast.emit('network_update', {
              type: 'NODE_LEFT',
              data: {
                nodeId: node.nodeId,
                nodeName: node.nodeName
              }
            })
            
            console.log(`节点断开: ${node.nodeName} (ID: ${node.nodeId})`)
          }
        }
      })
    })

    // 每30秒广播一次网络状态更新
    setInterval(() => {
      // 检查不活跃节点并移除
      const currentTime = Date.now()
      const inactiveThreshold = 5 * 60 * 1000 // 5分钟不活跃视为离线
      
      networkState.activeNodes.forEach((node, id) => {
        if (currentTime - node.lastActive > inactiveThreshold) {
          // 获取该节点的socketId
          const socketId = nodeToSocket.get(id)
          
          // 清理映射
          if (socketId) {
            socketToNode.delete(socketId)
          }
          nodeToSocket.delete(id)
          
          // 从活跃节点中移除
          networkState.activeNodes.delete(id)
          
          // 广播节点不活跃的信息
          io.emit('network_update', {
            type: 'NODE_INACTIVE',
            data: {
              nodeId: node.nodeId,
              nodeName: node.nodeName
            }
          })
        }
      })
      
      // 更新网络状态
      networkState.networkLoad = Math.min(100, Math.floor((networkState.activeNodes.size / 20000) * 100))
      networkState.lastSyncTimestamp = currentTime
      
      // 广播当前网络状态
      io.emit('network_state', {
        activeCount: networkState.activeNodes.size,
        systemStatus: networkState.systemStatus,
        networkLoad: networkState.networkLoad,
        timestamp: networkState.lastSyncTimestamp
      })
    }, 30000)

    res.socket.server.io = io
  }
  return res.socket.server.io
}

// 辅助函数：维护nodeId和socketId的映射
const nodeToSocket = new Map<number, string>()
const socketToNode = new Map<string, number>()

function getUserSocketId(nodeId: number): string | undefined {
  return nodeToSocket.get(nodeId)
}

function getNodeIdBySocketId(socketId: string): number | undefined {
  return socketToNode.get(socketId)
}

// 离线消息存储
const offlineMessages = new Map<number, BrainwaveMessage[]>()

function storeOfflineMessage(message: BrainwaveMessage) {
  if (!message.receiverId) return
  
  const messages = offlineMessages.get(message.receiverId) || []
  messages.push(message)
  offlineMessages.set(message.receiverId, messages)
}

// 导出Websocket处理函数
export default async function socketHandler(req: NextApiRequest, res: any) {
  if (req.method === 'POST') {
    // 处理REST API调用（如系统通知）
    try {
      const { message } = req.body
      const io = getSocketServer(req, res)
      io.emit('system_message', message)
      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to send message' })
    }
  } else {
    // WebSocket连接处理
    getSocketServer(req, res)
    res.end()
  }
} 