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
// Parameters passed in headers when calling https://api.openai.com/dashboard/billing/credit_grants interface authorization
export const ACCOUNT_AUTHORIZATION = 'xxx';
// Parameters passed in headers when calling https://api.openai.com/dashboard/billing/credit_grants interface openaiOrganization
export const ACCOUNT_ORGANIZATION = 'xxx';

```

> If you don't have these fields temporarily, you can send me an email (737649321@qq.com), I am happy to help you.

## How to Use?

1. First install dependencies. Install dependencies under `root directory` using `pnpm`.
2. Start the project: execute `npm run dev:backend` under root directory to start the backend project.
3. Access project address: `http://localhost:3000`

## How to Develop?

### Method One: One-Click Startup

Execute `npm run start:dev` or `npm run start:debug`.

### Method Two: Separate Frontend and Backend Startup

1. First install dependencies. Install dependencies both under `/frontend/` directory and root directory using pnpm.
2. Build frontend artifacts：execute "npm run dev" under `/frontend/` directory to start the frontend project.
3. Start backend: execute `npm run dev:backend` under root directory to start the backend project; if you need to debug the backend, please execute `npm run debug:backend`.
4. Access frontend project address：`http://localhost:8000`

### How to Modify Ports

1. The default front-end port is `8000`, and the back-end port is `3000`.
2. To modify the front-end port, modify the port configuration in `/frontend/.env`.
3. To modify the back-end port, modify the `SERVER_PORT` field in `/src/server.mjs`. If you need to collaborate with front-end and back-end debugging, you also need to modify proxy configuration of `/frontend/.env`.

## TODO

- [x] Stream output
- [x] Get account information
- [x] Support switching to GPT-4
- [ ] Monorepo exploration
- [ ] Chrome extension
- [ ] i18n
