# An AI Assistant

[中文文档](README_zh.md)

This is an AI project that integrates various open source AI capabilities.

## Project Introduction

![Screenshot](Screenshots/jietu.png)

1. Currently, only the chatgpt API is integrated, and other AIs such as domestic AIs are planned to be integrated later.
2. The front-end uses umijs, react, ts; the back-end uses koa, ts, and also uses ES module to write.

## Node Version

Node version >= 18 is required.

## Necessary Files

Create a `key.mjs` file under `src/consts/`, providing the following fields for calling OpenAI API in the following way:

```
// openAi key
export const OPENAI_API_KEY = 'xxxx';
// Parameters needed to be passed in headers when calling https://api.openai.com/dashboard/billing/credit_grants interface authorization
export const ACCOUNT_AUTHORIZATION = 'xxx';
// Parameters needed to be passed in headers when calling https://api.openai.com/dashboard/billing/credit_grants interface openaiOrganization
export const ACCOUNT_ORGANIZATION = 'xxx';

```

> If you don't have these fields temporarily, you can send me an email (737649321@qq.com), I am happy to help you.

## How To Use?

1. First install dependencies. Install dependencies under `root directory` using `pnpm`.
2. Start the project: Execute `npm run dev` under root directory to start the backend project.
3. Access project address: `http://localhost:3000`

## How To Develop?

1. First install dependencies. Install dependencies both under root directory and `/frontend/` directory using `pnpm`.
2. Build frontend artifacts: Under `/frontend/` directory execute `npm run dev`, start frontend project.
3. Start backend: Execute `npm run dev` under root directory to start backend project; if you need to debug the backend, please execute `npm run debug`.
4. Access frontend project address: `http://localhost:8000`

## TODO

- [x] Stream output
- [x] Get account information
- [x] Support switching to GPT-4
- [ ] Monorepo exploration
- [ ] Chrome extension
- [ ] i18n
