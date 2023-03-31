import clsx from "clsx";
import { SyntheticEvent, useContext } from "react";
import { ChatContext } from "./LayoutIndex";
import styles from './layoutSider.less';
import { findLast } from 'lodash-es';

export default function LayoutSider () {

  const { result, addResult, deleteResult, toggleActive } = useContext(ChatContext);

  function deleteItem (item: IConvasition) {
    return (e: SyntheticEvent) => {
      e.stopPropagation();
      deleteResult(item.sessionId);
    }
  }

  function toggle (sessionId: string) {
    return (e: SyntheticEvent) => {
      e.stopPropagation();
      const target = result.find(r => r.sessionId === sessionId);
      if (target?.active) return;
      toggleActive(sessionId);
    }
  }

  function getTitle (item: IConvasition) {
    if (item.isLoading) {
      return '查询中...'
    } else {
      return findLast(item.data, d => d.type === 'question')?.content || item.title;
    }  
  }

  return (
    <div className={styles.layoutAiSlider}>
      <div className={styles.topDiv}>
        <button onClick={addResult}>+ 添加新会话</button>
      </div>
      <ul className={styles.menusUl}>
        {
          result.map((item) => {
            return (
              <li className={clsx(styles.menusLi, { [styles.active]: item.active } )}  key={item.sessionId} onClick={toggle(item.sessionId)}>
                <div className={styles.liTitle}>{getTitle(item)}</div>
                <div className={styles.liBtns}>
                  <button onClick={deleteItem(item)}>删除</button>
                </div>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}