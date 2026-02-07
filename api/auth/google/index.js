const crypto = require("crypto");
const {
  setCors,
  getBaseUrl,
  setCookie,
  getCookieOptions,
  sanitizeReturnTo,
  sendJson,
} = require("../../_shared");

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

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    sendJson(res, 500, { error: "Missing GOOGLE_CLIENT_ID" });
    return;
  }

  const requestUrl = new URL(req.url, getBaseUrl(req));
  const returnToParam = requestUrl.searchParams.get("returnTo") || "";
  const returnTo = sanitizeReturnTo(returnToParam);

  const state = crypto.randomBytes(16).toString("hex");
  const cookieOptions = getCookieOptions(req, { maxAge: 300 });
  setCookie(res, "oauth_state", state, cookieOptions);
  if (returnTo) {
    setCookie(res, "oauth_return", returnTo, cookieOptions);
  }

  const redirectUri = `${getBaseUrl(req)}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "consent",
    state,
  });

  res.statusCode = 302;
  res.setHeader("Location", `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  res.end();
};
