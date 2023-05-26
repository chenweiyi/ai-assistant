import WaveLoading from '@/components/loading/WaveLoading'
import copyToClipboard from '@/utils/copy'
import { ILocalSettings, getSettingData } from '@/utils/store'
import rehypePrism from '@mapbox/rehype-prism'
import { message } from 'antd'
import clsx from 'clsx'
import { SyntheticEvent, useEffect, useRef } from 'react'
import MarkDown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  atomDark,
  dark,
  prism
} from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import styles from './answerLayout.less'
import './markdown.less'

type AnswerLayoutProps = {
  data: Answer.answer[]
  inputing: boolean
  isLoading: boolean
}

const code_content = `Here is \`some\` JavaScript code:

~~~
console.log('It works!')
~~~
`
const table_content = `| 操作 | 数组 | 当前地址 | 指针 | 当前显示组件 |
| ---- | ---- | ---- | ---- | ---- |
| - | [home, A] | /A | A | [home, A] |
| ➡️ push | [home, A, A1] | /A1 | A1 | [A, A1] |
| 后退 | [home, A, A1] | /A | A | [home, A] |
| 前进 | [home, A, A1] | /A1 | A1 | [A, A1] |
`

export default function AnswerLayout(props: AnswerLayoutProps) {
  // const [messageApi, contextHolder] = message.useMessage()
  const ref = useRef<HTMLDivElement>(null)
  const stylesName = {
    question: styles.questionType,
    answer: styles.answerType,
    loading: styles.loadingType
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight
    }
  })

  function generateContent(obj: Answer.answer, index: number) {
    if (obj.type === 'answer') {
      const settings = getSettingData()
      const enable_markdown =
        (settings as ILocalSettings)?.enable_markdown ?? true
      console.log('enable_markdown:', enable_markdown)

      function copyCode(e: SyntheticEvent) {
        copyToClipboard(
          e.currentTarget?.nextSibling?.firstChild?.textContent ?? ''
        )
          .then(() => {
            message.success('复制成功')
          })
          .catch(() => {
            message.error('复制失败')
          })
      }

      if (enable_markdown && !obj.error) {
        return (
          <MarkDown
            className='markdown-container markdown-body p-[0px_16px] bg-transparent!'
            skipHtml={true}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[]}
            components={{
              code({ node, inline, className, children, ...props }) {
                console.log(
                  'markdown: ',
                  node,
                  inline,
                  className,
                  children,
                  props
                )
                const match = /language-(\w+)/.exec(className || '')
                return !inline ? (
                  <div className={clsx(['relative'])}>
                    <span
                      className={clsx([
                        'absolute',
                        'top-2px',
                        'right-4px',
                        'p-[4px_8px]',
                        'color-[rgb(179,179,179)]',
                        'hover-color-[#65a665]',
                        'cursor-pointer',
                        'text-[12px]'
                      ])}
                      onClick={copyCode}
                    >
                      复制代码
                    </span>
                    <SyntaxHighlighter
                      {...props}
                      style={prism}
                      language={match?.[1]}
                      PreTag='div'
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {obj.content}
            {/* {code_content} */}
            {/* {table_content} */}
          </MarkDown>
        )
      } else {
        const paragraph = obj.content.split(/(\n|\r|\r\n)/)
        return paragraph.map((o, i) => (
          <p
            className={clsx(
              obj.error ? styles.answerError : '',
              props.inputing &&
                i === paragraph.length - 1 &&
                index === props.data.length - 1
                ? 'cursor-blingking'
                : ''
            )}
            key={i}
          >
            {/^\s$/.test(o) ? '' : o.replace(/\s/g, ' ')}
          </p>
        ))
      }
    } else if (obj.type === 'question') {
      return obj.content
    } else if (obj.type === 'loading') {
      return <WaveLoading style={{ top: '6px' }} />
    }
  }

  function generateContentWrap(obj: Answer.answer, index: number) {
    if (obj.type === 'answer' || obj.type === 'question') {
      return (
        <>
          <div className={styles.triangle}></div>
          {generateContent(obj, index)}
        </>
      )
    } else if (obj.type === 'loading') {
      return generateContent(obj, index)
    }
  }

  return (
    <div className={styles.container} ref={ref}>
      <ul className={styles.ul}>
        {props.data.map((item, index) => {
          return (
            <li key={item.id} className={styles.answerItem}>
              <div
                className={clsx(
                  styles.answerItemContent,
                  stylesName[item.type]
                )}
              >
                <span
                  className={clsx(styles.logo, {
                    rotate: props.data.length - 1 === index && props.inputing
                  })}
                >
                  {item.type === 'question' && <span>我</span>}
                </span>
                <div className={styles.content}>
                  {generateContentWrap(item, index)}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
