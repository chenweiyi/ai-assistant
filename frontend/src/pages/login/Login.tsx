import { SyntheticEvent, useState } from 'react'

import styles from './login.less'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    // Submit username and password to your backend api
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          <span className={styles.labelTitle}>用户名</span>
          <input
            className={styles.labelInput}
            type='text'
            placeholder='请输入用户名'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className={styles.label}>
          <span className={styles.labelTitle}>密码</span>
          <input
            className={styles.labelInput}
            type='text'
            placeholder='请输入密码'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className={styles.btns}>
          <input className={styles.btn} type='button' value='注册' />
          <input className={styles.btn} type='submit' value='登录' />
        </div>
      </form>
    </div>
  )
}
