const crypto = require("crypto");

const DEFAULT_ALLOWED_ORIGINS = ["https://kg081008.github.io"];

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || "";
  const list = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length > 0 ? list : DEFAULT_ALLOWED_ORIGINS;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;
  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin)) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
}

function getBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  return `${proto}://${host}`;
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function toBase64Url(input) {
  const base = Buffer.isBuffer(input) ? input.toString("base64") : Buffer.from(input).toString("base64");
  return base.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf8");
}

function signValue(value, secret) {
  return toBase64Url(crypto.createHmac("sha256", secret).update(value).digest());
}

function createSessionToken(payload, secret) {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = signValue(body, secret);
  return `${body}.${signature}`;
}

function verifySessionToken(token, secret) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const expected = signValue(body, secret);
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return null;
  const payload = JSON.parse(fromBase64Url(body));
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

function appendSetCookie(res, cookie) {
  const prev = res.getHeader("Set-Cookie");
  if (!prev) {
    res.setHeader("Set-Cookie", cookie);
  } else if (Array.isArray(prev)) {
    res.setHeader("Set-Cookie", [...prev, cookie]);
  } else {
    res.setHeader("Set-Cookie", [prev, cookie]);
  }
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  appendSetCookie(res, parts.join("; "));
}

function getCookieOptions(req, overrides = {}) {
  const secure = (req.headers["x-forwarded-proto"] || "").includes("https");
  return {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: secure ? "None" : "Lax",
    ...overrides,
  };
}

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  if (!email) return false;
  const list = getAdminEmails();
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase());
}

function getSession(req) {
  const secret = process.env.SESSION_SECRET || "";
  if (!secret) return null;
  const cookies = parseCookies(req);
  const token = cookies.admin_session;
  return verifySessionToken(token, secret);
}

function createSessionCookie(req, payload, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secret = process.env.SESSION_SECRET || "";
  if (!secret) return null;
  const token = createSessionToken({ ...payload, exp: Date.now() + maxAgeSeconds * 1000 }, secret);
  return {
    name: "admin_session",
    value: token,
    options: getCookieOptions(req, { maxAge: maxAgeSeconds }),
  };
}

function sanitizeReturnTo(urlString) {
  if (!urlString) return "";
  try {
    const url = new URL(urlString);
    const allowed = getAllowedOrigins();
    if (allowed.includes(url.origin)) {
      return url.toString();
    }
  } catch (error) {
    return "";
  }
  return "";
}

async function readJsonBody(req) {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return null;
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : null;
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

module.exports = {
  getAllowedOrigins,
  setCors,
  getBaseUrl,
  parseCookies,
  setCookie,
  getCookieOptions,
  createSessionCookie,
  getSession,
  isAdminEmail,
  sanitizeReturnTo,
  readJsonBody,
  sendJson,
};
