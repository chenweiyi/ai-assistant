import styles from './titleComponent.less'

export default function TitleComponent(props: {
  title: string
  split: string
}) {
  return (
    <div className={styles.title}>
      {props.title.split(props.split).map((t, i) => (
        <p key={i}>{t}</p>
      ))}
    </div>
  )
}
