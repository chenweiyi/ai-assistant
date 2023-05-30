import http from 'http'

export const getClientIp = function (req: http.IncomingMessage) {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  ip = Array.isArray(ip) ? ip[0] : ip
  if (ip.indexOf('::ffff:') !== -1) {
    ip = ip.substring(7)
  }

  return ip
}
