import {
  IWeekReport,
  getWeekReportData,
  setWeekReportData
} from '@/utils/store'
import {
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined
} from '@ant-design/icons'
import { Alert, Badge, Button, Calendar, Input, Tag, Tooltip } from 'antd'
import { CalendarMode } from 'antd/es/calendar/generateCalendar'
import clsx from 'clsx'
import dayjs, { Dayjs } from 'dayjs'
import type { CellRenderInfo } from 'rc-picker/lib/interface'
import { SyntheticEvent, useState } from 'react'

interface PromptWeekProps {
  generateWeekReport: (prompt: string) => void
}

const colors = [
  'default',
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple'
]

export default function PromptWeek(props: PromptWeekProps) {
  const panelChange = (value: Dayjs, mode: CalendarMode) => {
    console.log('panelChange', value, mode)
  }
  const [prompts, setPrompts] = useState<Array<string>>([
    '生成一份周报',
    '生成一份周报，并附带本周总结',
    '使用表格的形式生成一份周报',
    '使用表格的形式生成一份周报，并附带本周总结'
  ])
  const [checkedIndex, setCheckedIndex] = useState<number>(0)
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [showDate, setShowDate] = useState<boolean>(true)
  const [reportValue, setReportValue] = useState<string>('')

  const selectDate = (value: Dayjs) => {
    console.log('selectDate', value)
    setCurrentDate(value)
    const data = getWeekReportData() as IWeekReport
    const cur = value.format('YYYY-MM-DD')
    setShowDate(false)
    if (data) {
      setReportValue(data[cur])
    }
  }

  const dateCellRender = (current: Dayjs) => {
    const weekReportData = getWeekReportData() as IWeekReport
    const cur = current.format('YYYY-MM-DD')
    if (weekReportData?.[cur]) {
      return (
        <Tooltip title={weekReportData?.[cur]}>
          <Badge
            className='custom-cell-content absolute top--10px left-0px'
            dot
            color='green'
          ></Badge>
        </Tooltip>
      )
    }
    return null
  }

  const monthCellRender = (current: Dayjs) => {
    return null
  }

  const cellRender = (current: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (info.type === 'date') return dateCellRender(current)
    if (info.type === 'month') return monthCellRender(current)
    return info.originNode
  }

  const reportChange = (e: SyntheticEvent) => {
    const weekReportData = getWeekReportData() as IWeekReport
    const value = (e.target as unknown as { value: string }).value
    const cur = currentDate.format('YYYY-MM-DD')
    if (weekReportData) {
      setReportValue(value)
      weekReportData[cur] = value
      setWeekReportData(weekReportData)
    } else {
      setReportValue(value)
      setWeekReportData({
        [cur]: value
      })
    }
  }

  const getWeekContent = () => {
    const weekReportData = getWeekReportData() as IWeekReport
    const dayNumber = currentDate.day()
    const content = []
    if (weekReportData) {
      // 统计从周一到周五的数据
      for (let i = 1; i < 6; i++) {
        const item = dayjs().day(i).format('YYYY-MM-DD')
        const weekNumber = dayjs().day(i).format('dddd')
        const md = dayjs().day(i).format('MM-DD')
        if (weekReportData[item]) {
          content.push(`${weekNumber}(${md}):` + weekReportData[item] + '。')
        } else {
          content.push(`${weekNumber}(${md}):` + '无')
        }
      }
      return content.join(';') + '。'
    }
    return ''
  }

  const generateWeek = () => {
    const weekContent = getWeekContent()
    const content = prompts[checkedIndex] + ', 周报内容如下：' + weekContent
    props.generateWeekReport(content)
  }

  return (
    <div className='prompt-week-container'>
      <div className='prompt-week-timepicker max-h-350px mb-24px'>
        {showDate ? (
          <Calendar
            value={currentDate}
            fullscreen={false}
            onPanelChange={panelChange}
            onSelect={selectDate}
            cellRender={cellRender}
          />
        ) : (
          <div className='week-report'>
            <div
              className={clsx(
                'week-report-title',
                'font-medium',
                'mb-8px',
                'flex',
                'flex-row',
                'justify-between',
                'items-center'
              )}
            >
              <span>{currentDate.format('YYYY-MM-DD dddd')}</span>
              <Button
                type='default'
                icon={<RollbackOutlined />}
                onClick={() => setShowDate(true)}
              >
                返回日历
              </Button>
            </div>
            <Input.TextArea
              showCount
              autoSize={{ minRows: 8 }}
              value={reportValue}
              onChange={reportChange}
              placeholder='请在此填写当前日期日报，方便后续为您生成周报'
            ></Input.TextArea>
          </div>
        )}
      </div>
      <Alert
        showIcon
        message='下方是一些提问的提示词，您可以点击选择相应的提示词，默认以为您选择第一个提示词。'
        type='success'
        closable
        className='p-[4px_12px] text-12px'
      ></Alert>
      <div
        className={clsx(
          'prompt-week-optional-prompt',
          'curved-border',
          'p-[50px_0px]!'
        )}
      >
        {prompts.map((prompt, index) => {
          return (
            <Tag.CheckableTag
              className='tag mb-8px'
              checked={checkedIndex === index}
              onChange={() => setCheckedIndex(index)}
              key={prompt}
            >
              {prompt}
            </Tag.CheckableTag>
          )
        })}
      </div>
      <div className='btns'>
        <Button className='w-100%' type='primary' ghost onClick={generateWeek}>
          生成周报
        </Button>
      </div>
    </div>
  )
}
