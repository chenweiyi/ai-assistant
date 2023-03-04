import Koa from "koa";
/**
 * Expose `conditional`.
 *
 * Conditional GET support middleware.
 *
 * @return {Function}
 * @api public
 */

export default function conditional() {
  return async function (ctx: Koa.Context, next: () => Promise<any>) {
    await next();

    if (ctx.fresh) {
      ctx.status = 304;
      ctx.body = null;
    }
  };
}
