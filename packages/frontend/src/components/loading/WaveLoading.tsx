import styles from './waveLoading.less'

type WaveLoadingProps = {
  style?: React.CSSProperties
}

export default function WaveLoading(props: WaveLoadingProps) {
  const styleObj = Object.assign({}, props.style ?? {})
  return (
    <div className={styles.loading} style={styleObj}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}
