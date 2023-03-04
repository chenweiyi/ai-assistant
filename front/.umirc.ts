import { defineConfig } from "umi";

const serviceUrl = "http://localhost:3000";

export default defineConfig({
  hash: true,
  favicon: "/assets/images/favicon.ico",
  nodeModulesTransform: {
    type: "none",
  },
  routes: [
    { path: "/", redirect: "/ai/chatgpt" },
    {
      path: "/user",
      component: "@/layouts/index",
      routes: [
        {
          path: "/user/login",
          name: "userLogin",
          component: "@/pages/login/Login",
        },
      ],
    },
    {
      path: "/ai",
      component: "@/layouts/index",
      routes: [
        {
          path: "/ai/chatgpt",
          name: "chatgpt",
          component: "@/pages/ai/chatgpt",
        },
      ],
    },
  ],
  fastRefresh: {},
  proxy: {
    // 指标接口
    "/q": {
      target: process.env.RUN_ENV === "dev" ? serviceUrl : "",
      changeOrigin: true,
      disableHostCheck: true,
    },
  },
});
