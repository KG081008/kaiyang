const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const langToggle = document.querySelector("[data-lang-toggle]");
const copyBtn = document.querySelector("[data-copy]");
const revealItems = document.querySelectorAll("[data-reveal]");
const searchInput = document.querySelector("[data-search]");
const searchEmpty = document.querySelector("[data-search-empty]");
const searchCount = document.querySelector("[data-search-count]");
const publishForm = document.querySelector("[data-publish-form]");
const resetFormBtn = document.querySelector("[data-reset-form]");
const publishStatus = document.querySelector("[data-publish-status]");
const loginBtn = document.querySelector("[data-login-btn]");
const logoutBtn = document.querySelector("[data-logout-btn]");
const authStatus = document.querySelector("[data-auth-status]");
const authEmail = document.querySelector("[data-auth-email]");
const adminOnlyEls = document.querySelectorAll("[data-admin-only]");
const authForm = document.querySelector("[data-auth-form]");

const SECTION_STATE_KEY = "sectionState";
const CONTENT_URL = "./data/content.json";
const CONTENT_BACKUP_KEY = "contentBackup";

const DEFAULT_CONTENT = {
  articles: [
    {
      id: "cerda-vision",
      title: "Cerdà's Vision of Barcelona Today",
      desc: "关于 19 世纪 Eixample 规划与当代城市问题的短文。",
      tag: "Urban Study",
      link: "https://kg081008.github.io/kaiyang/cerda-vision.html",
      cover: "./assets/cerda-1.jpg",
      meta: ["简介：回顾 Cerdà 规划理念及其在今日的张力。", "形式：在线阅读文章（非 PDF）。"],
    },
  ],
  recArticles: [],
  recVideos: [],
  music: [],
};

let contentState = normalizeContent(DEFAULT_CONTENT);
let currentTheme;
let currentLang;
let sectionState = JSON.parse(localStorage.getItem(SECTION_STATE_KEY) || "{}");
let editState = null;
let authState = { available: false, admin: false, email: "" };
let backupSyncAttempted = false;

const translations = {
  zh: {
    title: "Kling | 个人介绍",
    status_online: "在线",
    nav_intro: "简介",
    nav_search: "检索",
    nav_articles: "文章",
    nav_rec_articles: "推荐文章",
    nav_rec_videos: "推荐视频",
    nav_music: "音乐",
    nav_publish: "发布",
    hero_pill_article: "Cerdà 文章",
    hero_title: "我把学习、研究与项目做成可交付的作品。",
    hero_lead: "聚焦教育/公益组织、辩论与伦理讨论，以及 AI 工具化工作流（Notion/自动化/产品化）。",
    hero_cta_work: "文章分享",
    hero_cta_email: "音乐分享",
    meta_now_label: "现在在做",
    meta_now_value: "Ethics Bowl 案例集与训练体系",
    meta_interest_label: "兴趣方向",
    meta_interest_value: "Debate · Ethics · Community",
    meta_tools_label: "工具控",
    meta_tools_value: "Notion · Automation · Research",
    tab_profile: "Profile",
    tab_labs: "Labs",
    tab_field: "Field",
    stack_title: "Current focus",
    stack_desc: "把复杂议题转化为可训练、可讨论、可复用的知识结构。",
    stack_link: "阅读文章",
    latest_label: "最新",
    latest_text: "China Ethics Bowl 落地尝试中",
    section_intro_label: "简介",
    section_intro_title: "个人简介",
    section_intro_lead: "三句话说明你在做什么、关心什么、产出什么。",
    section_publish_label: "发布",
    section_publish_title: "发布中心",
    section_publish_lead: "在页面内直接发布文章、视频与音乐推荐。",
    auth_label: "管理员",
    auth_title: "管理员登录",
    auth_lead: "输入管理员邮箱和密码即可登录。",
    auth_login: "登录",
    auth_logout: "退出登录",
    auth_status_guest: "未登录",
    auth_status_admin: "已登录（管理员）",
    auth_status_unavailable: "未配置登录",
    auth_email_label: "管理员邮箱",
    auth_email_placeholder: "admin@email.com",
    auth_password_label: "管理员密码",
    auth_password_placeholder: "******",
    auth_login_failed: "登录失败，请检查邮箱或密码。",
    auth_login_success: "登录成功。",
    publish_section_label: "选择板块",
    publish_section_articles: "文章分享",
    publish_section_rec_articles: "推荐文章",
    publish_section_rec_videos: "推荐视频",
    publish_section_music: "音乐分享",
    publish_title_label: "标题",
    publish_title_placeholder: "标题",
    publish_desc_label: "内容",
    publish_desc_placeholder: "一句话简介",
    publish_link_label: "链接",
    publish_link_placeholder: "https://",
    publish_tag_label: "标签",
    publish_tag_placeholder: "可选",
    publish_cover_url_label: "封面图 URL",
    publish_cover_url_placeholder: "https://",
    publish_cover_file_label: "上传封面",
    publish_submit: "发布",
    publish_update: "更新",
    publish_reset: "清空",
    publish_hint: "登录后发布内容会自动同步到 GitHub Pages。",
    publish_editing: "正在编辑：{title}",
    publish_saved: "已同步到 GitHub。",
    publish_error: "同步失败，请稍后再试。",
    publish_need_login: "请先登录管理员账户。",
    publish_cover_too_large: "封面文件过大，请小于 1.5MB。",
    publish_syncing: "检测到未同步内容，正在自动同步...",
    publish_confirm: "确认发布这条内容？",
    delete_confirm: "确认删除这条内容？",
    section_articles_label: "文章",
    section_articles_title: "文章分享",
    section_articles_lead: "选择性发布的阅读与研究片段。",
    section_rec_articles_label: "推荐",
    section_rec_articles_title: "推荐文章",
    section_rec_articles_lead: "我近期想分享给朋友的文章。",
    section_rec_videos_label: "推荐",
    section_rec_videos_title: "推荐视频",
    section_rec_videos_lead: "带来启发的讲座、纪录片或访谈。",
    section_music_label: "音乐",
    section_music_title: "音乐分享",
    section_music_lead: "写作、思考与放空时的声音库存。",
    section_contact_label: "联系",
    section_contact_title: "如果你正在做有趣的项目，我们可以聊聊。",
    section_contact_lead: "联系方式仅保留 Gmail 与 X。",
    contact_email: "发邮件",
    contact_copy: "复制邮箱",
    footer_left: "© 2026 Kling",
    footer_right: "以清晰与节奏制作。",
    action_read: "阅读",
    action_watch: "观看",
    action_delete: "删除",
    action_edit: "编辑",
    music_action: "播放",
    search_placeholder: "搜索文章 / 视频 / 音乐",
    search_hint: "输入关键词即可过滤",
    search_count: "匹配 {count} 条",
    search_empty: "暂无匹配结果。",
    bottom_article_link: "阅读 Cerdà 文章",
    section_toggle_open: "展开",
    section_toggle_close: "收起",
    empty_articles: "暂无内容，可在发布中心添加。",
    empty_rec_articles: "暂无推荐文章。",
    empty_rec_videos: "暂无推荐视频。",
    empty_music: "暂无音乐。",
    article_page_title: "Cerdà's Vision of Barcelona Today | Kling",
    article_label: "项目",
    article_title: "Cerdà's Vision of Barcelona Today",
    article_meta: "城市历史 · 5页 · 英文原文",
    article_intro: "简介：本文回顾 Cerdà 的扩展区规划理念，以及巴塞罗那当下的空间与社会张力。",
    article_text_label: "全文",
    article_back: "返回主页",
    article_fig_1: "Photo by Plan of the Eixample development in Barcelona (1859), by Ildefons Cerdà",
    article_fig_2: "Photo by Josep Lago/Getty Images",
    copy_success: "已复制",
  },
  en: {
    title: "Kling | Profile",
    status_online: "Online",
    nav_intro: "Intro",
    nav_search: "Search",
    nav_articles: "Articles",
    nav_rec_articles: "Recommended Articles",
    nav_rec_videos: "Recommended Videos",
    nav_music: "Music",
    nav_publish: "Publish",
    hero_pill_article: "Cerdà Article",
    hero_title: "I turn study, research, and projects into deliverables.",
    hero_lead:
      "Focused on education/public-good orgs, debate & ethics, and AI-enabled workflows (Notion/automation/productization).",
    hero_cta_work: "Articles",
    hero_cta_email: "Music",
    meta_now_label: "Now",
    meta_now_value: "Ethics Bowl casebook & training system",
    meta_interest_label: "Interests",
    meta_interest_value: "Debate · Ethics · Community",
    meta_tools_label: "Tools",
    meta_tools_value: "Notion · Automation · Research",
    tab_profile: "Profile",
    tab_labs: "Labs",
    tab_field: "Field",
    stack_title: "Current focus",
    stack_desc:
      "Turning complex issues into trainable, discussable, reusable knowledge structures.",
    stack_link: "Read article",
    latest_label: "Latest",
    latest_text: "Piloting China Ethics Bowl",
    section_intro_label: "Intro",
    section_intro_title: "Personal Intro",
    section_intro_lead: "Three lines on what you do, care about, and ship.",
    section_publish_label: "Publish",
    section_publish_title: "Publish Center",
    section_publish_lead: "Post articles, videos, and music directly on the page.",
    auth_label: "Admin",
    auth_title: "Admin Login",
    auth_lead: "Sign in with your admin email and password.",
    auth_login: "Login",
    auth_logout: "Log out",
    auth_status_guest: "Not signed in",
    auth_status_admin: "Signed in (admin)",
    auth_status_unavailable: "Login not configured",
    auth_email_label: "Admin email",
    auth_email_placeholder: "admin@email.com",
    auth_password_label: "Admin password",
    auth_password_placeholder: "******",
    auth_login_failed: "Login failed. Check email or password.",
    auth_login_success: "Login successful.",
    publish_section_label: "Section",
    publish_section_articles: "Articles",
    publish_section_rec_articles: "Recommended Articles",
    publish_section_rec_videos: "Recommended Videos",
    publish_section_music: "Music",
    publish_title_label: "Title",
    publish_title_placeholder: "Title",
    publish_desc_label: "Description",
    publish_desc_placeholder: "One-line summary",
    publish_link_label: "Link",
    publish_link_placeholder: "https://",
    publish_tag_label: "Tag",
    publish_tag_placeholder: "Optional",
    publish_cover_url_label: "Cover URL",
    publish_cover_url_placeholder: "https://",
    publish_cover_file_label: "Upload cover",
    publish_submit: "Publish",
    publish_update: "Update",
    publish_reset: "Reset",
    publish_hint: "Publishing will auto-sync to GitHub Pages.",
    publish_editing: "Editing: {title}",
    publish_saved: "Synced to GitHub.",
    publish_error: "Sync failed. Try again.",
    publish_need_login: "Please sign in as admin first.",
    publish_cover_too_large: "Cover file is too large. Please keep it under 1.5MB.",
    publish_syncing: "Unsynced content detected. Syncing now...",
    publish_confirm: "Publish this item?",
    delete_confirm: "Delete this item?",
    section_articles_label: "Articles",
    section_articles_title: "Article Share",
    section_articles_lead: "Selected reading and research excerpts.",
    section_rec_articles_label: "Recommended",
    section_rec_articles_title: "Recommended Articles",
    section_rec_articles_lead: "Articles I want to share recently.",
    section_rec_videos_label: "Recommended",
    section_rec_videos_title: "Recommended Videos",
    section_rec_videos_lead: "Talks, documentaries, and interviews that inspire.",
    section_music_label: "Music",
    section_music_title: "Music Share",
    section_music_lead: "Soundtracks for writing, thinking, and drifting.",
    section_contact_label: "Contact",
    section_contact_title: "If you're building something interesting, let's talk.",
    section_contact_lead: "Contact via Gmail and X only.",
    contact_email: "Email me",
    contact_copy: "Copy email",
    footer_left: "© 2026 Kling",
    footer_right: "Made with clarity & rhythm.",
    action_read: "Read",
    action_watch: "Watch",
    action_delete: "Delete",
    action_edit: "Edit",
    music_action: "Play",
    search_placeholder: "Search articles / videos / music",
    search_hint: "Type to filter",
    search_count: "{count} results",
    search_empty: "No results found.",
    bottom_article_link: "Read Cerdà article",
    section_toggle_open: "Expand",
    section_toggle_close: "Collapse",
    empty_articles: "No items yet. Add via Publish Center.",
    empty_rec_articles: "No recommended articles yet.",
    empty_rec_videos: "No recommended videos yet.",
    empty_music: "No music yet.",
    article_page_title: "Cerdà's Vision of Barcelona Today | Kling",
    article_label: "Project",
    article_title: "Cerdà's Vision of Barcelona Today",
    article_meta: "Urban history · 5 pages · Original English",
    article_intro: "Intro: Revisiting Cerdà's Eixample plan and the tensions visible in Barcelona today.",
    article_text_label: "Full text",
    article_back: "Back to home",
    article_fig_1: "Photo by Plan of the Eixample development in Barcelona (1859), by Ildefons Cerdà",
    article_fig_2: "Photo by Josep Lago/Getty Images",
    copy_success: "Copied",
  },
};

const themeLabels = {
  zh: { theme: "主题", light: "明亮", dark: "夜间" },
  en: { theme: "Theme", light: "Light", dark: "Dark" },
};

const sectionLists = {
  articles: document.querySelector('[data-section-list="articles"]'),
  recArticles: document.querySelector('[data-section-list="recArticles"]'),
  recVideos: document.querySelector('[data-section-list="recVideos"]'),
  music: document.querySelector('[data-section-list="music"]'),
};

const apiBase = getApiBase();
const apiEndpoints = apiBase
  ? {
      content: `${apiBase}/api/content`,
      login: `${apiBase}/api/auth/google`,
      session: `${apiBase}/api/auth/session`,
      logout: `${apiBase}/api/auth/logout`,
      passwordLogin: `${apiBase}/api/auth/password`,
    }
  : null;

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
const savedLang = localStorage.getItem("lang");
const browserLang = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
const initialLang = savedLang || browserLang;

function getDict() {
  return translations[currentLang] || translations.zh;
}

function getApiBase() {
  const meta = document.querySelector('meta[name="api-base"]');
  if (meta && meta.content.trim()) {
    return meta.content.trim().replace(/\/$/, "");
  }
  if (
    location.hostname.endsWith("vercel.app") ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
  ) {
    return location.origin;
  }
  return "";
}

function normalizeContent(data) {
  const normalized = { articles: [], recArticles: [], recVideos: [], music: [] };
  if (!data) return normalized;
  Object.keys(normalized).forEach((key) => {
    if (Array.isArray(data[key])) {
      normalized[key] = data[key].map((item) => normalizeItem(item));
    }
  });
  return normalized;
}

function normalizeItem(item) {
  if (!item) return { id: String(Date.now()) };
  const id = item.id ? String(item.id) : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return { ...item, id };
}

function saveBackup(data) {
  try {
    localStorage.setItem(
      CONTENT_BACKUP_KEY,
      JSON.stringify({ savedAt: Date.now(), data })
    );
  } catch (error) {
    // ignore storage errors
  }
}

function loadBackup() {
  const raw = localStorage.getItem(CONTENT_BACKUP_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    if (!payload || !payload.data) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

function clearBackup() {
  try {
    localStorage.removeItem(CONTENT_BACKUP_KEY);
  } catch (error) {
    // ignore
  }
}

function applyTranslations() {
  const dict = getDict();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    const value = dict[key];
    if (value !== undefined) {
      el.textContent = value;
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (!key) return;
    const value = dict[key];
    if (value !== undefined) {
      el.placeholder = value;
    }
  });
  const titleKey = document.documentElement.dataset.titleKey;
  if (titleKey && dict[titleKey]) {
    document.title = dict[titleKey];
  } else if (dict.title) {
    document.title = dict.title;
  }
  updateSectionToggleLabels();
  updatePublishButton();
  updateAuthUI();
  refreshSearchIndex();
  applySearchFilter();
  updateEmptyStates();
}

function renderThemeToggle() {
  if (!themeToggle) return;
  const dict = themeLabels[currentLang] || themeLabels.en;
  const label = currentTheme === "dark" ? dict.dark : dict.light;
  themeToggle.textContent = `${dict.theme}: ${label}`;
  themeToggle.setAttribute("aria-pressed", currentTheme === "dark");
}

function renderLangToggle() {
  if (!langToggle) return;
  langToggle.textContent = currentLang === "zh" ? "中文 / EN" : "EN / 中文";
  langToggle.setAttribute("aria-pressed", currentLang === "zh");
}

function setTheme(theme) {
  currentTheme = theme;
  root.setAttribute("data-theme", theme);
  renderThemeToggle();
  localStorage.setItem("theme", theme);
}

function setLang(lang) {
  currentLang = lang;
  root.setAttribute("data-lang", lang);
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
  applyTranslations();
  renderThemeToggle();
  renderLangToggle();
  localStorage.setItem("lang", lang);
}

function updateSectionToggleLabels() {
  const dict = getDict();
  document.querySelectorAll("[data-section-toggle]").forEach((btn) => {
    const id = btn.dataset.target;
    const collapsed = !!sectionState[id];
    btn.textContent = collapsed ? dict.section_toggle_open : dict.section_toggle_close;
  });
}

function setSectionCollapsed(id, collapsed, persist = true) {
  const body = document.querySelector(`[data-section-body="${id}"]`);
  if (body) {
    body.hidden = collapsed;
  }
  sectionState[id] = collapsed;
  if (persist) {
    localStorage.setItem(SECTION_STATE_KEY, JSON.stringify(sectionState));
  }
  updateSectionToggleLabels();
}

function initSections() {
  document.querySelectorAll("[data-section-toggle]").forEach((btn) => {
    const id = btn.dataset.target;
    if (sectionState[id] === undefined) {
      sectionState[id] = false;
    }
    setSectionCollapsed(id, sectionState[id], false);
    btn.addEventListener("click", () => {
      setSectionCollapsed(id, !sectionState[id]);
    });
  });
  localStorage.setItem(SECTION_STATE_KEY, JSON.stringify(sectionState));
}

function buildItemSearchText(item, sectionKey) {
  const dict = getDict();
  const sectionLabelKey =
    sectionKey === "articles"
      ? dict.section_articles_title
      : sectionKey === "recArticles"
        ? dict.section_rec_articles_title
        : sectionKey === "recVideos"
          ? dict.section_rec_videos_title
          : dict.section_music_title;
  const parts = [
    item.title,
    item.desc,
    item.tag,
    sectionLabelKey,
    Array.isArray(item.meta) ? item.meta.join(" ") : "",
  ];
  return parts
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function refreshSearchIndex() {
  document.querySelectorAll("[data-searchable]").forEach((el) => {
    if (!el.dataset.searchText) {
      el.dataset.searchText = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    }
  });
}

function applySearchFilter() {
  if (!searchInput) return;
  const query = searchInput.value.trim().toLowerCase();
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];
  let visible = 0;
  document.querySelectorAll("[data-searchable]").forEach((el) => {
    const text = el.dataset.searchText || "";
    const match = tokens.length === 0 || tokens.every((token) => text.includes(token));
    el.style.display = match ? "" : "none";
    if (match) visible += 1;
  });
  if (searchEmpty) {
    searchEmpty.style.display = query && visible === 0 ? "block" : "none";
  }
  if (searchCount) {
    const dict = getDict();
    const template = dict.search_count || "{count}";
    searchCount.textContent = template.replace("{count}", String(visible));
  }
  updateEmptyStates();
}

function createActionLink(sectionKey, link) {
  const a = document.createElement("a");
  a.className = "btn ghost";
  a.href = link || "#";
  if (link) {
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    a.classList.add("is-disabled");
    a.setAttribute("aria-disabled", "true");
    a.addEventListener("click", (event) => event.preventDefault());
  }
  const key =
    sectionKey === "music" ? "music_action" : sectionKey === "recVideos" ? "action_watch" : "action_read";
  a.dataset.i18n = key;
  a.textContent = getDict()[key] || "Open";
  return a;
}

function createEditButton(sectionKey, itemId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost";
  button.dataset.i18n = "action_edit";
  button.dataset.editItem = "true";
  button.dataset.section = sectionKey;
  button.dataset.itemId = String(itemId);
  button.textContent = getDict().action_edit || "Edit";
  return button;
}

function createDeleteButton(sectionKey, itemId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost";
  button.dataset.i18n = "action_delete";
  button.dataset.deleteItem = "true";
  button.dataset.section = sectionKey;
  button.dataset.itemId = String(itemId);
  button.textContent = getDict().action_delete || "Delete";
  return button;
}

function createCardElement(item, sectionKey) {
  const isMusic = sectionKey === "music";
  const card = document.createElement("article");
  card.className = `${isMusic ? "music-card" : "card stack"} content-card searchable-card`;
  card.dataset.searchable = "true";
  card.dataset.itemId = String(item.id || "");
  card.dataset.section = sectionKey;
  card.dataset.searchText = buildItemSearchText(item, sectionKey);

  if (item.cover) {
    const cover = document.createElement("img");
    cover.className = "card-cover";
    cover.src = item.cover;
    cover.alt = item.title || "Cover";
    cover.loading = "lazy";
    card.appendChild(cover);
  }

  if (isMusic) {
    const top = document.createElement("div");
    top.className = "music-top";
    const title = document.createElement("h3");
    title.textContent = item.title;
    top.appendChild(title);
    if (item.tag) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = item.tag;
      top.appendChild(badge);
    }
    card.appendChild(top);

    const desc = document.createElement("p");
    desc.textContent = item.desc;
    card.appendChild(desc);

    const meta = document.createElement("div");
    meta.className = "music-meta";
    const tag = document.createElement("span");
    tag.textContent = item.tag || "";
    meta.appendChild(tag);
    meta.appendChild(createActionLink(sectionKey, item.link));
    if (authState.admin) {
      meta.appendChild(createEditButton(sectionKey, item.id));
      meta.appendChild(createDeleteButton(sectionKey, item.id));
    }
    card.appendChild(meta);
    return card;
  }

  const top = document.createElement("div");
  top.className = "card-top";
  const title = document.createElement("h3");
  title.textContent = item.title;
  top.appendChild(title);
  if (item.tag) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = item.tag;
    top.appendChild(badge);
  }
  card.appendChild(top);

  const desc = document.createElement("p");
  desc.textContent = item.desc;
  card.appendChild(desc);

  if (Array.isArray(item.meta)) {
    item.meta.forEach((line) => {
      const metaLine = document.createElement("p");
      metaLine.className = "meta";
      metaLine.textContent = line;
      card.appendChild(metaLine);
    });
  }

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.appendChild(createActionLink(sectionKey, item.link));
  if (authState.admin) {
    actions.appendChild(createEditButton(sectionKey, item.id));
    actions.appendChild(createDeleteButton(sectionKey, item.id));
  }
  card.appendChild(actions);
  return card;
}

function clearLists() {
  Object.values(sectionLists).forEach((list) => {
    if (list) list.innerHTML = "";
  });
}

function renderContent() {
  clearLists();
  Object.keys(sectionLists).forEach((key) => {
    const list = sectionLists[key];
    if (!list) return;
    const items = contentState[key] || [];
    items.forEach((item) => {
      list.appendChild(createCardElement(normalizeItem(item), key));
    });
  });
  updateEmptyStates();
  refreshSearchIndex();
  applySearchFilter();
}

function updateEmptyStates() {
  document.querySelectorAll("[data-empty-for]").forEach((el) => {
    const key = el.dataset.emptyFor;
    const list = document.querySelector(`[data-section-list="${key}"]`);
    if (!list) return;
    const cards = Array.from(list.querySelectorAll("[data-searchable]"));
    const visible = cards.some((card) => card.style.display !== "none");
    el.style.display = visible ? "none" : "block";
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function setPublishStatus(message, tone, persist = false) {
  if (!publishStatus) return;
  publishStatus.textContent = message || "";
  publishStatus.classList.remove("is-error", "is-success");
  if (tone === "error") publishStatus.classList.add("is-error");
  if (tone === "success") publishStatus.classList.add("is-success");
  if (!persist && message) {
    setTimeout(() => {
      publishStatus.textContent = "";
      publishStatus.classList.remove("is-error", "is-success");
    }, 2400);
  }
}

function updatePublishButton() {
  if (!publishForm) return;
  const submitBtn = publishForm.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  const dict = getDict();
  submitBtn.textContent = editState ? dict.publish_update : dict.publish_submit;
  if (editState && dict.publish_editing) {
    setPublishStatus(dict.publish_editing.replace("{title}", editState.title || ""), null, true);
  }
}

function setEditState(item, sectionKey) {
  editState = item
    ? {
        id: String(item.id),
        section: sectionKey,
        title: item.title,
      }
    : null;
  updatePublishButton();
  if (!item) {
    setPublishStatus("", null, false);
  }
}

function updateAuthUI() {
  if (!authStatus) return;
  const dict = getDict();
  if (!authState.available) {
    authStatus.textContent = dict.auth_status_unavailable;
    if (loginBtn) loginBtn.disabled = false;
    if (logoutBtn) logoutBtn.hidden = true;
    adminOnlyEls.forEach((el) => (el.hidden = true));
    return;
  }
  authStatus.textContent = authState.admin ? dict.auth_status_admin : dict.auth_status_guest;
  if (authEmail) {
    authEmail.textContent = authState.email || "";
  }
  if (loginBtn) loginBtn.hidden = authState.admin;
  if (logoutBtn) logoutBtn.hidden = !authState.admin;
  if (authForm) {
    authForm.querySelectorAll("input").forEach((input) => {
      input.disabled = authState.admin;
    });
  }
  adminOnlyEls.forEach((el) => (el.hidden = !authState.admin));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loginWithPassword(email, password) {
  if (!apiEndpoints?.passwordLogin) {
    throw new Error("Login not configured");
  }
  const response = await fetch(apiEndpoints.passwordLogin, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
}

async function loadContent() {
  let data = null;
  if (apiEndpoints) {
    try {
      data = await fetchJson(apiEndpoints.content, { credentials: "include" });
    } catch (error) {
      data = null;
    }
  }
  if (!data) {
    try {
      const response = await fetch(`${CONTENT_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (response.ok) {
        data = await response.json();
      }
    } catch (error) {
      data = null;
    }
  }
  contentState = normalizeContent(data || DEFAULT_CONTENT);
}

async function saveContent(nextContent) {
  if (!apiEndpoints) {
    throw new Error("API not configured");
  }
  const response = await fetch(apiEndpoints.content, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nextContent),
  });
  if (!response.ok) {
    throw new Error("Failed to save content");
  }
  return response.json();
}

function buildItemFromForm(formData, existing) {
  const title = String(formData.get("title") || "").trim();
  const desc = String(formData.get("desc") || "").trim();
  const link = String(formData.get("link") || "").trim();
  const tag = String(formData.get("tag") || "").trim();
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const item = {
    id: existing?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    desc,
    link,
    tag,
    cover: coverUrl,
    meta: existing?.meta || [],
  };
  if (existing && !tag) {
    item.tag = existing.tag || "";
  }
  if (existing && !coverUrl) {
    item.cover = existing.cover || "";
  }
  return item;
}

async function syncContentUpdate(nextContent) {
  const dict = getDict();
  try {
    const saved = await saveContent(nextContent);
    contentState = normalizeContent(saved);
    renderContent();
    setEditState(null, null);
    setPublishStatus(dict.publish_saved, "success");
    clearBackup();
  } catch (error) {
    contentState = normalizeContent(nextContent);
    renderContent();
    setPublishStatus(dict.publish_error, "error");
    saveBackup(nextContent);
  }
}

async function initAuth() {
  if (!apiEndpoints) {
    authState = { available: false, admin: false, email: "" };
    updateAuthUI();
    return;
  }
  authState.available = true;
  try {
    const session = await fetchJson(apiEndpoints.session, { credentials: "include" });
    authState.admin = !!session.admin;
    authState.email = session.email || "";
  } catch (error) {
    authState.admin = false;
    authState.email = "";
  }
  updateAuthUI();
  renderContent();

  if (authState.admin && !backupSyncAttempted) {
    backupSyncAttempted = true;
    const backup = loadBackup();
    if (backup && backup.data) {
      const dict = getDict();
      setPublishStatus(dict.publish_syncing || "Syncing...", null, true);
      try {
        const saved = await saveContent(backup.data);
        contentState = normalizeContent(saved);
        renderContent();
        clearBackup();
        setPublishStatus(dict.publish_saved, "success");
      } catch (error) {
        setPublishStatus(dict.publish_error, "error");
      }
    }
  }
}

async function init() {
  setLang(initialLang);
  setTheme(initialTheme);
  initSections();
  await loadContent();
  renderContent();
  await initAuth();
}

init();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    setTheme(next);
  });
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const next = currentLang === "zh" ? "en" : "zh";
    setLang(next);
  });
}

if (copyBtn) {
  const email = copyBtn.dataset.email || "";
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      const dict = getDict();
      copyBtn.textContent = dict.copy_success;
      setTimeout(() => {
        copyBtn.textContent = getDict().contact_copy;
      }, 1600);
    } catch (error) {
      window.location.href = `mailto:${email}`;
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const dict = getDict();
    if (!apiEndpoints) {
      setPublishStatus(dict.auth_status_unavailable, "error");
      return;
    }
    const formData = new FormData(authForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || !password) return;
    try {
      await loginWithPassword(email, password);
      await initAuth();
      setPublishStatus(dict.auth_login_success, "success");
      authForm.reset();
    } catch (error) {
      setPublishStatus(dict.auth_login_failed, "error");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (!apiEndpoints) return;
    try {
      await fetch(apiEndpoints.logout, { method: "POST", credentials: "include" });
    } catch (error) {
      // ignore
    }
    authState.admin = false;
    authState.email = "";
    updateAuthUI();
    renderContent();
  });
}

if (publishForm) {
  publishForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const dict = getDict();
    if (!authState.admin) {
      setPublishStatus(dict.publish_need_login, "error");
      return;
    }

    const formData = new FormData(publishForm);
    const section = String(formData.get("section") || "");
    const title = String(formData.get("title") || "").trim();
    const desc = String(formData.get("desc") || "").trim();
    const link = String(formData.get("link") || "").trim();

    if (!section || !title || !desc || !link) return;
    if (!window.confirm(dict.publish_confirm || "Confirm publish?")) return;

    const coverFile = publishForm.querySelector('input[name="coverFile"]').files[0];
    let coverDataUrl = "";
    if (coverFile) {
      if (coverFile.size > 1024 * 1024 * 1.5) {
        setPublishStatus(dict.publish_cover_too_large, "error");
        return;
      }
      try {
        coverDataUrl = await readFileAsDataURL(coverFile);
      } catch (error) {
        coverDataUrl = "";
      }
    }

    const existingItems = contentState[section] || [];
    const existing = editState
      ? existingItems.find((item) => String(item.id) === String(editState.id))
      : null;
    const item = buildItemFromForm(formData, existing);
    if (coverDataUrl) {
      item.cover = coverDataUrl;
    }

    let nextContent = { ...contentState };
    nextContent[section] = [...existingItems];

    if (existing) {
      nextContent[section] = nextContent[section].map((entry) =>
        String(entry.id) === String(existing.id) ? item : entry
      );
    } else {
      nextContent[section].unshift(item);
    }

    publishForm.reset();
    setEditState(null, null);
    await syncContentUpdate(nextContent);
  });
}

if (resetFormBtn && publishForm) {
  resetFormBtn.addEventListener("click", () => {
    publishForm.reset();
    setEditState(null, null);
  });
}

if (document.body) {
  document.body.addEventListener("click", async (event) => {
    const editBtn = event.target.closest("[data-edit-item]");
    if (editBtn) {
      const sectionKey = editBtn.dataset.section;
      const itemId = editBtn.dataset.itemId;
      const list = contentState[sectionKey] || [];
      const item = list.find((entry) => String(entry.id) === String(itemId));
      if (!item || !publishForm) return;

      publishForm.querySelector('select[name="section"]').value = sectionKey;
      publishForm.querySelector('input[name="title"]').value = item.title || "";
      publishForm.querySelector('textarea[name="desc"]').value = item.desc || "";
      publishForm.querySelector('input[name="link"]').value = item.link || "";
      publishForm.querySelector('input[name="tag"]').value = item.tag || "";
      publishForm.querySelector('input[name="coverUrl"]').value = item.cover || "";

      setEditState(item, sectionKey);
      publishForm.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const deleteBtn = event.target.closest("[data-delete-item]");
    if (!deleteBtn) return;
    if (!authState.admin) return;
    if (!window.confirm(getDict().delete_confirm || "Confirm delete?")) return;

    const sectionKey = deleteBtn.dataset.section;
    const itemId = deleteBtn.dataset.itemId;
    const list = contentState[sectionKey] || [];
    const nextList = list.filter((item) => String(item.id) !== String(itemId));
    const nextContent = { ...contentState, [sectionKey]: nextList };
    await syncContentUpdate(nextContent);
  });
}

if (revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
