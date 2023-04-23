import shelljs from 'shelljs'

shelljs.cp('-R', 'src/public', 'build')
shelljs.cp('-R', 'src/views', 'build')
