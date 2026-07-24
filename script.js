// ── 분야별 RSS 피드 설정 (ScienceDaily 공개 RSS) ─────────────────────
const CATEGORIES = {
  all:      { label: "전체",      emoji: "🧭", feed: "https://www.sciencedaily.com/rss/top/science.xml",
              home: "https://www.sciencedaily.com/news/top/science/" },
  physics:  { label: "물리학",    emoji: "⚛️", feed: "https://www.sciencedaily.com/rss/matter_energy/physics.xml",
              home: "https://www.sciencedaily.com/news/matter_energy/physics/" },
  chemistry:{ label: "화학",      emoji: "🧪", feed: "https://www.sciencedaily.com/rss/matter_energy/chemistry.xml",
              home: "https://www.sciencedaily.com/news/matter_energy/chemistry/" },
  earth:    { label: "지구과학",  emoji: "🌍", feed: "https://www.sciencedaily.com/rss/earth_climate/earth_science.xml",
              home: "https://www.sciencedaily.com/news/earth_climate/earth_science/" },
  biology:  { label: "생명과학",  emoji: "🧬", feed: "https://www.sciencedaily.com/rss/plants_animals/biology.xml",
              home: "https://www.sciencedaily.com/news/plants_animals/biology/" },
  ai:       { label: "AI·컴퓨터", emoji: "🤖", feed: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
              home: "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/" }
};

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const ALLORIGINS = "https://api.allorigins.win/raw?url=";
const CACHE_TTL_MS = 20 * 60 * 1000; // 20분 캐시
const FETCH_TIMEOUT_MS = 12000;

// "전체" 탭 기사의 분야 배지를 추정하기 위한 키워드
const CATEGORY_GUESS = [
  { key: "physics", pattern: /physic|quantum|particle|laser|photon|relativ/i },
  { key: "chemistry", pattern: /chemi|molecul|reaction|compound|cataly|polymer/i },
  { key: "earth", pattern: /climate|earthquake|volcano|ocean|atmospher|geolog|weather|glacier/i },
  { key: "biology", pattern: /biolog|gene|cell |species|plant|animal|virus|protein|dna|ecosystem/i },
  { key: "ai", pattern: /artificial intelligence|\bai\b|algorithm|computer|robot|software|machine learning|neural network/i }
];

// 분야별 기본(일반) 탐구주제 템플릿 — {title} 은 기사 제목으로 치환
const GENERIC_TEMPLATES = {
  physics: [
    "'{title}' 기사에서 소개된 물리 현상의 원리를 교과 개념과 연결지어 설명하고, 관련 최신 연구 동향을 조사해보자.",
    "이 기사에 등장하는 현상을 간단한 실험이나 시뮬레이션으로 재현해보는 탐구 계획을 세우고 예상 결과를 예측해보자.",
    "해당 연구가 에너지·반도체·우주 기술 등 실생활 응용 분야에 어떻게 활용될 수 있는지 조사해보자."
  ],
  chemistry: [
    "'{title}'에서 다룬 물질·반응의 특성을 조사하고, 결합·반응속도 등 교과 개념과 연결지어 정리해보자.",
    "해당 연구에서 사용된 실험·분석 기법을 조사하고, 학교에서 수행 가능한 유사 실험을 설계해보자.",
    "이 기술이 신소재·에너지·환경 분야에 미치는 영향을 조사해보자."
  ],
  earth: [
    "'{title}' 기사에서 다룬 지구과학적 현상의 발생 원리를 조사하고, 관련 관측 자료를 분석해보자.",
    "이 현상이 기후변화·환경 문제와 어떤 관련이 있는지 조사하고 대응 방안을 탐구해보자.",
    "관련 위성·관측 데이터를 찾아 시각화하고 변화 추이를 분석하는 탐구를 진행해보자."
  ],
  biology: [
    "'{title}'에서 소개된 생명현상·연구 결과의 생물학적 원리를 조사하고 교과 개념과 연결지어 설명해보자.",
    "해당 연구가 의학·생명공학·생태계에 미치는 영향을 조사하고 발표 자료를 만들어보자.",
    "관련 논문을 찾아 연구 방법과 결과를 요약하고, 후속 탐구 아이디어를 제안해보자."
  ],
  ai: [
    "'{title}' 기사에서 다룬 기술의 작동 원리(알고리즘, 데이터 처리 방식 등)를 조사하고 정리해보자.",
    "이 기술이 사회·산업·윤리적 측면에 미치는 영향을 조사하고 찬반 토론 자료를 만들어보자.",
    "관련 개념을 간단한 프로그램이나 데이터 분석 실습으로 직접 구현해보는 탐구 활동을 계획해보자."
  ]
};

// 기사 본문 키워드에 따라 추가되는 좀 더 구체적인 템플릿
const KEYWORD_TEMPLATES = [
  { pattern: /quantum/i, template: "기사에 언급된 '양자(quantum)' 개념이 어떤 원리로 작동하는지 조사하고, 양자중첩·얽힘 등 기초 이론과 연결지어 설명해보자." },
  { pattern: /climate|warming|carbon/i, template: "이 기사와 관련된 기후변화 데이터를 찾아 그래프로 정리하고, 원인과 대응 방안을 탐구해보자." },
  { pattern: /cancer|tumor|\bdisease\b/i, template: "해당 연구가 질병의 진단·치료에 어떻게 기여할 수 있는지 조사하고, 관련 최신 치료 기술 동향을 정리해보자." },
  { pattern: /\bgene\b|genetic|\bdna\b/i, template: "기사에서 다룬 유전자·DNA 관련 개념을 조사하고, 유전 정보가 생명현상에 미치는 영향을 탐구해보자." },
  { pattern: /artificial intelligence|\bai\b|machine learning|neural network/i, template: "이 기사에서 소개된 AI 기술의 학습 방식(머신러닝/딥러닝)을 조사하고, 실생활 적용 사례를 추가로 조사해보자." },
  { pattern: /space|galaxy|planet|nasa|astronom/i, template: "기사에서 다룬 천체·우주 현상의 관측 방법과 원리를 조사하고, 관련 최신 우주 탐사 소식을 함께 정리해보자." },
  { pattern: /battery|solar cell|energy storage/i, template: "해당 에너지 기술(배터리·태양전지 등)의 원리를 조사하고, 에너지 효율 문제와 연결지어 탐구해보자." },
  { pattern: /material|nanotechnology|\bnano\b/i, template: "기사에서 소개된 신소재의 특성과 제작 원리를 조사하고, 기존 소재와 비교 분석해보자." },
  { pattern: /\brobot/i, template: "기사에서 다룬 로봇 기술의 원리와 활용 분야를 조사하고, 관련 윤리적 이슈도 함께 탐구해보자." },
  { pattern: /earthquake|volcano|tsunami/i, template: "기사에서 다룬 지질 현상의 발생 원리를 조사하고, 관련 방재 대책을 탐구해보자." }
];

const state = {
  current: "all",
  itemsByCategory: {}
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function guessCategory(text) {
  for (const g of CATEGORY_GUESS) {
    if (g.pattern.test(text)) return g.key;
  }
  return null;
}

function buildTopics(article, fallbackCategoryKey) {
  const text = `${article.title} ${article.description || ""}`;
  const catKey = fallbackCategoryKey === "all" ? (guessCategory(text) || "ai") : fallbackCategoryKey;

  const specific = KEYWORD_TEMPLATES.filter(k => k.pattern.test(text)).slice(0, 2).map(k => k.template);
  const generic = GENERIC_TEMPLATES[catKey] || GENERIC_TEMPLATES.ai;

  const combined = [...specific];
  for (const g of generic) {
    if (combined.length >= 3) break;
    combined.push(g);
  }

  return combined.slice(0, 3).map(t => t.replaceAll("{title}", article.title));
}

function stripTags(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.slice(0, len).trim() + "…";
}

function formatDate(pubDate) {
  try {
    const d = new Date(pubDate.replace(" ", "T"));
    if (isNaN(d.getTime())) return pubDate;
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return pubDate;
  }
}

function cacheKey(catKey) { return `news_cache_${catKey}`; }

function readCache(catKey) {
  try {
    const raw = localStorage.getItem(cacheKey(catKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function writeCache(catKey, items) {
  try {
    localStorage.setItem(cacheKey(catKey), JSON.stringify({ ts: Date.now(), items }));
  } catch {
    // localStorage 사용 불가 시 캐시 생략
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseRssXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("XML 파싱 오류");
  return Array.from(doc.querySelectorAll("item")).map(item => ({
    title: item.querySelector("title")?.textContent || "",
    link: item.querySelector("link")?.textContent || "",
    pubDate: item.querySelector("pubDate")?.textContent || "",
    description: item.querySelector("description")?.textContent || ""
  }));
}

// 1차: rss2json (빠르고 정제된 JSON 응답)
async function fetchViaRss2Json(feedUrl) {
  const res = await fetchWithTimeout(RSS2JSON + encodeURIComponent(feedUrl));
  if (!res.ok) throw new Error(`rss2json HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== "ok") throw new Error(data.message || "rss2json 오류");
  return data.items;
}

// 2차 대안: allorigins로 원본 RSS XML을 가져와 직접 파싱 (rss2json이 차단/장애일 때 대비)
async function fetchViaAllOrigins(feedUrl) {
  const res = await fetchWithTimeout(ALLORIGINS + encodeURIComponent(feedUrl));
  if (!res.ok) throw new Error(`allorigins HTTP ${res.status}`);
  const text = await res.text();
  return parseRssXml(text);
}

async function fetchCategory(catKey, { force = false } = {}) {
  if (!force) {
    const cached = readCache(catKey);
    if (cached) return { items: cached, fromCache: true };
  }

  const cfg = CATEGORIES[catKey];
  let rawItems;
  let lastErr;

  try {
    rawItems = await fetchViaRss2Json(cfg.feed);
  } catch (e1) {
    lastErr = e1;
    try {
      rawItems = await fetchViaAllOrigins(cfg.feed);
    } catch (e2) {
      lastErr = e2;
    }
  }

  if (!rawItems) throw lastErr || new Error("알 수 없는 오류");

  const items = rawItems.slice(0, 15).map(it => ({
    title: stripTags(it.title),
    link: it.link,
    pubDate: it.pubDate,
    description: truncate(stripTags(it.description), 160)
  }));

  writeCache(catKey, items);
  return { items, fromCache: false };
}

function renderTabs() {
  const nav = document.getElementById("tabs");
  nav.innerHTML = Object.entries(CATEGORIES).map(([key, cfg]) => `
    <button class="tab-btn ${key === state.current ? "active" : ""}" data-key="${key}">
      ${cfg.emoji} ${cfg.label}
    </button>
  `).join("");

  nav.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.current = btn.dataset.key;
      renderTabs();
      loadAndRender(state.current);
    });
  });
}

function renderStatus(message, { link, linkText } = {}) {
  const box = document.getElementById("statusBox");
  const list = document.getElementById("newsList");
  list.innerHTML = "";
  box.hidden = false;
  box.innerHTML = `<p>${escapeHtml(message)}</p>` +
    (link ? `<p><a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(linkText || "원문 사이트에서 보기")} →</a></p>` : "");
}

function renderNews(items, catKey) {
  const box = document.getElementById("statusBox");
  box.hidden = true;

  const list = document.getElementById("newsList");
  list.innerHTML = "";

  if (!items.length) {
    renderStatus("표시할 뉴스가 없습니다.");
    return;
  }

  items.forEach((article, idx) => {
    const badgeKey = catKey === "all" ? (guessCategory(`${article.title} ${article.description}`) || null) : catKey;
    const badgeLabel = badgeKey ? CATEGORIES[badgeKey].label : "과학 일반";

    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `
      <div class="news-card-top">
        <span class="category-badge">${escapeHtml(badgeLabel)}</span>
        <span class="news-date">${escapeHtml(formatDate(article.pubDate))}</span>
      </div>
      <h3 class="news-title"><a href="${escapeHtml(article.link)}" target="_blank" rel="noopener">${escapeHtml(article.title)}</a></h3>
      <p class="news-desc">${escapeHtml(article.description)}</p>
      <div class="news-actions">
        <a class="source-link" href="${escapeHtml(article.link)}" target="_blank" rel="noopener">📄 원문 기사 보기</a>
        <button class="topic-toggle" data-idx="${idx}">🎓 생기부 탐구주제 추천</button>
      </div>
      <div class="topic-panel" id="topic-${idx}" hidden></div>
    `;
    list.appendChild(card);

    const toggleBtn = card.querySelector(".topic-toggle");
    const panel = card.querySelector(".topic-panel");
    toggleBtn.addEventListener("click", () => {
      const isHidden = panel.hidden;
      if (isHidden && !panel.dataset.loaded) {
        const topics = buildTopics(article, catKey);
        panel.innerHTML = `<h4>💡 추천 탐구주제 (참고용)</h4><ul>${topics.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
        panel.dataset.loaded = "1";
      }
      panel.hidden = !isHidden;
      toggleBtn.classList.toggle("open", !panel.hidden);
      toggleBtn.textContent = !panel.hidden ? "🎓 탐구주제 숨기기" : "🎓 생기부 탐구주제 추천";
    });
  });
}

async function loadAndRender(catKey, { force = false } = {}) {
  const meta = document.getElementById("feedMeta");
  meta.textContent = "불러오는 중" + "…";
  renderStatus("뉴스를 불러오는 중입니다…");

  try {
    const { items, fromCache } = await fetchCategory(catKey, { force });
    state.itemsByCategory[catKey] = items;
    renderNews(items, catKey);
    meta.textContent = `${CATEGORIES[catKey].label} · ${items.length}건` + (fromCache ? " (캐시됨)" : "");
  } catch (err) {
    meta.textContent = "";
    console.error("뉴스 로딩 실패:", err);
    const reason = err && err.name === "AbortError" ? "응답 시간 초과" : (err?.message || "알 수 없는 오류");
    renderStatus(`뉴스를 불러오지 못했습니다 (${reason}). 잠시 후 다시 시도하거나 원문 사이트에서 확인해주세요.`, {
      link: CATEGORIES[catKey].home,
      linkText: `${CATEGORIES[catKey].label} 뉴스 원문 사이트`
    });
  }
}

document.getElementById("refreshBtn").addEventListener("click", () => {
  loadAndRender(state.current, { force: true });
});

renderTabs();
loadAndRender(state.current);
