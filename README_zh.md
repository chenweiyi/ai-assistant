# 一个 AI 助手

这是一个 AI 项目，集成各种开放 AI 的能力。

## 项目介绍

![截图](Screenshots/jietu2.png)

1. 目前仅仅接入了 chatgpt api，后面打算接入其他 ai，比如国产 ai。
2. 前端使用 umijs, react, ts; 后端使用 koa，ts，后端也是用 ES module 方式去写

## node 版本

需要 node >= 18 版本

## 环境变量

在根目录下，复制一个.env.example 文件重命名为.env，修改其中的字段：

```
# OpenAI API Key - https://platform.openai.com/account/api-keys
OPENAI_API_KEY=

# PROXY_ADDRESS represents an http proxy. If left blank or not passed any value, it means that the http proxy is not enabled.
PROXY_ADDRESS=

# change this to an `accessToken` extracted from the ChatGPT site's `https://chat.openai.com/api/auth/session` response
OPENAI_ACCESS_TOKEN=

# Reverse Proxy - Available on accessToken
# Default: https://ai.fakeopen.com/api/conversation
# More: https://github.com/transitive-bullshit/chatgpt-api#reverse-proxy
API_REVERSE_PROXY=

# Third-party service API address
CUSTOM_API_URL=
# Third-party service API may need cookie
CUSTOM_COOKIE=

```

- `OPENAI_API_KEY`: 表示会使用 openAI 的官方 api 访问 chatgpt
- `PROXY_ADDRESS`: 科学上网的代理配置，比如：http://xxx
- `OPENAI_ACCESS_TOKEN`: openAI 的 access_token, [这里](https://chat.openai.com/api/auth/session)是获取方式, 该字段通常和`API_REVERSE_PROXY`字段一起使用，表示会使用非官方 API 访问 chatgpt，如果配置了`OPENAI_API_KEY`字段，则当前字段不生效。
- `API_REVERSE_PROXY`: 表示可用的非官方反向代理，默认采用 `https://ai.fakeopen.com/api/conversation` , 具体请参考[chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api/tree/main#reverse-proxy)
- `CUSTOM_API_URL`: 表示第三方服务地址
- `CUSTOM_COOKIE`: 表示访问第三方服务可能需要的`cookie`字段信息

> 优先级：`OPENAI_API_KEY` > `OPENAI_ACCESS_TOKEN` > `CUSTOM_API_URL`。

## 如何使用？

1. 首先安装依赖，`根目录`下安装依赖，使用`pnpm`安装代码。
2. 启动项目：根目录下执行`pnpm run dev`。
3. 访问项目地址：`http://localhost:3000`

## 如何开发？

### 方式一：一键启动

在根目录下执行 `pnpm run dev`

### 方式二：分前后端启动

1. 启动前端：`pnpm run dev:fe`
2. 启动后端：`pnpm run dev:be`
3. 访问前端项目地址：`http://localhost:8000`

## TODO

- [x] stream 输出
- [x] ~~获取账户信息~~
- [x] 支持切换到 gpt-4
- [x] monorepo 探索
- [ ] chrome 扩展
- [ ] i18n
