const { setCors, getSession, sendJson } = require("../_shared");

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const session = getSession(req);
  sendJson(res, 200, {
    authenticated: !!session,
    admin: !!session?.admin,
    email: session?.email || "",
  });
};
