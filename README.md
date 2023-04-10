# 一个 AI 助手
这是一个AI项目，集成各种开放AI的能力。
## 项目介绍

![截图](Screenshots/jietu.png)


1. 目前仅仅接入了 chatgpt api，后面打算接入其他 ai，比如国产 ai。
2. 前端使用 umijs, react, ts; 后端使用 koa，ts，后端也是用 ES module 方式去写

## node 版本

需要 node >= 18 版本

## 必要文件

在`src/consts/`下面新建 key.mjs, 提供`OPENAI_API_KEY`字段用于调用 openai api，例如如下方式：
```
export const OPENAI_API_KEY = 'xxxx';
```
> 如果你暂时没有`openAI key`, 可以邮箱联系我(737649321@qq.com)，我给你提供我自己的key.

## 如何使用？

1. 首先安装依赖，`根目录`下安装依赖，使用`pnpm`安装代码。
3. 启动项目：根目录下执行`npm run develop`，启动后端项目。
4. 访问项目地址：`http://localhost:3000`

## 如何开发？

1. 首先安装依赖，`根目录`下和`/frontend/`目录下都要安装依赖，使用`pnpm`安装代码。
2. 构建前端产物：`frontend/`目录下，执行`npm run dev`, 启动前端项目。
3. 启动后端：根目录下执行`npm run develop`，启动后端项目。
4. 访问前端项目地址：`http://localhost:8000`

## TODO
- [x] stream输出
- [ ] monorepo探索
- [ ] chrome扩展



