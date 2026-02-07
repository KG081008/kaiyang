const crypto = require("crypto");
const {
  setCors,
  readJsonBody,
  createSessionCookie,
  setCookie,
  getCookieOptions,
  isAdminEmail,
  sendJson,
} = require("../_shared");

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const salt = process.env.ADMIN_PASSWORD_SALT;
  if (hash && salt) {
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(derived, hash);
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (plain) {
    return timingSafeEqual(password, plain);
  }
  return false;
}

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: "Invalid JSON" });
    return;
  }

  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "");

  if (!email || !password) {
    sendJson(res, 400, { error: "Missing credentials" });
    return;
  }

  if (!isAdminEmail(email)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  if (!verifyPassword(password)) {
    sendJson(res, 401, { error: "Unauthorized" });
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

  sendJson(res, 200, { ok: true });
};
