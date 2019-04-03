module.exports = (api, options, rootOptions) => {
  // 修改 `package.json` 里的字段
  api.extendPackage({
    scripts: {
      serv: 'vue-cli-service serv',
      build: 'vue-cli-service build',
      add: 'vue-cli-service add'
    }
  })

  // 复制并用 ejs 渲染 `./template` 内所有的文件
  // api.render('./template', {
  //   doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript')
  // })

  // if (options.foo) {
  //   // 有条件地生成文件
  // }

  // 根据eslint配置自动校正
  api.onCreateComplete(() => {
    // Linting the generated files
    if (api.hasPlugin('eslint')) {
      // Lint generated/modified files
      try {
        const lint = require('@vue/cli-plugin-eslint/lint')
        lint({ silent: true }, api)
      } catch (e) {
        // No ESLint vue-cli plugin
      }
    }
  })  
  
}
