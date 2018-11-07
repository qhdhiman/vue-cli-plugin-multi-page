/**
 * Service 插件
 * @param api 一个 PluginAPI 实例
 * @param projectOptions 一个包含 vue.config.js 内指定的项目本地选项的对象，或者在 package.json 内的 vue 字段。
 */
var merge = require('webpack-merge')
let Dev = require('./commands/dev')
module.exports = (api, projectOptions) => {
  Dev(api, projectOptions) // 注册dev


  api.chainWebpack(webpackConfig => {
    // 通过 webpack-chain 修改 webpack 配置
    console.log('chainWebpack')
    console.log()
  })
  api.configureWebpack(webpackConfig => {
    // 修改 webpack 配置
    // 或返回通过 webpack-merge 合并的配置对象
    // console.log(webpackConfig)
    // webpackConfig.entry = 'src/modules/m1/main.js'
    // webpackConfig.outputDir = 'dist/m1'
    // webpackConfig.baseUrl = 'static'
    // return merge(webpackConfig, {
    //   entry: 'src/modules/m1/main.js',
    //   outputDir: 'dist/m1/static',
    //   baseUrl: 'static'
    // })
  })

  // api.registerCommand('dev', args => {
  //   console.log('vue-cli-mulit-page')
  //   // 注册 `vue-cli-service build`
  //   const configA = api.resolveWebpackConfig()
  //   const modules = args._
  //   console.log('modules', modules)
  // })

  // api.registerCommand('serve', args => {
  //   console.log('vue-cli-mulit-page')
  //   // 注册 `vue-cli-service build`
  //   const configA = api.resolveWebpackConfig()
  //   const module = args._[0]
  //   console.log('module', module)
  //   configA.pages = {
  //     [module]: {
  //       entry: `src/modules/${module}/main.js`,
  //       template: `public/index.html`,
  //       filename: `${module}/index.html`,
  //     }
  //   }
  //   return Promise.resolve(api)
  //   // console.log(api)
  // })
}

// module.exports.defaultModes = {
//   build: 'production'
// }