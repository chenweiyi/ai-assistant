import chalk from 'chalk'
import { exec, spawn } from 'child_process'
import readline from 'readline'
import { promisify } from 'util'

function getNamespace(s) {
  if (s === null || s === undefined) {
    return '-w'
  }
  if (s === '*') {
    return '--filter=*'
  }
  if (s === 'fe') {
    return '--filter=ai-assistant-frontend'
  }
  if (s === 'be') {
    return '--filter=ai-assistant-backend'
  }
  return ''
}

async function getResult(command) {
  return await promisify(exec)(command)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question(
  chalk.green(
    '请输入要安装/卸载的命令（add/rm），包名，安装所在子包名简写（fe/be/*， 分别表示前端/后端/全部），其余安装参数（参数之间以逗号分隔），例如：add, lodash, fe, --save：\n'
  ),
  async (answer) => {
    console.log(chalk.yellow(`准备安装: ${answer}`))
    const params = answer
      .split(/,|，|\s/g)
      .filter((o) => o.trim() !== '')
      .map((o) => o.trim())
    console.log(chalk.yellow(`执行参数:, ${JSON.stringify(params)}`))
    const action = params[0]
    const pkgName = params[1]
    const namespace = getNamespace(params[2])
    const argsStr = params[3] || ''
    let { stdout: pnpmPath, stderr } = await getResult('which pnpm')
    if (stderr) {
      throw new Error(stderr)
    }
    pnpmPath = pnpmPath.replace(/\r|\n$/, '')
    const args = [action, pkgName, namespace, argsStr]
    const pnpm = spawn(pnpmPath, args)
    console.log(
      chalk.yellow(
        `执行命令: ${pnpmPath.replace(/\r\n$/, '')} ${args.join(' ')}`
      )
    )
    pnpm.stdout.on('data', (data) => {
      console.log(chalk.blue(`${data}`))
    })

    pnpm.stderr.on('data', (data) => {
      console.error(chalk.red(`${data}`))
    })

    pnpm.on('close', (code) => {
      console.log(chalk.green(`child process exited with code ${code}`))
    })

    rl.close()
  }
)

export {}
