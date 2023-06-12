const readline = require('readline')
// const debug = require('debug')('install')cle
// const { exec } = require('child_process')
const { spawn } = require('child_process')

function getNamespace(s) {
  if (s === '*' || s === '') {
    return ''
  }
  if (s === 'fe') {
    return '--filter=ai-assistant-frontend'
  }
  if (s === 'be') {
    return '--filter=ai-assistant-backend'
  }
  return ''
}

// const answer = 'add moment be --save'
// console.log(`正在安装 ${answer}`)
// const params = answer.split(/,|，/g).map((o) => o.trim())
// console.log('参数是：', JSON.stringify(params))
// const action = params[0]
// const pkgName = params[1]
// const namespace = getNamespace(params[2])
// const args = params[3] || ''
// const str = `pnpm ${action} ${pkgName} ${namespace} ${args}`
// console.log('开始执行：', str)
// const pnpm = spawn('pnpm', [action, pkgName, namespace, args])
// pnpm.stdout.on('data', (data) => {
//   console.log(`${data}`)
// })

// pnpm.stderr.on('data', (data) => {
//   console.error(`${data}`)
// })

// pnpm.on('close', (code) => {
//   console.log(`child process exited with code ${code}`)
// })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question(
  '请输入要安装/卸载的命令（add/remove），包名，安装所在子包名简写（fe/be/*， 分别表示前端/后端/全部），其余安装参数（参数之间以逗号分隔），例如：add, lodash, fe, --save：\n',
  (answer) => {
    console.log(`正在安装 ${answer}`)
    const params = answer.split(/,|，/g).map((o) => o.trim())
    console.log('参数是：', JSON.stringify(params))
    const action = params[0]
    const pkgName = params[1]
    const namespace = getNamespace(params[2])
    const argsStr = params[3] || ''
    const pnpmPath = 'E:\\apps\\nodejs\\pnpm.cmd' // 使用双反斜杠转义路径中的反斜杠
    const args = [action, pkgName, namespace, argsStr]
    const pnpm = spawn(pnpmPath, args)
    console.log('执行的完整命令：', `${pnpmPath} ${args.join(' ')}`)
    pnpm.stdout.on('data', (data) => {
      console.log(`${data}`)
    })

    pnpm.stderr.on('data', (data) => {
      console.error(`${data}`)
    })

    pnpm.on('close', (code) => {
      console.log(`child process exited with code ${code}`)
    })

    rl.close()
  }
)
