# 基础镜像
FROM node:18-alpine3.14 AS base

ARG PNPM_VERSION=8.3.1
RUN npm install -g pnpm@$PNPM_VERSION

# 用pnpm构建依赖
FROM base AS build-stage

WORKDIR /ai-assistant

# 仅复制lock文件
COPY pnpm-lock.yaml .

# 这里这么写主要是缓存依赖，参考文档https://pnpm.io/zh/cli/fetch
RUN pnpm fetch --prod

COPY . .

RUN pnpm install -r --offline

RUN npm run build

# 单独构建后台依赖
FROM node:18-alpine3.14 AS backend-modules

WORKDIR /ai-assistant/packages/backend

COPY packages/backend/package.json .

RUN pnpm install --registry=https://registry.npm.taobao.org

COPY packages/backend .

# service
FROM node:18-alpine3.14 AS service

WORKDIR /ai-assistant

# COPY --from=build-stage /ai-assistant/packages/backend ./packages/backend
COPY --from=build-stage /ai-assistant/packages/frontend/dist ./packages/frontend/dist
# 这里需要用到npm下载到的node_modules
# 因为本项目是monorepo, 根项目下的node_modules巨大，而后台项目下的node_modules不全
# 因此这里单独用npm构建
COPY --from=backend-modules /ai-assistant/packages/backend ./packages/backend

EXPOSE 3000

WORKDIR /ai-assistant/packages/backend

CMD ["npm", "run", "start"]