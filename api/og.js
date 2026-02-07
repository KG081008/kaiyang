const { setCors, getBaseUrl, sendJson } = require("./_shared");

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function resolveUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).toString();
  } catch (error) {
    return value;
  }
}

function extractMetaImage(html, pageUrl) {
  const metaTags = html.match(/<meta[^>]*>/gi) || [];
  const candidates = [];

  metaTags.forEach((tag) => {
    const attrs = {};
    let match;
    const attrRegex = /(property|name|content|rel)\s*=\s*["']([^"']+)["']/gi;
    while ((match = attrRegex.exec(tag))) {
      attrs[match[1].toLowerCase()] = match[2];
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    const content = attrs.content;
    if (!content) return;
    if (
      key === "og:image" ||
      key === "og:image:secure_url" ||
      key === "twitter:image" ||
      key === "twitter:image:src"
    ) {
      candidates.push(content);
    }
  });

  const linkTags = html.match(/<link[^>]*>/gi) || [];
  linkTags.forEach((tag) => {
    const attrs = {};
    let match;
    const attrRegex = /(rel|href)\s*=\s*["']([^"']+)["']/gi;
    while ((match = attrRegex.exec(tag))) {
      attrs[match[1].toLowerCase()] = match[2];
    }
    if (attrs.rel && attrs.rel.toLowerCase() === "image_src" && attrs.href) {
      candidates.push(attrs.href);
    }
  });

  if (candidates.length === 0) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      candidates.push(imgMatch[1]);
    }
  }

  if (candidates.length === 0) return "";
  return resolveUrl(candidates[0], pageUrl);
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

  const requestUrl = new URL(req.url, getBaseUrl(req));
  const target = requestUrl.searchParams.get("url") || "";
  if (!isValidHttpUrl(target)) {
    sendJson(res, 400, { error: "Invalid url" });
    return;
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "kaiyang-site/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) {
      sendJson(res, 400, { error: "Failed to fetch" });
      return;
    }
    const html = await response.text();
    const image = extractMetaImage(html, target);
    sendJson(res, 200, { image });
  } catch (error) {
    sendJson(res, 500, { error: "Failed to fetch" });
  }
};
