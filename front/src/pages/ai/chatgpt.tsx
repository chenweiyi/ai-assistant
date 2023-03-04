import AnswerLayout from '@/components/answer-layout/AnswerLayout';
import {
  BaseSyntheticEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CHATGPT } from '@/api/chatgpt';
import styles from './chatgpt.less';
import { useLatest } from 'ahooks';
import { SESSION_STORAGE_CHATGPT_KEY } from '@/constant/constant';

type RequestOption = {
  msg: string;
};

type SessionInfo = {
  conversationId: string;
  parentMessageId: string;
};

// TODO
const ownerId = 'chenwy';
const ownerName = 'xiaochen';

export default function IndexPage() {
  const [result, setResult] = useState<Answer.answer[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [disabled, setDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const latestResultRef = useLatest(result);

  // 上一次会话的id
  const sessionRef = useRef<SessionInfo>({
    conversationId: '',
    parentMessageId: '',
  });

  useEffect(() => {
    focusInput();
    initialData();
  }, []);

  useEffect(() => {
    storageData();
  }, [JSON.stringify(latestResultRef.current)]);

  // 存储数据
  function storageData() {
    const res = latestResultRef.current.filter((o) => o.type !== 'loading');
    if (res.length) {
      sessionStorage.setItem(SESSION_STORAGE_CHATGPT_KEY, JSON.stringify(res));
    }
  }

  // 发送消息请求
  async function getMsg(meta: RequestOption) {
    setDisabled(true);
    const { code, data, msg } = await CHATGPT.sendMsg({
      ownerId,
      parentMessageId: sessionRef.current.parentMessageId,
      conversationId: sessionRef.current.conversationId,
      ...meta,
    });
    const res = [...latestResultRef.current].filter(
      (o) => o.type !== 'loading',
    );
    if (code === 200) {
      res.push({
        type: 'answer',
        ownerId,
        ownerName,
        content: data.text,
        id: data.id,
        parentMessageId: data.parentMessageId || '',
        conversationId: data.conversationId || '',
      });
      // 存储回复
      setResult(res);
      // 更新session信息
      sessionRef.current = {
        conversationId: data.conversationId || '',
        parentMessageId: data.id || '',
      };
    } else {
      alert(msg);
    }
    setDisabled(false);
    // focusInput();
  }

  // 输入框输入事件
  function changeInput(e: BaseSyntheticEvent) {
    setInputValue(e.target.value || '');
  }

  // 点击“发送”按钮发送消息事件
  function sendMsg() {
    if (inputValue) {
      const res = [...latestResultRef.current];
      // 存入数据及loading数据
      res.push(
        {
          type: 'question',
          ownerId,
          ownerName,
          content: inputValue,
          id: Date.now() + '',
          parentMessageId: '',
          conversationId: '',
        },
        {
          type: 'loading',
          ownerId,
          ownerName,
          content: '',
          id: 'loading_' + Date.now(),
          parentMessageId: '',
          conversationId: '',
        },
      );
      // 存储问题及loading
      setResult(res);
      // 发送请求获取chatgpt的回复
      getMsg({ msg: inputValue });
    }
    // 清空输入框
    setInputValue('');
  }

  // 回车发送消息事件
  function inputKeyUpHandler(e: KeyboardEvent<HTMLInputElement>) {
    if (e.code === 'Enter') {
      sendMsg();
    }
  }

  // 聚焦输入框
  function focusInput() {
    inputRef.current?.focus();
  }

  // 初始化数据
  function initialData() {
    const data = sessionStorage.getItem(SESSION_STORAGE_CHATGPT_KEY);
    if (data) {
      const res = JSON.parse(data);
      setResult(res);
      if (res[res.length - 1].type === 'question') {
        const newRes = [...res];
        // 存入loading数据
        newRes.push({
          type: 'loading',
          ownerId,
          ownerName,
          content: '',
          id: 'loading_' + Date.now(),
          parentMessageId: '',
          conversationId: '',
        });
        // 存储loading
        setResult(newRes);
        getMsg({ msg: res[res.length - 1].content });
      } else {
        const answers = res.filter((o: Answer.answer) => o.type === 'answer');
        if (answers.length) {
          sessionRef.current = {
            conversationId: answers[answers.length - 1].conversationId,
            parentMessageId: answers[answers.length - 1].id,
          };
        }
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <AnswerLayout data={result} />
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
          onClick={sendMsg}
        >
          发送
        </button>
      </div>
    </div>
  );
}
