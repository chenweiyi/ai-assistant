declare module "koa-onerror" {
  import * as Koa from "koa";
  export default function koaOnError(
    app: Koa<Koa.DefaultState, Koa.DefaultContext>
  ): Koa.Middleware;
}
