const {
  info
} = require('@vue/cli-shared-utils')

const path = require('path')
const resolve = require('resolve')
const chalk = require('chalk')
const copy = require('copy')
const baseDir = resolve.sync('vue-cli-plugin-multi-page', { basedir: process.cwd() })
const source = path.resolve(path.dirname(baseDir), 'generator/template/ejs/**')
const dist = 'src/modules/'

module.exports = (api, options) => {
  api.registerCommand('add', {
    description: 'add a new module',
    usage: 'vue-cli-service add [m1]',
  }, async function serve (args) {
    info('Adding a new module...')

    // entry arg
    const entry = args._[0]
    // api.resolve(dist + entry)
    console.log(source)
    if (entry) {
      copy(source, api.resolve(dist + entry), function(err, files) {
        console.log(files)
        if (err) throw err;
        // `files` is an array of the files that were copied
        console.log(chalk.yellow(`模块${entry}创建成功！`))
      });
    }
  })
}


