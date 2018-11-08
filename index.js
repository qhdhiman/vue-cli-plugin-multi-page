/**
 * Service 插件
 * @param api 一个 PluginAPI 实例
 * @param projectOptions 一个包含 vue.config.js 内指定的项目本地选项的对象，或者在 package.json 内的 vue 字段。
 */
const serve = require('./commands/serve')
const build = require('./commands/build')
const add = require('./commands/add')
module.exports = (api, projectOptions) => {

  serve(api, projectOptions) // 注册dev

  build(api, projectOptions) //注册build

  add(api, projectOptions) //注册add

}