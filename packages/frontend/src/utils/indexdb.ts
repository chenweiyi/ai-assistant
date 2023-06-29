import { CONVASITION_CHATGPT_KEY } from '@/constants/constant'

import { storageQueue } from './queue'
import type { Queue } from './queue'

interface IndexDBProps {
  dbName: string
  storeName: string
  keyPath: string
  indexs?: Array<
    | string
    | {
        indexName: string
        keyPath: string
        options?: { unique: boolean; multiEntry: boolean }
      }
  >
}

/**
 * 封装IndexDB
 */
export default class IndexDB {
  public DBOpenRequest: IDBOpenDBRequest
  public db: IDBDatabase | undefined
  public objectStore: IDBObjectStore | undefined
  public options: IndexDBProps
  static queue: Queue = storageQueue

  constructor(props: IndexDBProps) {
    this.options = props
    if (window.indexedDB) {
      this.DBOpenRequest = window.indexedDB.open(props.dbName)

      this.DBOpenRequest.onerror = (event) => {
        throw new Error('DBOpenRequest onerror...')
      }

      this.DBOpenRequest.onsuccess = (event) => {
        this.db = this.DBOpenRequest.result
      }

      this.DBOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        console.log('DBOpenRequest onupgradeneeded...')
        // @ts-ignore
        const db = event.target!.result as unknown as IDBDatabase

        db.onerror = (event) => {
          throw new Error('db onerror...')
        }

        // Create an objectStore for this database
        this.objectStore = db.createObjectStore(props.storeName, {
          keyPath: props.keyPath
        })

        props.indexs?.forEach((key) => {
          if (typeof key === 'string') {
            this.objectStore!.createIndex(key, key, { unique: false })
          } else {
            this.objectStore!.createIndex(
              key.indexName,
              key.keyPath,
              key.options
            )
          }
        })
      }
    } else {
      throw new Error('浏览器不支持indexedDB')
    }
  }

  private async waitUntilReady() {
    if (this.db) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (this.db) {
          clearInterval(timer)
          resolve(1)
        }
      }, 10)

      setTimeout(() => {
        reject(new Error('indexedDB init time too long, over 10s'))
      }, 10000)
    })
  }

  getData() {
    const name = `indexed getData ${new Date().getTime()}`
    console.time(name)
    let resolve: (value: unknown) => void
    let reject: (value: unknown) => void
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    this.waitUntilReady()
      .then(() => {
        // 主要用于类型保护，防止下面直接获取this.db报错
        if (!this.db) return

        let res: Array<any> = []

        const transaction = this.db.transaction(
          [this.options.storeName],
          'readonly'
        )
        const objectStore = transaction.objectStore(this.options.storeName)
        const openCursor = objectStore.openCursor()
        openCursor.onsuccess = (event) => {
          // @ts-ignore
          const cursor = event.target.result as IDBCursorWithValue | undefined
          if (cursor) {
            res.push(cursor.value)
            cursor.continue()
          }
        }
        transaction.oncomplete = () => {
          console.timeEnd(name)
          resolve(res)
        }
        transaction.onerror = (e) => {
          console.timeEnd(name)
          reject(e)
        }
      })
      .catch((e) => reject(e))

    return promise
  }

  setData(values: Array<any>, action: 'merge' | 'cover' = 'cover') {
    const name = `indexed setData ${new Date().getTime()}`
    console.time(name)
    let resolve: (value: unknown) => void
    let reject: (value: unknown) => void
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    this.waitUntilReady()
      .then(() => {
        // 主要用于类型保护，防止下面直接获取this.db报错
        if (!this.db) return

        // Open a read/write DB transaction, ready for adding the data
        const transaction = this.db.transaction(
          [this.options.storeName],
          'readwrite'
        )

        // Report on the success of the transaction completing, when everything is done
        transaction.oncomplete = () => {
          console.log('Transaction completed: database modification finished.')
          console.timeEnd(name)
          resolve(1)
        }

        // Handler for any unexpected error
        transaction.onerror = (e) => {
          console.timeEnd(name)
          reject(e)
        }

        // Call an object store that's already been added to the database
        const objectStore = transaction.objectStore(this.options.storeName)

        if (action === 'cover') {
          objectStore.clear()
        }
        values.forEach((value) => {
          // put 可以添加key相同数据，会覆盖
          // add 不可以添加key相同数据，会报错
          objectStore.put(value)
        })
      })
      .catch((e) => {
        reject(e)
      })

    return promise
  }
}

const convasitionDB = new IndexDB({
  dbName: CONVASITION_CHATGPT_KEY,
  storeName: 'convasition',
  keyPath: 'sessionId',
  indexs: [
    'sessionId',
    'active',
    'title',
    'order',
    'data',
    'parentMessageId',
    'conversationId',
    'isLoading',
    'isInput'
  ]
})

/**
 * 代理会话数据库，处理函数参数后，传给队列实例处理
 * 业务依然按原有方式调用setData,getData
 */
class proxyConvasitionDB {
  public static getData() {
    return IndexDB.queue.enqueue(convasitionDB.getData.bind(convasitionDB), [])
  }

  public static setData(
    values: Array<any>,
    action: 'merge' | 'cover' = 'cover'
  ) {
    IndexDB.queue.enqueue(convasitionDB.setData.bind(convasitionDB), [
      values,
      action
    ])
  }
}

export { proxyConvasitionDB as convasitionDB }
