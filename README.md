# 一个 AI 助手
这是一个AI项目，集成各种开放AI的能力，让AI为你干活。
## 项目介绍

1. 目前仅仅接入了 chatgpt api，后面打算接入其他 ai，比如国产 ai。
2. 前端使用 umijs, react, ts; 后端使用 koa，ts，后端也是用 ES module 方式去写

## 必要文件

1. 在`src/consts/`下面新建 key.mjs, 提供`OPENAI_API_KEY`字段用于调用 openai api

## 如何开发？

1. 首先安装依赖，根目录下和`/front/`目录下都要安装依赖，使用`yarn`安装代码
2. 构建前端产物：`front/`目录下，执行`npm run build`，在`front/dist`目录下生成前端产物
3. 启动后端：根目录下执行`npm run develop`
4. 访问`http://localhost:3000`

## node 版本

这是项目的后端， 需要 node > 14 版本


