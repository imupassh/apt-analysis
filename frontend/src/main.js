import "./style.css";

const areaMeta = {
  small: { label: "소형", range: "40~59㎡", min: 40, maxExclusive: 60 },
  medium: { label: "중형", range: "60~84㎡", min: 60, maxExclusive: 85 },
  large: { label: "대형", range: "85~114㎡", min: 85, maxExclusive: 115 },
  xlarge: { label: "초대형", range: "115㎡ 이상", min: 115, maxExclusive: null },
};

const state = { city: "", district: "", sggCd: "", neighborhood: "", areas: new Set(["medium"]), startYear: 2020, endYear: 2022, halves: new Set() };
const elements = {
  form: document.querySelector("#search-form"), city: document.querySelector("#city-select"), district: document.querySelector("#district-select"), neighborhood: document.querySelector("#neighborhood-select"),
  regionStatus: document.querySelector("#region-status"), areaOptions: document.querySelector("#area-options"), areaStatus: document.querySelector("#area-status"),
  startYear: document.querySelector("#start-year"), endYear: document.querySelector("#end-year"), endYearField: document.querySelector(".end-year-field"), halfOptions: document.querySelector(".half-year-options"), periodStatus: document.querySelector("#period-status"),
  formError: document.querySelector("#form-error"), resultsSection: document.querySelector("#results-section"), resultCount: document.querySelector("#result-count"), conditionSummary: document.querySelector("#condition-summary"), resultsContent: document.querySelector("#results-content"),
};

function setOptions(select, values, placeholder, selectedValue = "") {
  select.replaceChildren();
  if (placeholder) select.add(new Option(placeholder, ""));
  values.forEach(({ label, value }) => select.add(new Option(label, value)));
  select.value = selectedValue;
}

async function api(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("데이터를 불러오지 못했습니다.");
  return response.json();
}

function updateRegionStatus() {
  const selected = [state.city, state.district, state.neighborhood].filter(Boolean);
  elements.regionStatus.textContent = state.district ? `${selected.join(" ")} 범위 선택됨` : "시·군·구를 선택해 주세요.";
}

async function updateDistrictOptions() {
  setOptions(elements.district, [], "시·군·구를 선택하세요");
  setOptions(elements.neighborhood, [], "전체 읍·면·동");
  elements.district.disabled = !state.city;
  elements.neighborhood.disabled = true;
  if (!state.city) return;
  const rows = await api(`/api/regions/sigungus?sido_name=${encodeURIComponent(state.city)}`);
  setOptions(elements.district, rows.map((row) => ({ label: row.sigungu_name, value: row.sgg_cd })), "시·군·구를 선택하세요", state.sggCd);
}

async function updateNeighborhoodOptions() {
  setOptions(elements.neighborhood, [], "전체 읍·면·동");
  elements.neighborhood.disabled = !state.sggCd;
  if (!state.sggCd) return;
  const rows = await api(`/api/regions/eupmyeondongs?sgg_cd=${state.sggCd}`);
  setOptions(elements.neighborhood, rows.map((row) => ({ label: row.eup_myeon_dong_name, value: row.eup_myeon_dong_name })), "전체 읍·면·동", state.neighborhood);
}

function updatePeriodStatus() {
  const halfYear = state.halves.size > 0;
  elements.endYear.disabled = halfYear;
  elements.endYearField.classList.toggle("is-disabled", halfYear);
  if (!halfYear) {
    elements.periodStatus.textContent = state.startYear === state.endYear ? `${state.startYear}년 전체 기간` : `${state.startYear}~${state.endYear}년 전체 기간`;
    return;
  }
  const label = state.halves.size === 2 ? "상·하반기" : state.halves.has("first") ? "상반기" : "하반기";
  elements.periodStatus.textContent = `${state.startYear}년 ${label} · 종료 연도 제외`;
}

async function initializeFilters() {
  try {
    const sidos = await api("/api/regions/sidos");
    setOptions(elements.city, sidos.map((row) => ({ label: row.sido_name, value: row.sido_name })), "시·도를 선택하세요");
    const years = Array.from({ length: new Date().getFullYear() - 2006 + 1 }, (_, index) => 2006 + index);
    setOptions(elements.startYear, years.map((year) => ({ label: String(year), value: String(year) })), "", String(state.startYear));
    setOptions(elements.endYear, years.map((year) => ({ label: String(year), value: String(year) })), "", String(state.endYear));
    updatePeriodStatus(); updateRegionStatus();
  } catch { elements.formError.textContent = "백엔드 연결을 확인해 주세요."; }
}

function handleAreaSelection(event) {
  const button = event.target.closest("[data-area]");
  if (!button) return;
  const key = button.dataset.area;
  state.areas.has(key) ? state.areas.delete(key) : state.areas.add(key);
  document.querySelectorAll("[data-area]").forEach((chip) => {
    const selected = state.areas.has(chip.dataset.area);
    chip.classList.toggle("is-selected", selected); chip.setAttribute("aria-pressed", String(selected));
  });
  elements.areaStatus.textContent = [...state.areas].map((keyName) => areaMeta[keyName].label).join(", ") || "면적을 하나 이상 선택해 주세요.";
}

function handleHalfSelection(event) {
  const button = event.target.closest("[data-half]");
  if (!button) return;
  const key = button.dataset.half;
  state.halves.has(key) ? state.halves.delete(key) : state.halves.add(key);
  document.querySelectorAll("[data-half]").forEach((chip) => {
    const selected = state.halves.has(chip.dataset.half);
    chip.classList.toggle("is-selected", selected); chip.setAttribute("aria-pressed", String(selected));
  });
  updatePeriodStatus();
}

async function fetchApartmentResults() {
  const params = new URLSearchParams({ sgg_cd: state.sggCd });
  [...state.areas].forEach((key) => {
    const { min, maxExclusive } = areaMeta[key];
    params.append("area_ranges", `${min}-${maxExclusive ?? ""}`);
  });
  params.set("start_year", String(state.startYear));
  params.set("end_year", String(state.halves.size ? state.startYear : state.endYear));
  if (state.neighborhood) params.set("umd_nm", state.neighborhood);
  if (state.halves.size) {
    const months = state.halves.has("first") ? [1, 2, 3, 4, 5, 6] : [];
    if (state.halves.has("second")) months.push(7, 8, 9, 10, 11, 12);
    months.forEach((month) => params.append("months", String(month)));
  }
  return api(`/api/apartment-trades?${params}`);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function renderResults(results) {
  const rankedResults = results.reduce((ranked, row, index) => {
    const transactionCount = Number(row.transaction_count);
    const previousCount = index > 0 ? Number(results[index - 1].transaction_count) : null;
    ranked.push({ ...row, rank: transactionCount === previousCount ? ranked[index - 1].rank : index + 1 });
    return ranked;
  }, []);
  elements.resultCount.innerHTML = `검색 결과 <strong>${rankedResults.length}</strong>개`;
  const region = [state.city, state.district, state.neighborhood].filter(Boolean).join(" ");
  const areaText = [...state.areas].map((key) => areaMeta[key].range).join(", ");
  const periodText = state.halves.size ? `${state.startYear}년 ${state.halves.size === 2 ? "상·하반기" : state.halves.has("first") ? "상반기" : "하반기"}` : state.startYear === state.endYear ? `${state.startYear}년` : `${state.startYear}~${state.endYear}년`;
  elements.conditionSummary.innerHTML = `<strong>${escapeHtml(periodText)}</strong> · <strong>${escapeHtml(region)}</strong> · <strong>${escapeHtml(areaText)}</strong> 조건의 거래량을 보여드립니다.`;
  if (!rankedResults.length) {
    elements.resultsContent.innerHTML = "<div class=\"empty-state\"><div><h3>조건에 맞는 거래 데이터가 없습니다.</h3><p>지역, 면적 또는 기간을 변경해 다시 검색해 주세요.</p></div></div>";
    return;
  }
  const rows = rankedResults.map((row) => {
    const isTopRank = row.rank <= 3;
    return `<tr class=\"${isTopRank ? "is-top-rank" : ""}\"><td><strong class=\"rank-badge ${isTopRank ? "rank-badge-top" : ""}\">${row.rank}위</strong></td><td>${escapeHtml(row.apt_nm)}</td><td><span class=\"transaction-count\">${Number(row.transaction_count).toLocaleString("ko-KR")}건</span></td><td>${escapeHtml(row.build_year)}년</td><td>${escapeHtml(row.umd_nm)}</td></tr>`;
  }).join("");
  elements.resultsContent.innerHTML = `<div class=\"table-wrap\"><table class=\"result-table\"><thead><tr><th>순위</th><th>단지명</th><th>거래 건수 ↓</th><th>건축년도</th><th>읍·면·동</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function validateSearch() {
  if (!state.sggCd) return "시·군·구를 선택해 주세요.";
  if (!state.areas.size) return "면적을 하나 이상 선택해 주세요.";
  if (!state.halves.size && state.startYear > state.endYear) return "시작 연도는 종료 연도보다 늦을 수 없습니다.";
  return "";
}

elements.city.addEventListener("change", async (event) => { state.city = event.target.value; state.district = ""; state.sggCd = ""; state.neighborhood = ""; try { await updateDistrictOptions(); } catch { elements.formError.textContent = "지역 데이터를 불러오지 못했습니다."; } updateRegionStatus(); });
elements.district.addEventListener("change", async (event) => { state.sggCd = event.target.value; state.district = event.target.selectedOptions[0]?.text || ""; state.neighborhood = ""; try { await updateNeighborhoodOptions(); } catch { elements.formError.textContent = "읍·면·동 데이터를 불러오지 못했습니다."; } updateRegionStatus(); });
elements.neighborhood.addEventListener("change", (event) => { state.neighborhood = event.target.value; updateRegionStatus(); });
elements.startYear.addEventListener("change", (event) => { state.startYear = Number(event.target.value); updatePeriodStatus(); });
elements.endYear.addEventListener("change", (event) => { state.endYear = Number(event.target.value); updatePeriodStatus(); });
elements.areaOptions.addEventListener("click", handleAreaSelection);
elements.halfOptions.addEventListener("click", handleHalfSelection);
elements.form.addEventListener("submit", async (event) => { event.preventDefault(); const error = validateSearch(); if (error) { elements.formError.textContent = error; return; } try { elements.formError.textContent = ""; renderResults(await fetchApartmentResults()); elements.resultsSection.hidden = false; elements.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { elements.formError.textContent = "거래 데이터를 불러오지 못했습니다."; } });

initializeFilters();
