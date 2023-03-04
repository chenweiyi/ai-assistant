import RouterEngine from "@koa/router";
import MessageController from "../controller/message.mjs";

const router = new RouterEngine();

router.prefix("/q");

router.post("/sendMsg", MessageController.sendMsg);

export default router;
