// 국내 자급제 출고가 기준 참고 데이터 (2025년 출시가 기준, 실제 판매가와 다를 수 있음)
const PHONES = [
  {
    id: "s25-ultra", brand: "samsung", name: "Galaxy S25 Ultra", year: 2025,
    display: "6.9\" QHD+ 120Hz", chip: "스냅드래곤 8 Elite for Galaxy",
    camera: "200MP + 50MP + 50MP + 10MP", battery: "5000mAh",
    variants: [
      { label: "256GB", price: 1698400 },
      { label: "512GB", price: 1873900 },
      { label: "1TB", price: 2145700 }
    ]
  },
  {
    id: "s25-plus", brand: "samsung", name: "Galaxy S25+", year: 2025,
    display: "6.7\" QHD+ 120Hz", chip: "스냅드래곤 8 Elite for Galaxy",
    camera: "50MP + 12MP + 10MP", battery: "4900mAh",
    variants: [
      { label: "256GB", price: 1353000 },
      { label: "512GB", price: 1529300 }
    ]
  },
  {
    id: "s25", brand: "samsung", name: "Galaxy S25", year: 2025,
    display: "6.2\" FHD+ 120Hz", chip: "스냅드래곤 8 Elite for Galaxy",
    camera: "50MP + 12MP + 10MP", battery: "4000mAh",
    variants: [
      { label: "128GB", price: 1155000 },
      { label: "256GB", price: 1255000 }
    ]
  },
  {
    id: "s25-edge", brand: "samsung", name: "Galaxy S25 Edge", year: 2025,
    display: "6.7\" QHD+ 120Hz 슬림", chip: "스냅드래곤 8 Elite for Galaxy",
    camera: "200MP + 12MP", battery: "3900mAh",
    variants: [
      { label: "256GB", price: 1499500 },
      { label: "512GB", price: 1676800 }
    ]
  },
  {
    id: "z-fold7", brand: "samsung", name: "Galaxy Z Fold7", year: 2025,
    display: "8.0\" 폴더블 QHD+ / 6.5\" 커버", chip: "스냅드래곤 8 Elite for Galaxy",
    camera: "200MP + 12MP + 10MP", battery: "4400mAh",
    variants: [
      { label: "256GB", price: 2398700 },
      { label: "512GB", price: 2563700 }
    ]
  },
  {
    id: "z-flip7", brand: "samsung", name: "Galaxy Z Flip7", year: 2025,
    display: "6.9\" 폴더블 FHD+ / 4.1\" 커버", chip: "엑시노스 2500",
    camera: "50MP + 12MP", battery: "4300mAh",
    variants: [
      { label: "256GB", price: 1498600 },
      { label: "512GB", price: 1631700 }
    ]
  },
  {
    id: "a56", brand: "samsung", name: "Galaxy A56", year: 2025,
    display: "6.7\" FHD+ 120Hz", chip: "엑시노스 1580",
    camera: "50MP + 12MP + 5MP", battery: "5000mAh",
    variants: [
      { label: "256GB", price: 599500 }
    ]
  },
  {
    id: "ip17-pro-max", brand: "apple", name: "iPhone 17 Pro Max", year: 2025,
    display: "6.9\" ProMotion OLED 120Hz", chip: "A19 Pro",
    camera: "48MP + 48MP + 48MP", battery: "약 4685mAh",
    variants: [
      { label: "256GB", price: 1900000 },
      { label: "512GB", price: 2210000 },
      { label: "1TB", price: 2520000 }
    ]
  },
  {
    id: "ip17-pro", brand: "apple", name: "iPhone 17 Pro", year: 2025,
    display: "6.3\" ProMotion OLED 120Hz", chip: "A19 Pro",
    camera: "48MP + 48MP + 48MP", battery: "약 4200mAh",
    variants: [
      { label: "256GB", price: 1700000 },
      { label: "512GB", price: 2010000 }
    ]
  },
  {
    id: "ip17-air", brand: "apple", name: "iPhone 17 Air", year: 2025,
    display: "6.6\" OLED 120Hz 슬림", chip: "A19",
    camera: "48MP", battery: "약 3600mAh",
    variants: [
      { label: "256GB", price: 1590000 },
      { label: "512GB", price: 1900000 }
    ]
  },
  {
    id: "ip17", brand: "apple", name: "iPhone 17", year: 2025,
    display: "6.3\" OLED 120Hz", chip: "A19",
    camera: "48MP + 48MP", battery: "약 3600mAh",
    variants: [
      { label: "256GB", price: 1250000 },
      { label: "512GB", price: 1560000 }
    ]
  },
  {
    id: "ip16e", brand: "apple", name: "iPhone 16e", year: 2025,
    display: "6.1\" OLED 60Hz", chip: "A18",
    camera: "48MP", battery: "약 3961mAh",
    variants: [
      { label: "128GB", price: 830000 },
      { label: "256GB", price: 970000 }
    ]
  },
  {
    id: "ip16", brand: "apple", name: "iPhone 16", year: 2024,
    display: "6.1\" OLED 60Hz", chip: "A18",
    camera: "48MP + 12MP", battery: "약 3561mAh",
    variants: [
      { label: "128GB", price: 1150000 },
      { label: "256GB", price: 1350000 }
    ]
  }
];

const state = {
  brand: "all",
  query: "",
  sort: "price-asc",
  selectedVariant: {},   // id -> variant index
  compareSet: []         // array of ids, max 2
};

const won = (n) => n.toLocaleString("ko-KR") + "원";

function defaultVariantIndex() {
  return 0;
}

function getSelectedVariant(phone) {
  const idx = state.selectedVariant[phone.id] ?? defaultVariantIndex();
  return phone.variants[idx];
}

function filteredSortedPhones() {
  let list = PHONES.filter(p => state.brand === "all" || p.brand === state.brand);

  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.includes(q) ||
      p.chip.toLowerCase().includes(q)
    );
  }

  const priceOf = (p) => getSelectedVariant(p).price;

  switch (state.sort) {
    case "price-asc": list = [...list].sort((a, b) => priceOf(a) - priceOf(b)); break;
    case "price-desc": list = [...list].sort((a, b) => priceOf(b) - priceOf(a)); break;
    case "name-asc": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
    case "year-desc": list = [...list].sort((a, b) => b.year - a.year); break;
  }
  return list;
}

function brandLabel(brand) {
  return brand === "samsung" ? "삼성" : "애플";
}

function render() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const list = filteredSortedPhones();

  grid.innerHTML = "";
  empty.hidden = list.length !== 0;

  list.forEach(phone => {
    const variant = getSelectedVariant(phone);
    const card = document.createElement("article");
    card.className = "product-card" + (state.compareSet.includes(phone.id) ? " selected" : "");

    const variantIdx = state.selectedVariant[phone.id] ?? defaultVariantIndex();

    card.innerHTML = `
      <span class="brand-badge ${phone.brand}">${phone.brand === "samsung" ? "📱 삼성" : "🍎 애플"}</span>
      <h3 class="product-name">${phone.name}</h3>
      <span class="product-year">${phone.year}년 출시</span>
      <ul class="spec-list">
        <li>${phone.display}</li>
        <li>${phone.chip}</li>
        <li>카메라 ${phone.camera}</li>
        <li>배터리 ${phone.battery}</li>
      </ul>
      <select class="storage-select" aria-label="${phone.name} 저장용량">
        ${phone.variants.map((v, i) => `<option value="${i}" ${i === variantIdx ? "selected" : ""}>${v.label}</option>`).join("")}
      </select>
      <div class="price">${won(variant.price)} <small>${variant.label}</small></div>
      <div class="card-actions">
        <button class="compare-toggle ${state.compareSet.includes(phone.id) ? "on" : ""}" data-id="${phone.id}">
          ${state.compareSet.includes(phone.id) ? "✓ 비교 선택됨" : "비교 추가"}
        </button>
      </div>
    `;

    card.querySelector(".storage-select").addEventListener("change", (e) => {
      state.selectedVariant[phone.id] = Number(e.target.value);
      render();
    });

    card.querySelector(".compare-toggle").addEventListener("click", () => toggleCompare(phone.id));

    grid.appendChild(card);
  });

  renderCompareBar();
}

function toggleCompare(id) {
  const idx = state.compareSet.indexOf(id);
  if (idx >= 0) {
    state.compareSet.splice(idx, 1);
  } else {
    if (state.compareSet.length >= 2) {
      state.compareSet.shift();
    }
    state.compareSet.push(id);
  }
  render();
}

function renderCompareBar() {
  const bar = document.getElementById("compareBar");
  const chipsEl = document.getElementById("compareChips");
  const openBtn = document.getElementById("openCompare");

  if (state.compareSet.length === 0) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  chipsEl.innerHTML = state.compareSet
    .map(id => PHONES.find(p => p.id === id))
    .map(p => `<span class="compare-chip">${p.name}</span>`)
    .join("");

  openBtn.disabled = state.compareSet.length < 2;
  openBtn.style.opacity = state.compareSet.length < 2 ? 0.5 : 1;
}

function buildCompareTable() {
  const phones = state.compareSet.map(id => PHONES.find(p => p.id === id));
  const wrap = document.getElementById("compareTableWrap");

  const maxPrice = Math.max(...phones.map(p => getSelectedVariant(p).price));

  const rows = [
    ["제조사", phones.map(p => brandLabel(p.brand))],
    ["출시연도", phones.map(p => `${p.year}년`)],
    ["디스플레이", phones.map(p => p.display)],
    ["칩셋", phones.map(p => p.chip)],
    ["카메라", phones.map(p => p.camera)],
    ["배터리", phones.map(p => p.battery)],
    ["선택 용량", phones.map(p => getSelectedVariant(p).label)],
    ["가격", phones.map(p => won(getSelectedVariant(p).price))]
  ];

  let html = `<table class="compare-table"><thead><tr><th></th>${phones.map(p => `<th>${p.name}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach(([label, values]) => {
    html += `<tr><th>${label}</th>${values.map(v => `<td>${v}</td>`).join("")}</tr>`;
  });
  html += `<tr class="price-bar-row"><th>가격 비교</th>${phones.map(p => {
    const price = getSelectedVariant(p).price;
    const pct = Math.round((price / maxPrice) * 100);
    return `<td><div class="price-bar-track"><div class="price-bar-fill" style="width:${pct}%"></div></div></td>`;
  }).join("")}</tr>`;
  html += `</tbody></table>`;

  wrap.innerHTML = html;
}

function initControls() {
  document.querySelectorAll(".brand-filter .chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".brand-filter .chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.brand = btn.dataset.brand;
      render();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  document.getElementById("clearCompare").addEventListener("click", () => {
    state.compareSet = [];
    render();
  });

  document.getElementById("openCompare").addEventListener("click", () => {
    if (state.compareSet.length < 2) return;
    buildCompareTable();
    document.getElementById("compareModal").hidden = false;
  });

  const closeModal = () => { document.getElementById("compareModal").hidden = true; };
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

initControls();
render();
