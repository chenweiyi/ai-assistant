import Koa from "koa";
import path from "path";
import json from "koa-json";
import onerror from "koa-onerror";
import bodyparser from "koa-bodyparser";
import logger from "koa-logger";
import serve from "koa-static";
import etag from "koa-etag";
import conditional from "./utils/koa-conditional-get.mjs";
import message from "./routes/message.mjs";
import history from "koa2-history-api-fallback";

let app = new Koa();

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);

app.use(json());
app.use(logger());

app.use(async (ctx, next) => {
  await next();
});

app.use(history());

// app.use(views(__dirname + '/views', {
//   extension: 'pug'
// }))

// etag 304
app.use(conditional());
app.use(etag());

// logger
app.use(async (ctx, next) => {
  const start = new Date().getTime();
  await next();
  const ms = new Date().getTime() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(
  serve("front/dist/", {
    // 设置cache-controll缓存时间
    maxage: 1000 * 60 * 60 * 2,
    // index.html禁止缓存
    setHeaders(res, filePath) {
      const { base } = path.parse(filePath);
      if (base === "index.html") {
        res.setHeader("Cache-Control", "max-age=0");
      }
    },
  })
);

// routes
// app.use(index.routes(), index.allowedMethods())
// app.use(users.routes(), users.allowedMethods())
app.use(message.routes()).use(message.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

export default app;
