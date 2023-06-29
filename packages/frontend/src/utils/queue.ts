interface IQueue {
  func: (data?: any) => any
  data: any
  resolve: (value: any) => void
}
/**
 * 通用队列类，按顺序处理异步队列
 */
export class Queue {
  public name: string
  private queue: Array<IQueue> = []

  private isExecuting: boolean = false

  constructor(
    name: string,
    queue: Array<IQueue> = [],
    isExecuting: boolean = false
  ) {
    this.name = name
    this.queue = queue
    this.isExecuting = isExecuting
  }

  private async addToQueue(func: IQueue['func'], data: IQueue['data']) {
    return new Promise((resolve) => {
      this.queue.push({ func, data, resolve })
      if (!this.isExecuting) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.isExecuting) return
    this.isExecuting = true
    console.log('this.queue', this.queue)
    while (this.queue.length) {
      const { func, data, resolve } = this.queue.shift()!
      try {
        const res = await func.apply(func, data)
        resolve(res)
      } catch (e) {
        console.error('error:', e)
        resolve(undefined)
      }
    }
    this.isExecuting = false
  }

  public enqueue(func: IQueue['func'], data: IQueue['data']) {
    return this.addToQueue(func, data)
  }
}

export const storageQueue = new Queue('storage')
