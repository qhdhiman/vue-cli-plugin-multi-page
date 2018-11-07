# VUE-CLI-MUILT-PAGE VUE多页开发构建插件
该插件为vue-cli3的cli-plugin。

## 要求的项目结构
```
src  // 源码目录
│  ├─assets // 资源目录
│  │      logo.png
│  │
│  ├─components // 公用组件库
│  │      Hello.vue
│  │
│  └─modules // 多模块目录
│      ├─m1 // 模块1 （结构类似vue官方开发目录结构）
│      │  │  App.vue // 根路由页面
│      │  │  index.html // 启动文件
│      │  │  main.js // 根配置文件
│      │  │
│      │  ├─assets // 资源目录
│      │  │      logo.png
│      │  │
│      │  ├─components // 组件目录
│      │  │      Hello.vue
│      │  │
│      │  └─router // 路由目录
│      │          index.js
│      │
│      └─m2  // 模块1 （结构类似vue官方开发目录结构）
│      │  │  App.vue // 根路由页面
│      │  │  index.html // 启动文件
│      │  │  main.js // 根配置文件
│      │  │
│      │  ├─assets // 资源目录
│      │  │      logo.png
│      │  │
│      │  ├─components // 组件目录
│      │  │      Hello.vue
│      │  │
│      │  └─router // 路由目录
│      │          index.js
```
## 以下是该插件的愿景（最终完成目标）

## 1，在vue-cli3项目中使用该插件
在插件安装后会自动修改项目目录结构为该插件要求的运行环境（参见要求的项目结构）
```
vue add @vue/vue-cli-multi-page
```
## 2，新建模块
```npm
npm create [module]
```
## 3，本地启动模块
```npm
npm run dev [module] 
```
## 4，构建一个模块
```npm
npm run build [module] 
```
## 5，构建所有模块
```npm
npm run build
```