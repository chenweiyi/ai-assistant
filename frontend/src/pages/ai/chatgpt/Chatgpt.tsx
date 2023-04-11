import AnswerLayout from '@/components/answer-layout/AnswerLayout';
import {
  BaseSyntheticEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './chatgpt.less';
import { useLatest } from 'ahooks';
import { ChatContext } from '@/pages/ai/chatgpt/LayoutIndex';
import qs from 'qs';

type RequestOption = {
  msg: string;
};

// TODO
const ownerId = 'chenwy';
const ownerName = 'xiaochen';

export default function IndexPage() {
  const {
    active,
    setResultDataBySessionId,
    setResultBySessionId,
    storageData,
    getConvasitionBySessionId,
  } = useContext(ChatContext);

  const result = active?.data || [];
  const isInput = active?.isInput || false;
  const [inputValue, setInputValue] = useState('');
  const [disabled, setDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const latestResultRef = useLatest(result);

  /**
   * 采用EventSource模式获取数据
   * @param meta
   * @param sessionId
   */
  async function getConstantMsg(meta: RequestOption, sessionId: string) {
    const source = new EventSource(
      `/q/sendMsg/sse?${qs.stringify({
        ownerId,
        parentMessageId:
          getConvasitionBySessionId(sessionId)?.parentMessageId || '',
        ...meta,
      })}`,
    );
    source.addEventListener(
      'open',
      () => {
        console.log('EventSource Connected!!');
      },
      false,
    );

    source.addEventListener(
      'message',
      (e) => {
        const result = JSON.parse(e.data);
        const convasition = getConvasitionBySessionId(sessionId);
        console.log('=== result:', e.data);
        const hasLoading = convasition?.data.some(d => d.type === 'loading');
        
        if (hasLoading) {
          // 去掉上一个loading
          const newData = convasition?.data.filter(d => d.type !== 'loading') ?? [];
          const newAnswer = {
            type: 'answer' as 'answer',
            ownerId,
            ownerName,
            content: result.text,
            id: result.id,
            error: result.error,
          }
          newData.push(newAnswer);
          // 存储回复,并存储parentMessageId, isInput, isLoading
          setResultBySessionId(
            { data: newData, parentMessageId: result.error ? '' : result.id, isInput: !result.error, isLoading: false },
            sessionId,
          );
          // 如果是error数据,则关闭EventSource
          if (result.error && result.done) {
            source.close();
            return;
          }
        } else {
          if (convasition?.data[convasition?.data.length - 1]?.type === 'answer') {
            const newData = [...convasition?.data.slice(0, -1), {
              type: 'answer' as 'answer',
              ownerId,
              ownerName,
              content: result.text,
              id: result.id,
              error: result.error,
            }]
            // 存储回复,并存储parentMessageId, isInput, isLoading
            setResultBySessionId(
              { data: newData, parentMessageId: result.error ? '' : result.id, isInput: !result.error, isLoading: false },
              sessionId,
            );
            // 如果是error数据,则关闭EventSource
            if (result.error) {
              source.close();
            }
          }
        }
        
        if (result.done) {
          // 修改isInput的状态
          setResultBySessionId(
            { isInput: false, isLoading: false },
            sessionId,
          );
          source.close();
        }
      },
      false,
    );
    source.addEventListener(
      'error',
      (e) => {
        console.log('EventSource Error', e);
      },
      false,
    );
  }

  // 输入框输入事件
  function changeInput(e: BaseSyntheticEvent) {
    setInputValue(e.target.value || '');
  }

  // 点击“发送”按钮发送消息事件
  function sendMsg(sessionId: string) {
    return () => {
      if (inputValue) {
        // 存入数据及loading数据
        const datas = [
          {
            type: 'question' as 'question',
            ownerId,
            ownerName,
            content: inputValue,
            id: Date.now() + '',
          },
          {
            type: 'loading' as 'loading',
            content: '',
            id: 'loading_' + Date.now(),
          },
        ];
        // 存储问题及loading
        setResultDataBySessionId({ append: datas, isLoading: true }, sessionId);
        // 发送请求获取chatgpt的回复
        getConstantMsg({ msg: inputValue }, sessionId);
      }
      if (sessionId === active?.sessionId) {
        // 清空输入框
        setInputValue('');
      }
    };
  }

  // 回车发送消息事件
  function inputKeyUpHandler(e: KeyboardEvent<HTMLInputElement>) {
    if (e.code === 'Enter') {
      // sendMsg(active?.sessionId as string)();
      sendMsg(active?.sessionId as string)();
    }
  }

  // 聚焦输入框
  function focusInput() {
    setDisabled(false);
    inputRef.current?.focus();
  }

  // 初始化数据,如果最后一条数据是问题,则发送请求获取chatgpt的回复
  function initialData() {
    const last = result[result.length - 1];
    if (last?.type === 'question') {
      const loading = {
        type: 'loading' as 'loading',
        id: 'loading_' + Date.now(),
        content: '',
      };
      // 存入loading数据
      setResultDataBySessionId(
        { append: [loading], isLoading: true },
        active?.sessionId as string,
      );
      // 发送请求获取chatgpt的回复
      getConstantMsg(
        { msg: last.content },
        active?.sessionId as string,
      );
    }
  }

  useEffect(() => {
    focusInput();
    initialData();
  }, []);

  useEffect(() => {
    focusInput();
    initialData();
  }, [active?.sessionId]);

  useEffect(() => {
    storageData({
      ...(active as IConvasition),
      data: latestResultRef.current.filter((o) => o.type !== 'loading'),
    });
  }, [JSON.stringify(latestResultRef.current)]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <AnswerLayout data={result} inputing={isInput} />
      </div>
      <div className={styles.questionWrapper}>
        <label className={styles.labelForInput}>
          <input
            ref={inputRef}
            className={styles.input}
            value={inputValue}
            onChange={changeInput}
            onKeyUp={inputKeyUpHandler}
            disabled={disabled}
            placeholder="请输入您的问题"
          />
        </label>
        <button
          disabled={disabled || !inputValue}
          type="button"
          className={styles.sendBtn}
          style={{
            cursor: disabled || !inputValue ? 'not-allowed' : 'pointer',
          }}
          onClick={sendMsg(active?.sessionId as string)}
        >
          发送
        </button>
      </div>
    </div>
  );
}
