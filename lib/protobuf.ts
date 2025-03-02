import protobuf from 'protobufjs';

/**
 * 御坂网络消息压缩服务
 * 使用Protocol Buffers进行消息序列化和反序列化
 * 减少网络传输负载，提高通信效率
 */
export class MisakaProtobuf {
  private static instance: MisakaProtobuf;
  private root: protobuf.Root;
  private messageType: protobuf.Type | null = null;
  private initialized: boolean = false;

  private constructor() {
    this.root = new protobuf.Root();
  }

  public static getInstance(): MisakaProtobuf {
    if (!MisakaProtobuf.instance) {
      MisakaProtobuf.instance = new MisakaProtobuf();
    }
    return MisakaProtobuf.instance;
  }

  /**
   * 初始化Protocol Buffers消息类型
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // 定义消息结构
    this.root.define('misaka').add(new protobuf.Type('BrainwaveMessage')
      .add(new protobuf.Field('senderId', 1, 'uint32'))
      .add(new protobuf.Field('senderName', 2, 'string'))
      .add(new protobuf.Field('receiverId', 3, 'uint32', 'optional'))
      .add(new protobuf.Field('messageType', 4, 'string'))
      .add(new protobuf.Field('content', 5, 'string'))
      .add(new protobuf.Field('timestamp', 6, 'uint64'))
      .add(new protobuf.Field('priority', 7, 'uint32'))
      .add(new protobuf.Field('encryptionLevel', 8, 'string'))
      .add(new protobuf.Field('hasCoordinates', 9, 'bool'))
      .add(new protobuf.Field('coordinateX', 10, 'float', 'optional'))
      .add(new protobuf.Field('coordinateY', 11, 'float', 'optional'))
      .add(new protobuf.Field('coordinateZ', 12, 'float', 'optional'))
    );

    this.messageType = this.root.lookupType('misaka.BrainwaveMessage');
    this.initialized = true;
  }

  /**
   * 将消息对象序列化为二进制数据
   * @param message 脑电波消息对象
   * @returns 序列化后的二进制数据
   */
  public async encode(message: any): Promise<Uint8Array> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.messageType) {
      throw new Error('消息类型未初始化');
    }

    // 转换为protobuf格式
    const pbMessage: any = {
      senderId: message.senderId,
      senderName: message.senderName,
      messageType: message.messageType,
      content: message.content,
      timestamp: message.timestamp,
      priority: message.priority || 5,
      encryptionLevel: message.encryptionLevel || 'NONE',
      hasCoordinates: !!message.coordinates
    };

    // 添加可选字段
    if (message.receiverId !== undefined) {
      pbMessage.receiverId = message.receiverId;
    }

    if (message.coordinates) {
      pbMessage.coordinateX = message.coordinates.x;
      pbMessage.coordinateY = message.coordinates.y;
      pbMessage.coordinateZ = message.coordinates.z;
    }

    // 验证消息
    const error = this.messageType.verify(pbMessage);
    if (error) {
      throw new Error(`消息验证失败: ${error}`);
    }

    // 创建消息实例
    const pbInstance = this.messageType.create(pbMessage);
    
    // 编码为二进制
    return this.messageType.encode(pbInstance).finish();
  }

  /**
   * 将二进制数据反序列化为消息对象
   * @param buffer 序列化的二进制数据
   * @returns 脑电波消息对象
   */
  public async decode(buffer: Uint8Array): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.messageType) {
      throw new Error('消息类型未初始化');
    }

    // 解码二进制数据
    const decoded = this.messageType.decode(buffer);
    const message = this.messageType.toObject(decoded, {
      longs: Number,
      enums: String,
      defaults: true
    });

    // 转换回原始消息格式
    const result: any = {
      senderId: message.senderId,
      senderName: message.senderName,
      messageType: message.messageType,
      content: message.content,
      timestamp: message.timestamp,
      priority: message.priority,
      encryptionLevel: message.encryptionLevel
    };

    // 添加可选字段
    if (message.receiverId) {
      result.receiverId = message.receiverId;
    }

    if (message.hasCoordinates) {
      result.coordinates = {
        x: message.coordinateX,
        y: message.coordinateY,
        z: message.coordinateZ
      };
    }

    return result;
  }

  /**
   * 计算压缩率
   * @param original 原始数据大小
   * @param compressed 压缩后数据大小
   * @returns 压缩率百分比
   */
  public static calculateCompressionRatio(original: number, compressed: number): number {
    if (original === 0) return 0;
    return Math.round(((original - compressed) / original) * 100);
  }
}