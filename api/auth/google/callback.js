const {
  setCors,
  getBaseUrl,
  parseCookies,
  setCookie,
  getCookieOptions,
  createSessionCookie,
  isAdminEmail,
  sendJson,
} = require("../../_shared");

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(payload, "base64").toString("utf8");
  return JSON.parse(json);
}

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
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    sendJson(res, 500, { error: "Missing Google OAuth env" });
    return;
  }

  const requestUrl = new URL(req.url, getBaseUrl(req));
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies.oauth_state) {
    sendJson(res, 400, { error: "Invalid OAuth state" });
    return;
  }

  const redirectUri = `${getBaseUrl(req)}/api/auth/google/callback`;
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  let tokenJson;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    tokenJson = await tokenRes.json();
  } catch (error) {
    sendJson(res, 500, { error: "Failed to fetch token" });
    return;
  }

  const idToken = tokenJson.id_token;
  if (!idToken) {
    sendJson(res, 400, { error: "Missing id_token" });
    return;
  }

  const profile = decodeJwtPayload(idToken);
  const email = profile?.email ? String(profile.email).toLowerCase() : "";
  const emailVerified = profile?.email_verified;

  if (!email || !emailVerified) {
    sendJson(res, 403, { error: "Email not verified" });
    return;
  }

  if (!isAdminEmail(email)) {
    sendJson(res, 403, { error: "Not authorized" });
    return;
  }

  const sessionCookie = createSessionCookie(req, { email, admin: true });
  if (!sessionCookie) {
    sendJson(res, 500, { error: "Missing SESSION_SECRET" });
    return;
  }

  const cookieOptions = getCookieOptions(req, { maxAge: 0 });
  setCookie(res, "oauth_state", "", cookieOptions);
  setCookie(res, "oauth_return", "", cookieOptions);
  setCookie(res, sessionCookie.name, sessionCookie.value, sessionCookie.options);

  const returnTo = cookies.oauth_return || "";
  res.statusCode = 302;
  res.setHeader("Location", returnTo || getBaseUrl(req));
  res.end();
};
