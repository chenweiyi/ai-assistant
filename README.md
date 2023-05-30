# An AI Assistant

This is an AI project that integrates various open source AI capabilities.

## Project Introduction

![Screenshot](Screenshots/jietu2.png)

1. Currently, only the chatgpt API is integrated, and other AIs such as domestic AIs are planned to be integrated later.
2. The front-end uses umijs, react, ts; the back-end uses koa, ts, and also uses ES module to write.

## Node Version

Node version >= 18 is required.

## Environment Variables

In the `/packages/backend` directory, copy an `.env.example` file and rename it to `.env`, then modify its fields:

```
# OpenAI API Key - https://platform.openai.com/account/api-keys
OPENAI_API_KEY=

# PROXY_ADDRESS represents an http proxy. If left blank or not passed any value,
# it means that the http proxy is not enabled.
PROXY_ADDRESS=

# change this to an `accessToken` extracted from the ChatGPT site's
# `https://chat.openai.com/api/auth/session` response
OPENAI_ACCESS_TOKEN=

# Reverse Proxy - Available on accessToken
# Default: https://ai.fakeopen.com/api/conversation
API_REVERSE_PROXY=
```

- `OPENAI_API_KEY`: Indicates that official OpenAI APIs will be used to access chatgpt.
- `PROXY_ADDRESS`: Scientific Internet access proxy configuration, for example: http://xxx.
- `OPENAI_ACCESS_TOKEN`: Indicates that unofficial APIs will be used to access chatgpt.
- `API_REVERSE_PROXY`: Indicates available unofficial reverse proxies. By default it adopts "https://ai.fakeopen.com/api/conversation". For details please refer [transitive-bullshit 大佬](https://github.com/transitive-bullshit/chatgpt-api/tree/main#reverse-proxy).

> If both `OPENAI_API_KEY` and `OPENAI_ACCESS_TOKEN` are configured, `OPENAI_API_KEY` will be given priority.

## How to Use?

1. First install dependencies, install code using `pnpm` in the root directory.
2. Start the project: execute `pnpm run dev` in the root directory.
3. Access the project address: `http://localhost:3000`.

## How to Develop?

### Method 1: One-click Startup

Execute `pnpm run dev` in the root directory.

### Method 2: Separate Front-end and Back-end Startup

1. Start front-end:`pnpm run dev:fe`.
2. Start back-end:`pnpm run dev:be`.
3. Access front-end project address:`http://localhost:8000`.

## TODO

- [x] Stream output
- [x] ~~Get account information~~
- [x] Support switching to GPT-4
- [x] Monorepo exploration
- [ ] Chrome extension
- [ ] i18n
