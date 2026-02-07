const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const langToggle = document.querySelector("[data-lang-toggle]");
const copyBtn = document.querySelector("[data-copy]");
const revealItems = document.querySelectorAll("[data-reveal]");
const searchInput = document.querySelector("[data-search]");
const searchEmpty = document.querySelector("[data-search-empty]");
const publishForm = document.querySelector("[data-publish-form]");
const resetFormBtn = document.querySelector("[data-reset-form]");

const STORAGE_KEY = "userContent";
const SECTION_STATE_KEY = "sectionState";

const translations = {
  zh: {
    title: "Kling | 个人介绍",
    status_online: "在线",
    nav_intro: "简介",
    nav_articles: "文章",
    nav_rec_articles: "推荐文章",
    nav_rec_videos: "推荐视频",
    nav_music: "音乐",
    nav_publish: "发布",
    hero_title: "我把学习、研究与项目做成可交付的作品。",
    hero_lead:
      "聚焦教育/公益组织、辩论与伦理讨论，以及 AI 工具化工作流（Notion/自动化/产品化）。",
    hero_cta_work: "文章分享",
    hero_cta_email: "音乐分享",
    meta_now_label: "现在在做",
    meta_now_value: "Ethics Bowl 案例集与训练体系",
    meta_interest_label: "兴趣方向",
    meta_interest_value: "Debate · Ethics · Community",
    meta_tools_label: "工具控",
    meta_tools_value: "Notion · Automation · Research",
    tab_profile: "简介",
    tab_labs: "实验",
    tab_field: "实地",
    stack_title: "现在的重点",
    stack_desc: "把复杂议题整理成可训练、可讨论、可复用的知识结构。",
    latest_label: "最新",
    latest_text: "China Ethics Bowl 落地尝试中",
    section_intro_label: "简介",
    section_intro_title: "个人简介",
    section_intro_lead: "三句话说明你在做什么、关心什么、产出什么。",
    section_publish_label: "发布",
    section_publish_title: "发布中心",
    section_publish_lead: "在页面内直接发布文章、视频与音乐推荐。",
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
    publish_reset: "清空",
    publish_hint: "内容仅保存在本地浏览器。",
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
    proj4_title: "Cerdà's Vision of Barcelona Today",
    proj4_badge: "城市研究",
    proj4_desc: "关于 19 世纪 Eixample 规划与当代城市问题的短文。",
    proj4_meta1: "简介：回顾 Cerdà 规划理念及其在今日的张力。",
    proj4_meta2: "形式：在线阅读文章（非 PDF）。",
    music1_title: "深夜专注",
    music1_badge: "歌单",
    music1_desc: "安静、有结构的氛围音，适合深度阅读。",
    music1_meta: "Ambient · Minimal",
    music2_title: "城市漫步",
    music2_badge: "合集",
    music2_desc: "有一点律动的城市漫步配乐。",
    music2_meta: "Electronic · Jazz",
    music3_title: "写作循环",
    music3_badge: "循环",
    music3_desc: "写作时反复循环的小段落。",
    music3_meta: "Piano · Strings",
    music_action: "试听",
    section_contact_label: "联系",
    section_contact_title: "如果你正在做有趣的项目，我们可以聊聊。",
    section_contact_lead: "联系方式仅保留 Gmail 与 X。",
    contact_email: "发邮件",
    contact_copy: "复制邮箱",
    footer_left: "© 2026 Kling",
    footer_right: "以清晰与节奏制作。",
    action_read: "阅读",
    action_watch: "观看",
    search_placeholder: "搜索文章 / 视频 / 音乐",
    search_hint: "输入关键词即可过滤",
    search_empty: "暂无匹配结果。",
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
    article_intro:
      "简介：本文回顾 Cerdà 的扩展区规划理念，以及巴塞罗那当下的空间与社会张力。",
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
    nav_articles: "Articles",
    nav_rec_articles: "Recommended Articles",
    nav_rec_videos: "Recommended Videos",
    nav_music: "Music",
    nav_publish: "Publish",
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
    stack_desc: "Turning complex issues into trainable, discussable, reusable knowledge structures.",
    latest_label: "Latest",
    latest_text: "Piloting China Ethics Bowl",
    section_intro_label: "Intro",
    section_intro_title: "Personal Intro",
    section_intro_lead: "Three lines on what you do, care about, and ship.",
    section_publish_label: "Publish",
    section_publish_title: "Publish Center",
    section_publish_lead: "Post articles, videos, and music directly on the page.",
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
    publish_reset: "Reset",
    publish_hint: "Items are stored locally in this browser.",
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
    proj4_title: "Cerdà's Vision of Barcelona Today",
    proj4_badge: "Urban Study",
    proj4_desc: "A short essay on the 19th-century Eixample plan and today's urban tensions.",
    proj4_meta1: "Intro: Revisiting Cerdà's planning logic and its present-day frictions.",
    proj4_meta2: "Format: Online reading page (not a PDF).",
    music1_title: "Late Night Focus",
    music1_badge: "Playlist",
    music1_desc: "Quiet, structured ambience for deep reading.",
    music1_meta: "Ambient · Minimal",
    music2_title: "City Walk",
    music2_badge: "Set",
    music2_desc: "A little groove for urban strolls.",
    music2_meta: "Electronic · Jazz",
    music3_title: "Storywriting",
    music3_badge: "Loop",
    music3_desc: "Short loops I repeat while writing.",
    music3_meta: "Piano · Strings",
    music_action: "Listen",
    section_contact_label: "Contact",
    section_contact_title: "If you're building something interesting, let's talk.",
    section_contact_lead: "Contact via Gmail and X only.",
    contact_email: "Email me",
    contact_copy: "Copy email",
    footer_left: "© 2026 Kling",
    footer_right: "Made with clarity & rhythm.",
    action_read: "Read",
    action_watch: "Watch",
    search_placeholder: "Search articles / videos / music",
    search_hint: "Type to filter",
    search_empty: "No results found.",
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
    article_intro:
      "Intro: Revisiting Cerdà's Eixample plan and the tensions visible in Barcelona today.",
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

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
const savedLang = localStorage.getItem("lang");
const browserLang = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
const initialLang = savedLang || browserLang;

let currentTheme = initialTheme;
let currentLang = initialLang;
let sectionState = JSON.parse(localStorage.getItem(SECTION_STATE_KEY) || "{}");

const sectionLists = {
  articles: document.querySelector('[data-section-list="articles"]'),
  recArticles: document.querySelector('[data-section-list="recArticles"]'),
  recVideos: document.querySelector('[data-section-list="recVideos"]'),
  music: document.querySelector('[data-section-list="music"]'),
};

function applyTranslations() {
  const dict = translations[currentLang] || translations.zh;
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
  const dict = translations[currentLang] || translations.zh;
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

function buildSearchText(el) {
  return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function refreshSearchIndex() {
  document.querySelectorAll("[data-searchable]").forEach((el) => {
    el.dataset.searchText = buildSearchText(el);
  });
}

function applySearchFilter() {
  if (!searchInput) return;
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll("[data-searchable]").forEach((el) => {
    const text = el.dataset.searchText || buildSearchText(el);
    const match = !query || text.includes(query);
    el.style.display = match ? "" : "none";
    if (match) visible += 1;
  });
  if (searchEmpty) {
    searchEmpty.style.display = query && visible === 0 ? "block" : "none";
  }
}

function loadUserContent() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { articles: [], recArticles: [], recVideos: [], music: [] };
  }
  try {
    const data = JSON.parse(raw);
    return {
      articles: data.articles || [],
      recArticles: data.recArticles || [],
      recVideos: data.recVideos || [],
      music: data.music || [],
    };
  } catch (error) {
    return { articles: [], recArticles: [], recVideos: [], music: [] };
  }
}

function saveUserContent(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  const key = sectionKey === "music" ? "music_action" : sectionKey === "recVideos" ? "action_watch" : "action_read";
  a.dataset.i18n = key;
  const dict = translations[currentLang] || translations.zh;
  a.textContent = dict[key] || "Open";
  return a;
}

function createCardElement(item, sectionKey) {
  const isMusic = sectionKey === "music";
  const card = document.createElement("article");
  card.className = `${isMusic ? "music-card" : "card stack"} content-card searchable-card`;
  card.dataset.searchable = "true";
  card.dataset.searchText = `${item.title} ${item.desc} ${item.tag || ""}`.toLowerCase();

  if (item.cover) {
    const cover = document.createElement("div");
    cover.className = "card-cover";
    cover.style.backgroundImage = `url('${item.cover}')`;
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

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.appendChild(createActionLink(sectionKey, item.link));
  card.appendChild(actions);
  return card;
}

function renderUserContent() {
  const data = loadUserContent();
  Object.keys(sectionLists).forEach((key) => {
    const list = sectionLists[key];
    if (!list) return;
    data[key].forEach((item) => {
      list.appendChild(createCardElement(item, key));
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
    const hasCards = list.querySelectorAll(".content-card").length > 0;
    el.style.display = hasCards ? "none" : "block";
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

setLang(initialLang);
setTheme(initialTheme);
initSections();
renderUserContent();

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
      const dict = translations[currentLang] || translations.en;
      copyBtn.textContent = dict.copy_success;
      setTimeout(() => {
        const latest = translations[currentLang] || translations.en;
        copyBtn.textContent = latest.contact_copy;
      }, 1600);
    } catch (error) {
      window.location.href = `mailto:${email}`;
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

if (publishForm) {
  publishForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(publishForm);
    const section = String(formData.get("section") || "");
    const title = String(formData.get("title") || "").trim();
    const desc = String(formData.get("desc") || "").trim();
    const link = String(formData.get("link") || "").trim();
    const tag = String(formData.get("tag") || "").trim();
    const coverUrl = String(formData.get("coverUrl") || "").trim();
    const coverFile = publishForm.querySelector('input[name="coverFile"]').files[0];

    if (!section || !title || !desc || !link) return;

    let cover = coverUrl;
    if (coverFile) {
      try {
        cover = await readFileAsDataURL(coverFile);
      } catch (error) {
        cover = coverUrl;
      }
    }

    const item = {
      id: Date.now(),
      title,
      desc,
      link,
      tag,
      cover,
    };

    const data = loadUserContent();
    data[section] = data[section] || [];
    data[section].unshift(item);
    saveUserContent(data);

    const list = sectionLists[section];
    if (list) {
      const card = createCardElement(item, section);
      list.prepend(card);
    }

    publishForm.reset();
    updateEmptyStates();
    refreshSearchIndex();
    applySearchFilter();
    applyTranslations();
  });
}

if (resetFormBtn && publishForm) {
  resetFormBtn.addEventListener("click", () => publishForm.reset());
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
