# An AI Assistant

This is an AI project that integrates various open source AI capabilities.

## Project Introduction

![Screenshot](Screenshots/jietu2.png)

1. Currently, only the chatgpt API is integrated, and other AIs such as domestic AIs are planned to be integrated later.
2. The front-end uses umijs, react, ts; the back-end uses koa, ts, and also uses ES module to write.

## Node Version

Node version needs to be >= 18.

## Environment Variables

In the `/packages/backend` directory, copy an `.env.example` file and rename it to `.env`, then modify its fields:

```
# OpenAI API Key - https://platform.openai.com/account/api-keys
OPENAI_API_KEY=

# PROXY_ADDRESS represents an http proxy. If left blank or not passed any value,
# it means that the http proxy is not enabled.
PROXY_ADDRESS=
```

## How to Use?

1. First install dependencies by running `pnpm install` in the root directory using `pnpm`.
2. Start the project: run `pnpm run dev` in the root directory.
3. Access project address: `http://localhost:3000`.

## How to Develop?

### Method One: One-Click Startup

Run `pnpm run dev` in the root directory.

### Method Two: Separate Frontend and Backend Startup

1. Start frontend:`pnpm run dev:fe`.
2. Start backend:`pnpm run dev:be`.
3. Access frontend project address:`http://localhost:8000`.

## TODO

- [x] Stream output
- [x] ~~Get account information~~
- [x] Support switching to GPT-4
- [x] Monorepo exploration
- [ ] Chrome extension
- [ ] i18n
