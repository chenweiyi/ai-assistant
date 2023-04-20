import TitleComponent from '@/components/title/TitleComponent'
import { ILocalSettings, getSettingData, setSettingData } from '@/utils/store'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Form, FormInstance, Input, Modal, Select, Slider } from 'antd'
import { forEach } from 'lodash-es'
import { useEffect, useRef } from 'react'

import styles from './settingModal.less'

interface SettingModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function SettingModal(props: SettingModalProps) {
  const ok = () => {
    formRef.current?.submit()
    props.setOpen(false)
  }

  const cancel = () => {
    props.setOpen(false)
  }

  const formRef = useRef<FormInstance<ILocalSettings>>(null)
  const initData = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    top_p: 1
  }

  const apiKeyRule = [
    {
      required: false,
      message: '不填值时使用系统默认key'
    }
  ]

  const temperatureRule = [
    {
      required: false
    }
  ]

  const topPRule = [
    {
      required: false
    }
  ]

  useEffect(() => {
    if (props.open) {
      const data = getSettingData()
      if (data) {
        forEach(data, (value, key) => {
          formRef.current?.setFieldValue(key, value)
        })
      }
    }
  }, [props.open])

  const submit = (values: ILocalSettings) => {
    console.log('submit', values)
    setSettingData(values as ILocalSettings)
  }

  const submitError = (errorInfo: any) => {
    console.log('submitError', errorInfo)
  }

  return (
    <Modal
      title='ChatGPT 配置'
      open={props.open}
      onOk={ok}
      onCancel={cancel}
      okText='确定'
      cancelText='取消'
      width={600}
      destroyOnClose={false}
    >
      <div className={styles.container}>
        <Form
          className={styles.form}
          name='setting'
          layout='horizontal'
          ref={formRef}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16, offset: 2 }}
          initialValues={initData}
          onFinish={submit}
          onFinishFailed={submitError}
        >
          <Form.Item label='apiKey' name='apiKey' rules={apiKeyRule}>
            <Input placeholder='不填值时使用系统默认key' />
          </Form.Item>
          <Form.Item label='model' name='model'>
            <Select>
              <Select.Option value='gpt-3.5-turbo'>gpt-3.5-turbo</Select.Option>
              <Select.Option value='gpt-4'>gpt-4</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='temperature'
            name='temperature'
            tooltip={{
              title: (
                <TitleComponent
                  title={
                    '可选，默认是1。<br/>使用哪个采样温度，在0和2之间。较高的值，如0.8会使输出更随机，而较低的值，如0.2会使其更加集中和确定性。<br/>我们通常建议更改此参数或 top_p 参数，但不要同时更改两者。'
                  }
                  split={'<br/>'}
                />
              ),
              overlayClassName: styles.tooltip,
              icon: <InfoCircleOutlined />
            }}
            rules={temperatureRule}
          >
            <Slider min={0} max={2} step={0.1}></Slider>
          </Form.Item>
          <Form.Item
            label='top_p'
            name='top_p'
            rules={topPRule}
            tooltip={{
              title: (
                <TitleComponent
                  title={
                    '可选，默认是1。<br/>一种替代temperature采样的方法叫做核心采样，模型考虑具有 top_p 概率质量的标记结果。因此，0.1 表示仅考虑组成前 10% 概率质量的标记。<br/>我们通常建议更改此参数或 temperature 参数，但不要同时更改两者。'
                  }
                  split={'<br/>'}
                />
              ),
              overlayClassName: styles.tooltip,
              icon: <InfoCircleOutlined />
            }}
          >
            <Slider min={0} max={1} step={0.1}></Slider>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
