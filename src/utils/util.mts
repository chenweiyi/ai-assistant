import { SEND_KEY } from "../consts/key.mjs";
import http from "http";

export const getClientIp = function (req: http.IncomingMessage) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  ip = Array.isArray(ip) ? ip[0] : ip;
  if (ip.indexOf("::ffff:") !== -1) {
    ip = ip.substring(7);
  }

  return ip;
};

export async function pushMessage(params: any) {
  const url = `https://sctapi.ftqq.com/${SEND_KEY}.send`;
  console.log("== pushMessage url:", url);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      ...params,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  console.log("== pushMessage data:", data);
  return data;
}
