// ── 분야별 RSS 피드 설정 (영문: ScienceDaily / 국문: 헬로디디) ─────────
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

// 국문 과학기술 뉴스 소스 (헬로디디 - 대덕특구 과학기술 전문지, 전체기사 피드)
const KOREAN_SOURCE = {
  label: "헬로디디",
  feed: "https://www.hellodd.com/rss/allArticle.xml",
  home: "https://www.hellodd.com"
};
const KOREAN_ITEMS_ALL_TAB = 30;  // "전체" 탭에서 보여줄 국문 기사 수(최대, 무한 스크롤 풀)
const KOREAN_ITEMS_PER_CAT = 30;  // 분야별 탭에서 필터링해 보여줄 국문 기사 수(최대)
const ENGLISH_ITEMS_LIMIT = 50;   // 분야별 탭에서 가져올 영문 기사 수(최대, 무한 스크롤 풀)

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const ALLORIGINS = "https://api.allorigins.win/raw?url=";
const TRANSLATE_API = "https://api.mymemory.translated.net/get?langpair=en|ko&q=";
const CACHE_TTL_MS = 20 * 60 * 1000;        // 뉴스 목록 캐시: 20분
const TRANSLATE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 번역 캐시: 7일
const FETCH_TIMEOUT_MS = 12000;
const PAGE_SIZE = 10; // 무한 스크롤 시 한 번에 추가로 렌더링할 기사 수

// "전체" 탭 영문 기사의 분야 배지를 추정하기 위한 키워드
const CATEGORY_GUESS_EN = [
  { key: "physics", pattern: /physic|quantum|particle|laser|photon|relativ/i },
  { key: "chemistry", pattern: /chemi|molecul|reaction|compound|cataly|polymer/i },
  { key: "earth", pattern: /climate|earthquake|volcano|ocean|atmospher|geolog|weather|glacier/i },
  { key: "biology", pattern: /biolog|gene|cell |species|plant|animal|virus|protein|dna|ecosystem/i },
  { key: "ai", pattern: /artificial intelligence|\bai\b|algorithm|computer|robot|software|machine learning|neural network/i }
];

// 국문 기사 분야 추정 및 분야별 필터링용 키워드
const CATEGORY_GUESS_KO = [
  { key: "physics", pattern: /물리|양자|입자|레이저|반도체\s?소자/ },
  { key: "chemistry", pattern: /화학|분자|촉매|고분자|화합물/ },
  { key: "earth", pattern: /기후|지진|화산|해양|대기|기상|지질/ },
  { key: "biology", pattern: /생명과학|유전자|세포|생물학|바이러스|단백질|동식물|줄기세포/ },
  { key: "ai", pattern: /인공지능|AI|알고리즘|로봇|소프트웨어|반도체|컴퓨터|데이터|머신러닝/ }
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

// 기사 본문 키워드에 따라 추가되는 좀 더 구체적인 템플릿 (영문/국문 키워드 모두 포함)
const KEYWORD_TEMPLATES = [
  { pattern: /quantum|양자/i, template: "기사에 언급된 '양자(quantum)' 개념이 어떤 원리로 작동하는지 조사하고, 양자중첩·얽힘 등 기초 이론과 연결지어 설명해보자." },
  { pattern: /climate|warming|carbon|기후변화|탄소/i, template: "이 기사와 관련된 기후변화 데이터를 찾아 그래프로 정리하고, 원인과 대응 방안을 탐구해보자." },
  { pattern: /cancer|tumor|\bdisease\b|질병|치료제/i, template: "해당 연구가 질병의 진단·치료에 어떻게 기여할 수 있는지 조사하고, 관련 최신 치료 기술 동향을 정리해보자." },
  { pattern: /\bgene\b|genetic|\bdna\b|유전자/i, template: "기사에서 다룬 유전자·DNA 관련 개념을 조사하고, 유전 정보가 생명현상에 미치는 영향을 탐구해보자." },
  { pattern: /artificial intelligence|\bai\b|machine learning|neural network|인공지능/i, template: "이 기사에서 소개된 AI 기술의 학습 방식(머신러닝/딥러닝)을 조사하고, 실생활 적용 사례를 추가로 조사해보자." },
  { pattern: /space|galaxy|planet|nasa|astronom|우주|천체/i, template: "기사에서 다룬 천체·우주 현상의 관측 방법과 원리를 조사하고, 관련 최신 우주 탐사 소식을 함께 정리해보자." },
  { pattern: /battery|solar cell|energy storage|배터리|태양전지/i, template: "해당 에너지 기술(배터리·태양전지 등)의 원리를 조사하고, 에너지 효율 문제와 연결지어 탐구해보자." },
  { pattern: /material|nanotechnology|\bnano\b|신소재|나노/i, template: "기사에서 소개된 신소재의 특성과 제작 원리를 조사하고, 기존 소재와 비교 분석해보자." },
  { pattern: /\brobot|로봇/i, template: "기사에서 다룬 로봇 기술의 원리와 활용 분야를 조사하고, 관련 윤리적 이슈도 함께 탐구해보자." },
  { pattern: /earthquake|volcano|tsunami|지진|화산/i, template: "기사에서 다룬 지질 현상의 발생 원리를 조사하고, 관련 방재 대책을 탐구해보자." }
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

function guessCategoryEn(text) {
  for (const g of CATEGORY_GUESS_EN) if (g.pattern.test(text)) return g.key;
  return null;
}

function guessCategoryKo(text) {
  for (const g of CATEGORY_GUESS_KO) if (g.pattern.test(text)) return g.key;
  return null;
}

function buildTopics(article, fallbackCategoryKey) {
  const text = `${article.title} ${article.description || ""}`;
  const catKey = fallbackCategoryKey === "all"
    ? (guessCategoryEn(text) || guessCategoryKo(text) || "ai")
    : fallbackCategoryKey;

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
  if (!html) return "";
  // 일부 국내 피드는 제목에 <br>을 실제 태그 또는 이중 이스케이프(&lt;br&gt;)로 포함하므로 공백으로 치환
  const withSpaces = html.replace(/<br\s*\/?>/gi, " ").replace(/&lt;br\s*\/?&gt;/gi, " ");
  const div = document.createElement("div");
  div.innerHTML = withSpaces;
  return (div.textContent || "").replace(/\s+/g, " ").trim();
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

// ── 번역 (영문 헤드라인 → 한글, MyMemory API, 결과는 localStorage에 캐시) ──
function translateCacheKey(text) { return `tr_ko_${text}`; }

function readTranslateCache(text) {
  try {
    const raw = localStorage.getItem(translateCacheKey(text));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > TRANSLATE_CACHE_TTL_MS) return null;
    return parsed.ko;
  } catch {
    return null;
  }
}

function writeTranslateCache(text, ko) {
  try {
    localStorage.setItem(translateCacheKey(text), JSON.stringify({ ts: Date.now(), ko }));
  } catch {
    // 캐시 실패는 무시
  }
}

async function translateToKorean(text) {
  const cached = readTranslateCache(text);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(TRANSLATE_API + encodeURIComponent(text));
    if (!res.ok) throw new Error("translate http error");
    const data = await res.json();
    const ko = data?.responseData?.translatedText;
    if (!ko) throw new Error("no translation");
    const cleaned = stripTags(ko);
    writeTranslateCache(text, cleaned);
    return cleaned;
  } catch {
    return null; // 실패 시 null → 원문 유지
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
  const res = await fetchWithTimeout(RSS2JSON + encodeURIComponent(feedUrl) + "&count=100");
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

async function fetchRawFeed(feedUrl) {
  try {
    return await fetchViaRss2Json(feedUrl);
  } catch (e1) {
    return await fetchViaAllOrigins(feedUrl);
  }
}

function normalizeItems(rawItems, extra) {
  return rawItems.map(it => ({
    title: stripTags(it.title),
    link: it.link,
    pubDate: it.pubDate,
    description: truncate(stripTags(it.description), 160),
    ...extra
  }));
}

async function fetchEnglishItems(catKey) {
  const raw = await fetchRawFeed(CATEGORIES[catKey].feed);
  return normalizeItems(raw.slice(0, ENGLISH_ITEMS_LIMIT), { lang: "en", sourceLabel: "ScienceDaily" });
}

async function fetchKoreanItems(catKey) {
  const raw = await fetchRawFeed(KOREAN_SOURCE.feed);
  const all = normalizeItems(raw, { lang: "ko", sourceLabel: KOREAN_SOURCE.label });

  if (catKey === "all") return all.slice(0, KOREAN_ITEMS_ALL_TAB);

  return all
    .filter(it => guessCategoryKo(`${it.title} ${it.description}`) === catKey)
    .slice(0, KOREAN_ITEMS_PER_CAT);
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => new Date(b.pubDate.replace(" ", "T")) - new Date(a.pubDate.replace(" ", "T")));
}

async function fetchCategory(catKey, { force = false } = {}) {
  if (!force) {
    const cached = readCache(catKey);
    if (cached) return { items: cached, fromCache: true };
  }

  const [enResult, koResult] = await Promise.allSettled([
    fetchEnglishItems(catKey),
    fetchKoreanItems(catKey)
  ]);

  const enItems = enResult.status === "fulfilled" ? enResult.value : [];
  const koItems = koResult.status === "fulfilled" ? koResult.value : [];

  if (!enItems.length && !koItems.length) {
    throw enResult.reason || koResult.reason || new Error("뉴스를 가져오지 못했습니다");
  }

  const items = sortByDateDesc([...koItems, ...enItems]);
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

let scrollObserver = null;

function buildNewsCard(article, idx, catKey) {
  const badgeKey = catKey === "all"
    ? (article.lang === "ko" ? guessCategoryKo(`${article.title} ${article.description}`) : guessCategoryEn(`${article.title} ${article.description}`))
    : catKey;
  const badgeLabel = badgeKey ? CATEGORIES[badgeKey].label : "과학 일반";
  const sourceBadge = article.lang === "ko" ? "🇰🇷 국문" : "🇺🇸 영문·번역";

  const card = document.createElement("article");
  card.className = "news-card";
  card.innerHTML = `
    <div class="news-card-top">
      <span class="category-badge">${escapeHtml(badgeLabel)}</span>
      <span class="source-badge">${sourceBadge} · ${escapeHtml(article.sourceLabel)}</span>
      <span class="news-date">${escapeHtml(formatDate(article.pubDate))}</span>
    </div>
    <h3 class="news-title" data-role="title">
      <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener">${escapeHtml(article.title)}</a>
    </h3>
    ${article.lang === "en" ? `<p class="news-original" data-role="original" hidden>원문: ${escapeHtml(article.title)}</p>` : ""}
    <p class="news-desc">${escapeHtml(article.description)}</p>
    <div class="news-actions">
      <a class="source-link" href="${escapeHtml(article.link)}" target="_blank" rel="noopener">📄 원문 기사 보기</a>
      <button class="topic-toggle" data-idx="${idx}">🎓 생기부 탐구주제 추천</button>
    </div>
    <div class="topic-panel" id="topic-${idx}" hidden></div>
  `;

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

  // 영문 기사는 헤드라인을 한글로 번역해 교체 (원문은 아래 작은 글씨로 표시)
  if (article.lang === "en") {
    translateToKorean(article.title).then(ko => {
      if (!ko) return;
      const titleLink = card.querySelector('[data-role="title"] a');
      const originalP = card.querySelector('[data-role="original"]');
      if (titleLink) titleLink.textContent = ko;
      if (originalP) originalP.hidden = false;
    });
  }

  return card;
}

function renderNews(items, catKey) {
  const box = document.getElementById("statusBox");
  box.hidden = true;

  const list = document.getElementById("newsList");
  list.innerHTML = "";

  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }

  if (!items.length) {
    renderStatus("표시할 뉴스가 없습니다.");
    return;
  }

  const sentinel = document.createElement("div");
  sentinel.className = "scroll-sentinel";
  sentinel.textContent = "더 많은 기사를 불러오는 중…";
  list.appendChild(sentinel);

  let renderedCount = 0;

  function renderNextBatch() {
    const next = items.slice(renderedCount, renderedCount + PAGE_SIZE);
    next.forEach((article, i) => {
      const card = buildNewsCard(article, renderedCount + i, catKey);
      list.insertBefore(card, sentinel);
    });
    renderedCount += next.length;

    if (renderedCount >= items.length) {
      sentinel.hidden = true;
      if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
      }
    }
  }

  renderNextBatch();

  if (renderedCount < items.length) {
    scrollObserver = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) renderNextBatch();
    }, { rootMargin: "400px" });
    scrollObserver.observe(sentinel);
  } else {
    sentinel.hidden = true;
  }
}

async function loadAndRender(catKey, { force = false } = {}) {
  const meta = document.getElementById("feedMeta");
  meta.textContent = "불러오는 중…";
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
