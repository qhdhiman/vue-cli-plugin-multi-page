const glob = require("glob")
const defaults = {
  clean: true,
  target: 'app',
  formats: 'commonjs,umd,umd-min',
  'unsafe-inline': true
}

const buildModes = {
  lib: 'library',
  wc: 'web component',
  'wc-async': 'web component (async)'
}

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c))
  } else {
    fn(config)
  }
}

module.exports = (api, options) => {
  api.registerCommand('build', {
    description: 'build for production',
    usage: 'vue-cli-service build [options] [entry|pattern]',
    options: {
      '--mode': `specify env mode (default: production)`,
      '--dest': `specify output directory (default: ${options.outputDir})`,
      '--modern': `build app targeting modern browsers with auto fallback`,
      '--no-unsafe-inline': `build app without introducing inline scripts`,
      '--target': `app | lib | wc | wc-async (default: ${defaults.target})`,
      '--formats': `list of output formats for library builds (default: ${defaults.formats})`,
      '--name': `name for lib or web-component mode (default: "name" in package.json or entry filename)`,
      '--no-clean': `do not remove the dist directory before building the project`,
      '--report': `generate report.html to help analyze bundle content`,
      '--report-json': 'generate report.json to help analyze bundle content',
      '--watch': `watch for changes`
    }
  }, async (args) => {
    for (const key in defaults) {
      if (args[key] == null) {
        args[key] = defaults[key]
      }
    }
    getModules(args).forEach(async m => {
      // args.entry = args.entry || args._[0]
      args.entry = m
      if (args.target !== 'app') {
        args.entry = args.entry || 'src/App.vue'
      }
  
      process.env.VUE_CLI_BUILD_TARGET = args.target
      if (args.modern && args.target === 'app') {
        process.env.VUE_CLI_MODERN_MODE = true
        delete process.env.VUE_CLI_MODERN_BUILD
        await build(Object.assign({}, args, {
          modernBuild: false,
          keepAlive: true
        }), api, options)
  
        process.env.VUE_CLI_MODERN_BUILD = true
        await build(Object.assign({}, args, {
          modernBuild: true,
          clean: false
        }), api, options)
  
        delete process.env.VUE_CLI_MODERN_MODE
        delete process.env.VUE_CLI_MODERN_BUILD
      } else {
        if (args.modern) {
          const { warn } = require('@vue/cli-shared-utils')
          warn(
            `Modern mode only works with default target (app). ` +
            `For libraries or web components, use the browserslist ` +
            `config to specify target browsers.`
          )
        }
        await build(args, api, options)
      }
      delete process.env.VUE_CLI_BUILD_TARGET
    })
    
  })
}
/**
 * 获取构建模块
 * @param {Array} args 需要构建的模块列表
 */
function getModules(args) {
  return args._.length ? args._ : glob.sync('./src/modules/*').map(m=>m.replace('./src/modules/', '').replace('/', ''))
}

async function build (args, api, options) {
  const fs = require('fs-extra')
  const path = require('path')
  const chalk = require('chalk')
  const webpack = require('webpack')
  const formatStats = require('./formatStats')
  const validateWebpackConfig = require('../util/validateWebpackConfig')
  const {
    log,
    done,
    info,
    logWithSpinner,
    stopSpinner
  } = require('@vue/cli-shared-utils')

  log()
  const mode = api.service.mode
  if (args.target === 'app') {
    const bundleTag = args.modern
      ? args.modernBuild
        ? `modern bundle `
        : `legacy bundle `
      : ``
    logWithSpinner(`Building ${args.entry} ${bundleTag}for ${mode}...`)
  } else {
    const buildMode = buildModes[args.target]
    if (buildMode) {
      const additionalParams = buildMode === 'library' ? ` (${args.formats})` : ``
      logWithSpinner(`Building for ${mode} as ${buildMode}${additionalParams}...`)
    } else {
      throw new Error(`Unknown build target: ${args.target}`)
    }
  }

  const targetDir = api.resolve(args.dest || options.outputDir) + '/' + args.entry// 1
  const isLegacyBuild = args.target === 'app' && args.modern && !args.modernBuild

  // resolve raw webpack config
  let webpackConfig
  if (args.target === 'lib') {
    webpackConfig = require('./resolveLibConfig')(api, args, options)
  } else if (
    args.target === 'wc' ||
    args.target === 'wc-async'
  ) {
    webpackConfig = require('./resolveWcConfig')(api, args, options)
  } else {
    webpackConfig = require('./resolveAppConfig')(api, args, options)
  }

  // check for common config errors
  validateWebpackConfig(webpackConfig, api, options, args.target)


  const entry = args.entry  // 1
  if (entry) {
    const modulePath = "./src/modules/" + entry // 1，增加模块路径
    webpackConfig.entry = {
      // app: api.resolve(entry)
      app: modulePath + '/main.js' // 2，修改entry入口
    }
    webpackConfig.output.publicPath = ''
    webpackConfig.output.path = targetDir
    for(let item of webpackConfig.plugins) {
      if (item.options && item.options.template) item.options.template= modulePath + '/index.html'  // 3，修改webpackConfig.plugins.HtmlWebpackPlugin template 入口
    }
  }

  // apply inline dest path after user configureWebpack hooks
  // so it takes higher priority
  if (args.dest) {
    modifyConfig(webpackConfig, config => {
      config.output.path = targetDir
    })
  }

  if (args.watch) {
    modifyConfig(webpackConfig, config => {
      config.watch = true
    })
  }

  // Expose advanced stats
  if (args.dashboard) {
    const DashboardPlugin = require('../../webpack/DashboardPlugin')
    modifyConfig(webpackConfig, config => {
      config.plugins.push(new DashboardPlugin({
        type: 'build',
        modernBuild: args.modernBuild,
        keepAlive: args.keepAlive
      }))
    })
  }

  if (args.report || args['report-json']) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    modifyConfig(webpackConfig, config => {
      const bundleName = args.target !== 'app'
        ? config.output.filename.replace(/\.js$/, '-')
        : isLegacyBuild ? 'legacy-' : ''
      config.plugins.push(new BundleAnalyzerPlugin({
        logLevel: 'warn',
        openAnalyzer: false,
        analyzerMode: args.report ? 'static' : 'disabled',
        reportFilename: `${bundleName}report.html`,
        statsFilename: `${bundleName}report.json`,
        generateStatsFile: !!args['report-json']
      }))
    })
  }

  if (args.clean) {
    await fs.remove(targetDir)
  }

  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      stopSpinner(false)
      if (err) {
        return reject(err)
      }

      if (stats.hasErrors()) {
        return reject(`Build failed with errors.`)
      }

      if (!args.silent) {
        const targetDirShort = path.relative(
          api.service.context,
          targetDir
        )
        log(formatStats(stats, targetDirShort, api))
        if (args.target === 'app' && !isLegacyBuild) {
          if (!args.watch) {
            done(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.`)
            info(`Check out deployment instructions at ${chalk.cyan(`https://cli.vuejs.org/guide/deployment.html`)}\n`)
          } else {
            done(`Build complete. Watching for changes...`)
          }
        }
      }

      // test-only signal
      if (process.env.VUE_CLI_TEST) {
        console.log('Build complete.')
      }

      resolve()
    })
  })
}

module.exports.defaultModes = {
  build: 'production'
}
