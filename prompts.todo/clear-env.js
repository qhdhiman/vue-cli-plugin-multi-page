module.exports = cli => {
  cli.injectFeature({
    name: 'module',
    type: 'input',
    description: '请输入模块名称',
    validate: val => {
      return val
          ? val
          : '请输入模块名称1'
    },
  })

  cli.onPromptComplete((answers, options) => {
    console.log('answers', answers)
    if (answers.features.includes('module')) {
      options.module = answers.features.includes('module')
    }
  })

}