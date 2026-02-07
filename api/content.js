const {
  setCors,
  getSession,
  readJsonBody,
  sendJson,
} = require("./_shared");

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main",
    path: process.env.GITHUB_PATH || "data/content.json",
    token: process.env.GITHUB_TOKEN,
  };
}

async function fetchContentFromGitHub() {
  const { owner, repo, branch, path, token } = getGitHubConfig();
  if (!owner || !repo) {
    throw new Error("Missing GitHub repo config");
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kaiyang-site",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${response.status}`);
  }
  const data = await response.json();
  const content = Buffer.from((data.content || "").replace(/\n/g, ""), "base64").toString("utf8");
  return { json: JSON.parse(content), sha: data.sha };
}

async function updateContentOnGitHub(content, sha) {
  const { owner, repo, branch, path, token } = getGitHubConfig();
  if (!owner || !repo || !token) {
    throw new Error("Missing GitHub token config");
  }
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message: `Update ${path} from admin console`,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
    sha,
    branch,
  };
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "kaiyang-site",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`GitHub update failed: ${response.status}`);
  }
  return response.json();
}

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET") {
    try {
      const { json } = await fetchContentFromGitHub();
      res.setHeader("Cache-Control", "no-store");
      sendJson(res, 200, json);
      return;
    } catch (error) {
      sendJson(res, 500, { error: "Failed to load content" });
      return;
    }
  }

  if (req.method === "PUT") {
    const session = getSession(req);
    if (!session?.admin) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    let payload;
    try {
      payload = await readJsonBody(req);
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON" });
      return;
    }

    try {
      const { sha } = await fetchContentFromGitHub();
      await updateContentOnGitHub(payload, sha);
      sendJson(res, 200, payload);
    } catch (error) {
      sendJson(res, 500, { error: "Failed to update content" });
    }
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
};
