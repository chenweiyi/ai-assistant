import { CONVASITION_CHATGPT_KEY } from '@/constants/constant'

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

export default class IndexDB {
  public DBOpenRequest: IDBOpenDBRequest
  public db: IDBDatabase | undefined
  public objectStore: IDBObjectStore | undefined
  public options: IndexDBProps

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
        this.db = event.target!.result as unknown as IDBDatabase

        this.db.onerror = (event) => {
          throw new Error('db onerror...')
        }

        // Create an objectStore for this database
        this.objectStore = this.db.createObjectStore(props.storeName, {
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

  getData() {
    if (!this.db) {
      return Promise.reject('db is undefined')
    }

    let resolve: (value: unknown) => void
    let reject: (value: unknown) => void
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

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
      resolve(res)
    }
    transaction.onerror = (e) => {
      reject(e)
    }
    return promise
  }

  setData(values: Array<any>, action: 'merge' | 'cover' = 'cover') {
    if (!this.db) {
      return Promise.reject('db is undefined')
    }

    let resolve: (value: unknown) => void
    let reject: (value: unknown) => void
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    // Open a read/write DB transaction, ready for adding the data
    const transaction = this.db.transaction(
      [this.options.storeName],
      'readwrite'
    )

    // Report on the success of the transaction completing, when everything is done
    transaction.oncomplete = () => {
      console.log('Transaction completed: database modification finished.')
      resolve(1)
    }

    // Handler for any unexpected error
    transaction.onerror = (e) => {
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

export { convasitionDB }
