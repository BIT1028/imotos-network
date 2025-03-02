// WebSocket通信服务
// 用于管理御坂网络的电磁波通信

import { EventEmitter } from 'events'
import io, { Socket } from 'socket.io-client'

// 消息类型枚举
export enum MessageType {
  BROADCAST = 'broadcast',       // 广播消息
  DIRECT = 'direct',             // 直接消息
  SYSTEM = 'system',             // 系统消息
  EMERGENCY = 'emergency',       // 紧急消息
  COMMAND = 'command',           // 命令消息
  STATUS = 'status',             // 状态更新
  SYNC = 'sync',                 // 数据同步
  EXPERIMENT = 'experiment'      // 实验数据
}

// 节点状态枚举
export enum NodeStatus {
  ONLINE = 'online',             // 在线
  OFFLINE = 'offline',           // 离线
  BUSY = 'busy',                 // 忙碌
  IDLE = 'idle',                 // 空闲
  SYNCING = 'syncing',           // 同步中
  ERROR = 'error',               // 错误
  MAINTENANCE = 'maintenance'    // 维护
}

// 网络状态枚举
export enum NetworkState {
  CONNECTED = 'connected',       // 已连接
  DISCONNECTED = 'disconnected', // 断开连接
  CONNECTING = 'connecting',     // 连接中
  RECONNECTING = 'reconnecting', // 重连中
  ERROR = 'error'                // 错误
}

// 消息接口
export interface IMisakaMessage {
  id: string;                    // 消息ID
  type: MessageType;             // 消息类型
  sender: string | number;       // 发送者ID
  receiver?: string | number;    // 接收者ID（可选，广播消息无接收者）
  content: any;                  // 消息内容
  timestamp: number;             // 时间戳
  priority?: number;             // 优先级（可选）
  metadata?: Record<string, any>; // 元数据（可选）
}

// 网络节点接口
export interface INetworkNode {
  id: string | number;           // 节点ID
  status: NodeStatus;            // 节点状态
  lastSeen: number;              // 最后活动时间
  capabilities?: string[];       // 能力列表（可选）
  metadata?: Record<string, any>; // 元数据（可选）
}

// 事件处理函数类型
type EventCallback = (...args: any[]) => void;

// WebSocket服务类
export class WebSocketService {
  private socket: Socket | null = null;
  private events = new EventEmitter();
  private connectionState: NetworkState = NetworkState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000; // 3秒
  private misakaId: string | number;
  private nodes: Map<string | number, INetworkNode> = new Map();
  private messageQueue: IMisakaMessage[] = [];
  private serverUrl: string;

  constructor(misakaId: string | number, serverUrl: string = 'http://localhost:3001') {
    this.misakaId = misakaId;
    this.serverUrl = serverUrl;
  }

  // 连接到WebSocket服务器
  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionState(NetworkState.CONNECTING);

        // 初始化Socket.IO连接
        this.socket = io(this.serverUrl, {
          transports: ['websocket'],
          reconnection: false, // 我们将手动处理重连逻辑
          query: { misakaId: this.misakaId.toString() }
        });

        // 连接成功
        this.socket.on('connect', () => {
          console.log(`御坂网络连接成功: 节点 ${this.misakaId}`);
          this.updateConnectionState(NetworkState.CONNECTED);
          this.reconnectAttempts = 0;
          this.sendQueuedMessages();
          this.trigger('connected', { misakaId: this.misakaId });
          resolve(true);
        });

        // 连接错误
        this.socket.on('connect_error', (error) => {
          console.error('御坂网络连接错误:', error);
          this.updateConnectionState(NetworkState.ERROR);
          this.tryReconnect();
          this.trigger('error', { error, misakaId: this.misakaId });
          reject(error);
        });

        // 断开连接
        this.socket.on('disconnect', (reason) => {
          console.log(`御坂网络断开连接: ${reason}`);
          this.updateConnectionState(NetworkState.DISCONNECTED);
          if (reason !== 'io client disconnect') {
            this.tryReconnect();
          }
          this.trigger('disconnected', { reason, misakaId: this.misakaId });
        });

        // 接收消息
        this.socket.on('message', (message: IMisakaMessage) => {
          console.log(`收到消息: ${message.type}`);
          this.trigger('message', message);
          this.trigger(`message:${message.type}`, message);
        });

        // 节点状态更新
        this.socket.on('nodeStatus', (data: { nodeId: string | number, status: NodeStatus }) => {
          const { nodeId, status } = data;
          const node = this.nodes.get(nodeId) || { 
            id: nodeId, 
            status, 
            lastSeen: Date.now() 
          };
          
          node.status = status;
          node.lastSeen = Date.now();
          this.nodes.set(nodeId, node as INetworkNode);
          this.trigger('nodeStatusChanged', { nodeId, status });
        });

        // 网络同步
        this.socket.on('networkSync', (data: { nodes: INetworkNode[] }) => {
          data.nodes.forEach(node => {
            this.nodes.set(node.id, node);
          });
          this.trigger('networkSynced', { nodesCount: data.nodes.length });
        });

      } catch (error) {
        console.error('连接时发生错误:', error);
        this.updateConnectionState(NetworkState.ERROR);
        reject(error);
      }
    });
  }

  // 断开WebSocket连接
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.updateConnectionState(NetworkState.DISCONNECTED);
      console.log('已断开御坂网络连接');
    }
  }

  // 发送消息
  public sendMessage(message: Partial<IMisakaMessage>): boolean {
    const fullMessage: IMisakaMessage = {
      id: this.generateMessageId(),
      type: message.type || MessageType.BROADCAST,
      sender: this.misakaId,
      content: message.content || {},
      timestamp: Date.now(),
      ...message
    };

    if (!this.isConnected()) {
      console.log('未连接到御坂网络，消息已加入队列');
      this.messageQueue.push(fullMessage);
      return false;
    }

    try {
      this.socket?.emit('message', fullMessage);
      this.trigger('messageSent', fullMessage);
      return true;
    } catch (error) {
      console.error('发送消息时发生错误:', error);
      this.messageQueue.push(fullMessage);
      return false;
    }
  }

  // 发送命令
  public sendCommand(commandName: string, params: any = {}): boolean {
    return this.sendMessage({
      type: MessageType.COMMAND,
      content: { command: commandName, params }
    });
  }

  // 发送实验数据
  public sendExperimentData(experimentId: string | number, data: any): boolean {
    return this.sendMessage({
      type: MessageType.EXPERIMENT,
      content: { experimentId, data },
      metadata: { dataType: 'experiment', timestamp: Date.now() }
    });
  }

  // 获取连接状态
  public getConnectionState(): NetworkState {
    return this.connectionState;
  }

  // 检查是否已连接
  public isConnected(): boolean {
    return this.connectionState === NetworkState.CONNECTED && this.socket?.connected === true;
  }

  // 获取所有在线节点
  public getOnlineNodes(): INetworkNode[] {
    return Array.from(this.nodes.values())
      .filter(node => node.status === NodeStatus.ONLINE);
  }

  // 获取节点信息
  public getNode(nodeId: string | number): INetworkNode | undefined {
    return this.nodes.get(nodeId);
  }

  // 注册事件监听器
  public on(event: string, callback: EventCallback): void {
    this.events.on(event, callback);
  }

  // 移除事件监听器
  public off(event: string, callback: EventCallback): void {
    this.events.off(event, callback);
  }

  // 触发事件
  private trigger(event: string, data: any): void {
    this.events.emit(event, data);
  }

  // 尝试重新连接
  private tryReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`已达到最大重连尝试次数 (${this.maxReconnectAttempts})`);
      this.updateConnectionState(NetworkState.ERROR);
      this.trigger('reconnectFailed', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionState(NetworkState.RECONNECTING);
    console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    this.trigger('reconnecting', { attempt: this.reconnectAttempts, max: this.maxReconnectAttempts });

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('重连失败:', error);
      });
    }, this.reconnectInterval);
  }

  // 发送队列中的消息
  private sendQueuedMessages(): void {
    if (this.messageQueue.length === 0) return;
    
    console.log(`发送 ${this.messageQueue.length} 条队列消息`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    messages.forEach(message => {
      try {
        this.socket?.emit('message', message);
        this.trigger('messageSent', message);
      } catch (error) {
        console.error('发送队列消息时发生错误:', error);
        this.messageQueue.push(message);
      }
    });
  }

  // 更新连接状态
  private updateConnectionState(state: NetworkState): void {
    if (this.connectionState !== state) {
      const previousState = this.connectionState;
      this.connectionState = state;
      this.trigger('connectionStateChanged', { previous: previousState, current: state });
    }
  }

  // 生成消息ID
  private generateMessageId(): string {
    return `${this.misakaId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}

// 单例WebSocket服务实例
let websocketInstance: WebSocketService | null = null;

// 获取WebSocket服务实例
export const getWebSocketService = (misakaId: string | number, serverUrl?: string): WebSocketService => {
  if (!websocketInstance) {
    websocketInstance = new WebSocketService(misakaId, serverUrl);
  }
  return websocketInstance;
};

// 重置WebSocket服务实例（主要用于测试）
export const resetWebSocketService = (): void => {
  if (websocketInstance) {
    websocketInstance.disconnect();
    websocketInstance = null;
  }
}; 