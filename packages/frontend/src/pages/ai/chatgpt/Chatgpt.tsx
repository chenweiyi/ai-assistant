import AnswerLayout from '@/components/answer-layout/AnswerLayout'
import { ChatContext } from '@/pages/ai/chatgpt/LayoutIndex'
import {
  ILocalSettings,
  getConvasitionData,
  getSettingData
} from '@/utils/store'
// import { Drawer, Input, InputRef, Tag } from 'antd'
import { InputRef } from 'antd'
import clsx from 'clsx'
import qs from 'qs'
import {
  BaseSyntheticEvent,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import styles from './chatgpt.less'
import PromptCustom from './components/PromptCustom'
import PromptWeek from './components/PromptWeek'

type RequestOption = {
  msg: string
}

// TODO
// const ownerId = 'chenwy'
const ownerId = 'admin'
const ownerName = 'xiaochen'

export default function IndexPage() {
  const {
    active,
    setResultDataBySessionId,
    setResultBySessionId,
    storageData,
    getConvasitionBySessionId
  } = useContext(ChatContext)

  const result = active?.data || []
  const isInput = active?.isInput || false
  const isLoading = active?.isLoading || false
  const [inputValue, setInputValue] = useState('')
  const [disabled, setDisabled] = useState(false)
  const inputRef = useRef<InputRef>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [type, setType] = useState<'prompt' | 'week' | ''>('')

  const latestResultRef = useLatest(result)
  const lastInputValue = useLatest(inputValue)

  const [latestQuestion, setLatestQuestion] = useState<string>('')

  const openDrawer = (type: 'prompt' | 'week') => {
    return () => {
      setType(type)
      setDrawer(true)
    }
  }

  useEffect(() => {
    if (type === 'prompt') {
      setTitle('提示词')
    } else if (type === 'week') {
      setTitle('写周报')
    }
  }, [type])

  /**
   * 采用EventSource模式获取数据
   * @param meta
   * @param sessionId
   */
  async function getConstantMsg(meta: RequestOption, sessionId: string) {
    const settings = getSettingData() as ILocalSettings
    const convasition = getConvasitionBySessionId(sessionId)
    const source = new EventSource(
      `/q/sendMsg/sse?${qs.stringify({
        apiKey: settings?.apiKey,
        temperature: settings?.temperature,
        top_p: settings?.top_p,
        model: settings?.model,
        ownerId,
        parentMessageId: convasition?.parentMessageId || '',
        conversationId: convasition?.conversationId ?? undefined,
        ...meta
      })}`
    )
    source.addEventListener(
      'open',
      () => {
        console.log('EventSource Connected!!')
      },
      false
    )

    source.addEventListener(
      'message',
      (e) => {
        const result = JSON.parse(e.data)
        const convasition = getConvasitionBySessionId(sessionId)
        console.log('=== result:', e.data)
        const hasLoading = convasition?.data.some((d) => d.type === 'loading')

        if (hasLoading) {
          // 去掉上一个loading
          const newData =
            convasition?.data.filter((d) => d.type !== 'loading') ?? []
          const newAnswer = {
            type: 'answer' as 'answer',
            ownerId,
            ownerName,
            content: result.text,
            id: result.id,
            conversationId: result.conversationId,
            error: result.error
          }
          newData.push(newAnswer)
          // 存储回复,并存储parentMessageId, isInput, isLoading
          setResultBySessionId(
            {
              data: newData,
              parentMessageId: result.error ? '' : result.id,
              conversationId: result.conversationId ?? undefined,
              isInput: !result.error,
              isLoading: false
            },
            sessionId
          )
          // 如果是error数据,则关闭EventSource
          if (result.error && result.done) {
            source.close()
            return
          }
        } else {
          if (
            convasition?.data[convasition?.data.length - 1]?.type === 'answer'
          ) {
            const newData = [
              ...convasition?.data.slice(0, -1),
              {
                type: 'answer' as 'answer',
                ownerId,
                ownerName,
                content: result.text,
                id: result.id,
                conversationId: result.conversationId,
                error: result.error
              }
            ]
            // 存储回复,并存储parentMessageId, isInput, isLoading
            setResultBySessionId(
              {
                data: newData,
                parentMessageId: result.error ? '' : result.id,
                conversationId: result.conversationId ?? undefined,
                isInput: !result.error,
                isLoading: false
              },
              sessionId
            )
            // 如果是error数据,则关闭EventSource
            if (result.error) {
              source.close()
            }
          }
        }

        if (result.done) {
          // 修改isInput的状态
          setResultBySessionId({ isInput: false, isLoading: false }, sessionId)
          source.close()
        }
      },
      false
    )
    source.addEventListener(
      'error',
      (e) => {
        console.log('EventSource Error', e)
      },
      false
    )
  }

  // 输入框输入事件
  function changeInput(e: BaseSyntheticEvent) {
    setInputValue(e.target.value || '')
  }

  // 点击“发送”按钮发送消息事件
  function sendMsg(sessionId: string, msg?: string) {
    if (lastInputValue.current || msg) {
      // 存入数据及loading数据
      const datas = [
        {
          type: 'question' as 'question',
          ownerId,
          ownerName,
          content: msg || lastInputValue.current,
          id: Date.now() + ''
        },
        {
          type: 'loading' as 'loading',
          content: '',
          id: 'loading_' + Date.now()
        }
      ]
      // 存储问题及loading
      setResultDataBySessionId({ append: datas, isLoading: true }, sessionId)
      // 发送请求获取chatgpt的回复
      getConstantMsg({ msg: msg || lastInputValue.current }, sessionId)
      // 最后一条问题
      setLatestQuestion(msg || lastInputValue.current)
    }
    if (sessionId === active?.sessionId) {
      // 清空输入框
      setInputValue('')
    }
  }

  function pressEnterHandler(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.shiftKey) return
    e.preventDefault()
    sendMsg(active?.sessionId as string)
  }

  // 聚焦输入框
  function focusInput() {
    setDisabled(false)
    inputRef.current?.focus()
  }

  // 初始化数据,如果最后一条数据是问题,则发送请求获取chatgpt的回复
  function initialData() {
    const last = result[result.length - 1]
    if (last?.type === 'question') {
      const loading = {
        type: 'loading' as 'loading',
        id: 'loading_' + Date.now(),
        content: ''
      }
      // 存入loading数据
      setResultDataBySessionId(
        { append: [loading], isLoading: true },
        active?.sessionId as string
      )
      // 发送请求获取chatgpt的回复
      getConstantMsg({ msg: last.content }, active?.sessionId as string)
    }
  }

  /**
   * 动态输入提示词
   * @param value
   * @returns
   */
  function setFlowValue(value: string) {
    return new Promise<void>((resolve, reject) => {
      function flow(str: string, val: string) {
        if (str === val) {
          resolve()
          return
        }
        setTimeout(() => {
          const next = val.slice(0, str.length + 2)
          setInputValue(next)
          flow(next, val)
        }, 10)
        setInputValue(str)
      }
      flow(value.slice(0, 2), value)
    })
  }

  /**
   * 快捷方式通用回调
   * @param prompt
   */
  async function choosePromptHandler(prompt: string) {
    focusInput()
    setDrawer(false)
    // await setFlowValue(prompt)
    setInputValue(prompt)
    sendMsg(active?.sessionId as string, prompt)
  }

  function handleKeyDown(e: any) {
    if (e.ctrlKey && e.key === 'o') {
      setOpen(true)
    }
  }

  async function reAnswer() {
    // await setFlowValue(latestQuestion)
    setInputValue(latestQuestion)
    sendMsg(active?.sessionId as string, latestQuestion)
  }

  function addEvent() {
    document.addEventListener('keydown', handleKeyDown)
  }

  function removeEvent() {
    document.removeEventListener('keydown', handleKeyDown)
  }

  useEffect(() => {
    focusInput()
    initialData()
    addEvent()
    return () => {
      removeEvent()
    }
  }, [])

  useEffect(() => {
    focusInput()
    initialData()
  }, [active?.sessionId])

  useEffect(() => {
    storageData({
      ...(active as IConvasition),
      data: latestResultRef.current.filter((o) => o.type !== 'loading')
    })
  }, [JSON.stringify(latestResultRef.current)])

  useEffect(() => {
    if (active?.isInput || active?.isLoading) {
      setDisabled(true)
    } else {
      focusInput()
    }
  }, [active?.isInput, active?.isLoading])

  return (
    <div className={styles.container}>
      <div className={clsx([styles.card])}>
        <AnswerLayout data={result} inputing={isInput} isLoading={isLoading} />
      </div>
      <div className={styles.operation}>
        <Tag
          className='cursor-pointer hover:font-medium hover:italic'
          color='magenta'
          onClick={reAnswer}
        >
          重新回答上一个问题
        </Tag>
        <Tag
          className='cursor-pointer hover:font-medium hover:italic'
          color='red'
          onClick={openDrawer('prompt')}
        >
          提示词
        </Tag>
        <Tag
          className='cursor-pointer hover:font-mediumv hover:italic'
          color='volcano'
          onClick={openDrawer('week')}
        >
          写周报
        </Tag>
      </div>
      <div className={styles.questionWrapper}>
        <Input.TextArea
          autoSize={{ minRows: 1 }}
          ref={inputRef}
          className={styles.input}
          size='large'
          allowClear
          placeholder='请输入您的问题'
          value={inputValue}
          onChange={changeInput}
          onPressEnter={pressEnterHandler}
          disabled={disabled}
        />
        <button
          disabled={disabled || !inputValue}
          type='button'
          className={styles.sendBtn}
          style={{
            cursor: disabled || !inputValue ? 'not-allowed' : 'pointer'
          }}
          onClick={() => sendMsg(active?.sessionId as string)}
        >
          发送
        </button>
      </div>
      <Drawer
        width={800}
        title={title}
        open={drawer}
        onClose={() => setDrawer(false)}
      >
        {type === 'prompt' ? (
          <PromptCustom choosePrompt={choosePromptHandler} />
        ) : (
          <PromptWeek generateWeekReport={choosePromptHandler} />
        )}
      </Drawer>
    </div>
  )
}
