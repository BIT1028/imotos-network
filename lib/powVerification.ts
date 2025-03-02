import crypto from 'crypto';

/**
 * 御坂网络工作量证明(PoW)验证系统
 * 用于防止恶意节点加入网络，增强网络安全性
 */
export class PowVerification {
  private static instance: PowVerification;
  private difficulty: number = 4; // 默认难度级别（前导0的数量）
  private challengeTimeout: number = 60000; // 挑战有效期（毫秒）
  private challenges: Map<number, { challenge: string, timestamp: number }> = new Map();

  private constructor() {}

  public static getInstance(): PowVerification {
    if (!PowVerification.instance) {
      PowVerification.instance = new PowVerification();
    }
    return PowVerification.instance;
  }

  /**
   * 设置难度级别
   * @param difficulty 难度级别（前导0的数量）
   */
  public setDifficulty(difficulty: number): void {
    if (difficulty < 1 || difficulty > 8) {
      throw new Error('难度级别必须在1-8之间');
    }
    this.difficulty = difficulty;
  }

  /**
   * 为节点生成挑战
   * @param nodeId 节点ID
   * @returns 挑战字符串
   */
  public generateChallenge(nodeId: number): string {
    // 生成随机挑战字符串
    const challenge = crypto.randomBytes(16).toString('hex');
    
    // 存储挑战
    this.challenges.set(nodeId, {
      challenge,
      timestamp: Date.now()
    });
    
    return challenge;
  }

  /**
   * 验证节点提交的工作量证明
   * @param nodeId 节点ID
   * @param nonce 节点计算的随机数
   * @returns 验证是否通过
   */
  public verifyProof(nodeId: number, nonce: string): boolean {
    // 获取该节点的挑战
    const challengeData = this.challenges.get(nodeId);
    if (!challengeData) {
      return false; // 没有找到对应的挑战
    }
    
    // 检查挑战是否过期
    if (Date.now() - challengeData.timestamp > this.challengeTimeout) {
      this.challenges.delete(nodeId);
      return false; // 挑战已过期
    }
    
    // 验证哈希结果
    const { challenge } = challengeData;
    const hash = this.calculateHash(challenge, nonce);
    const isValid = this.checkDifficulty(hash);
    
    // 验证成功后删除挑战记录
    if (isValid) {
      this.challenges.delete(nodeId);
    }
    
    return isValid;
  }

  /**
   * 计算挑战+随机数的哈希值
   * @param challenge 挑战字符串
   * @param nonce 随机数
   * @returns 哈希值
   */
  public calculateHash(challenge: string, nonce: string): string {
    return crypto.createHash('sha256')
      .update(`${challenge}${nonce}`)
      .digest('hex');
  }

  /**
   * 检查哈希值是否满足难度要求
   * @param hash 哈希值
   * @returns 是否满足难度要求
   */
  private checkDifficulty(hash: string): boolean {
    const prefix = '0'.repeat(this.difficulty);
    return hash.startsWith(prefix);
  }

  /**
   * 客户端计算工作量证明
   * @param challenge 服务器提供的挑战
   * @param maxAttempts 最大尝试次数
   * @returns 找到的有效随机数
   */
  public static async solveChallenge(challenge: string, difficulty: number, maxAttempts: number = 1000000): Promise<string | null> {
    const prefix = '0'.repeat(difficulty);
    
    for (let i = 0; i < maxAttempts; i++) {
      // 生成随机数
      const nonce = Math.random().toString(36).substring(2) + Date.now().toString();
      
      // 计算哈希
      const hash = crypto.createHash('sha256')
        .update(`${challenge}${nonce}`)
        .digest('hex');
      
      // 检查是否满足难度要求
      if (hash.startsWith(prefix)) {
        return nonce;
      }
      
      // 每1000次尝试让出CPU
      if (i % 1000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return null; // 达到最大尝试次数仍未找到
  }

  /**
   * 清理过期的挑战
   */
  public cleanupExpiredChallenges(): void {
    const now = Date.now();
    this.challenges.forEach((data, nodeId) => {
      if (now - data.timestamp > this.challengeTimeout) {
        this.challenges.delete(nodeId);
      }
    });
  }

  /**
   * 动态调整难度级别
   * @param averageSolveTime 平均解决时间（毫秒）
   * @param targetTime 目标解决时间（毫秒）
   */
  public adjustDifficulty(averageSolveTime: number, targetTime: number = 5000): void {
    if (averageSolveTime < targetTime / 2) {
      // 解决太快，增加难度
      this.difficulty = Math.min(8, this.difficulty + 1);
    } else if (averageSolveTime > targetTime * 2) {
      // 解决太慢，降低难度
      this.difficulty = Math.max(1, this.difficulty - 1);
    }
  }
}