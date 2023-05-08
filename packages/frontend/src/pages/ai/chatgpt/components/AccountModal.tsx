import { User } from '@/services/user'
import { SyncOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import styles from './accountModal.less'

interface AccountModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function AccountModal(props: AccountModalProps) {
  const ok = () => {
    props.setOpen(false)
  }

  const cancel = () => {
    props.setOpen(false)
  }

  const [info, setInfo] = useState<UserInfo | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (props.open) {
      setLoading(true)
      User.getUserInfo()
        .then((res) => {
          if (res.code === 200) {
            setInfo(res.data)
            setErrorMsg('')
          } else {
            setInfo(undefined)
            setErrorMsg(res.msg)
          }
          setLoading(false)
        })
        .catch(() => {
          setInfo(undefined)
          setLoading(false)
        })
    }
  }, [props.open])

  return (
    <Modal
      title='账户信息'
      open={props.open}
      onOk={ok}
      onCancel={cancel}
      okText='确定'
      cancelText='取消'
    >
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>
            <SyncOutlined spin />
          </div>
        ) : errorMsg ? (
          <div className={styles.errorMsg}>
            <div className={styles.title}>Error:</div>
            <div className={styles.content}>{errorMsg}</div>
          </div>
        ) : info ? (
          <div className={styles.info}>
            <div className={styles.item}>
              <span className={styles.title}>账户总量:</span>
              <span>${info.total}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.title}>使用量:</span>
              <span>${info.used}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.title}>剩余量:</span>
              <span>${info.available}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.title}>套餐信息:</span>
              <div className={styles.packages}>
                {info.grants?.data.map((p: grantData) => (
                  <div key={p.id} className={styles.package}>
                    <span>有效期：</span>
                    <span>
                      {dayjs(p.effective_at * 1000).format('YYYY-MM-DD')}{' '}
                    </span>
                    <span>-</span>
                    <span>
                      {dayjs(p.expires_at * 1000).format('YYYY-MM-DD')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noData}></div>
        )}
      </div>
    </Modal>
  )
}
