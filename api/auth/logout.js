const { setCors, setCookie, getCookieOptions, sendJson } = require("../_shared");

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST" && req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const cookieOptions = getCookieOptions(req, { maxAge: 0 });
  setCookie(res, "admin_session", "", cookieOptions);
  sendJson(res, 200, { ok: true });
};
