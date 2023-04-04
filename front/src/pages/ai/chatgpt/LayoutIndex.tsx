import { useEffect, useState, createContext, Dispatch, SetStateAction } from "react";
import LayoutSider from "./LayoutSider";
import Chatgpt from "./Chatgpt";
import { SESSION_STORAGE_CONVASITION_CHATGPT_KEY } from "@/constant/constant";
import { getRandomId } from "@/utils/tools";
import styles from './layoutIndex.less';
import { useLatest } from "ahooks";

interface IChatContext {
  result: IConvasition[],
  active: IConvasition | null,
  setResult: Dispatch<SetStateAction<IConvasition[]>>,
  setResultDataBySessionId: (appendData: { append: Array<Answer.answer>, isLoading: boolean }, sessionId: string) => void,
  storageData: (data: IConvasition) => void,
  addResult: () => void,
  deleteResult: (sessionId: string) => void,
  toggleActive: (sessionId: string) => void,
  getConvasitionBySessionId: (sessionId: string) => IConvasition | undefined,
  setResultBySessionId: (params: Partial<IConvasition>, sessionId: string) => void,
}

const getOrder = (res: IConvasition[], index: number): number => {
  if (res.find(r => r.order === index)) {
    return getOrder(res, index + 1);
  }
  return index;
}

const ChatContext = createContext<IChatContext>({
  result: [],
  active: null,
  setResult: () => {},
  setResultDataBySessionId: () => {},
  storageData: () => {},
  addResult: () => {},
  deleteResult: () => {},
  toggleActive: () => {},
  getConvasitionBySessionId: () => undefined,
  setResultBySessionId: () => {},
});


function useGetActive (result: IConvasition[]) {
  const [active, setActive] = useState<IConvasition | null>(getActive);

  function getActive() {
    return result.find(r => r.active) ?? null
  }

  useEffect(() => {
    setActive(getActive());
  }, [JSON.stringify(result)])

  return active;
}

function LayoutIndex () {
  const [result, setResult] = useState<IConvasition[]>([]);
  const active = useGetActive(result);

  const latestResultRef = useLatest(result);
  
  useEffect(() => {
    initialData();
  }, []);

  function initialData () {
    const res = sessionStorage.getItem(SESSION_STORAGE_CONVASITION_CHATGPT_KEY);
    if (res) {
      const data: IConvasition[] = JSON.parse(res);
      setResult(data);
    } else {
      const defaultData: IConvasition = {
        sessionId: getRandomId(),
        active: true,
        title: '会话1',
        order: 0,
        data: [],
        parentMessageId: '',
        isLoading: false,
      }
      setResult([defaultData]);
    }
  }

  function setResultDataBySessionId (appendData: { append: Array<Answer.answer>, isLoading: boolean }, sessionId: string) {
    console.log('-- setResultDataBySessionId result', latestResultRef.current, appendData);
    const res = latestResultRef.current.map((item) => {
      if (item.sessionId === sessionId) {
        const newData = [...item.data];
        newData.push(...appendData.append);
        return {
          ...item,
          ...{data: newData, isLoading: appendData.isLoading},
        }
      }
      return item;
    });
    setResult(res);
  }

  function setResultBySessionId (params: Partial<IConvasition>, sessionId: string) {
    console.log('-- setResultBySessionId result', latestResultRef.current, params);
    const res = latestResultRef.current.map((item) => {
      if (item.sessionId === sessionId) {
        return {
          ...item,
          ...params,
        }
      }
      return item;
    });
    setResult(res);
  }

  function storageData(data: IConvasition) {
    // const res = latestResultRef.current.filter((o) => o.type !== 'loading');
    const newResult = [...latestResultRef.current];
    const index = newResult.findIndex(r => r.sessionId === data.sessionId);
    if (index > -1) {
      newResult[index] = data;
    }
    if (newResult.length) {
      sessionStorage.setItem(SESSION_STORAGE_CONVASITION_CHATGPT_KEY, JSON.stringify(newResult));
    }
  }

  function addResult () {
    const newResult = [...latestResultRef.current];
    const newSession: IConvasition = {
      sessionId: getRandomId(),
      active: true,
      title: `会话${newResult.length + 1}`,
      order: getOrder(newResult, newResult.length),
      data: [],
      parentMessageId: '',
      isLoading: false,
    }
    newResult.forEach((item) => {
      item.active = false;
    });
    newResult.push(newSession);
    setResult(newResult);
  }

  function deleteResult (sessionId: string) {
    const newResult = [...latestResultRef.current];
    const index = newResult.findIndex(r => r.sessionId === sessionId);
    const convasition = newResult.find(r => r.sessionId === sessionId);
    if (index > -1) {
      newResult.splice(index, 1);
      if (convasition?.active) {
        newResult[newResult.length - 1].active = true;
      }
    }
    setResult(newResult);
  }

  function toggleActive (sessionId: string) {
    const newResult = [...latestResultRef.current];
    newResult.forEach((item) => {
      item.active = item.sessionId === sessionId;
    });
    setResult(newResult);
  }

  function getConvasitionBySessionId (sessionId: string) {
    return latestResultRef.current.find(r => r.sessionId === sessionId);
  }

  return (
    <ChatContext.Provider value={{
      result, 
      active, 
      setResult, 
      setResultDataBySessionId, 
      storageData, 
      addResult, 
      deleteResult, 
      toggleActive, 
      getConvasitionBySessionId,
      setResultBySessionId,
    }}>
      <div className={styles.layoutAi}>
        <LayoutSider />
        <Chatgpt />
      </div>
    </ChatContext.Provider>
  )
}

export default LayoutIndex;
export {
  ChatContext,
}