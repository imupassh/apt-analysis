import "./style.css";

const regionData = {
  서울특별시: {
    강남구: ["대치동", "도곡동", "삼성동"],
    송파구: ["잠실동", "문정동", "가락동"],
    마포구: ["아현동", "상암동", "공덕동"],
  },
  부산광역시: {
    해운대구: ["우동", "중동", "좌동"],
    수영구: ["광안동", "남천동", "민락동"],
  },
  경기도: {
    성남시: ["분당동", "정자동", "판교동"],
    수원시: ["광교동", "영통동", "인계동"],
  },
};

const areaMeta = {
  small: { label: "소형", range: "40~59㎡", min: 40, max: 59 },
  medium: { label: "중형", range: "60~84㎡", min: 60, max: 84 },
  large: { label: "대형", range: "85~114㎡", min: 85, max: 114 },
  xlarge: { label: "초대형", range: "115㎡ 이상", min: 115, max: Infinity },
};

const mockApartments = [
  {
    name: "래미안 대치팰리스",
    builtYear: 2015,
    roadAddress: "삼성로51길 37",
    city: "서울특별시",
    district: "강남구",
    neighborhood: "대치동",
    area: 84,
    transactions: [[2020, 3, 18], [2020, 9, 22], [2021, 5, 27], [2021, 11, 21], [2022, 4, 16], [2022, 10, 12], [2023, 6, 19], [2024, 8, 23]],
  },
  {
    name: "대치 아이파크",
    builtYear: 2008,
    roadAddress: "선릉로 222",
    city: "서울특별시",
    district: "강남구",
    neighborhood: "대치동",
    area: 84,
    transactions: [[2020, 2, 15], [2020, 8, 19], [2021, 4, 24], [2021, 9, 17], [2022, 3, 13], [2022, 11, 10], [2023, 7, 15], [2025, 1, 9]],
  },
  {
    name: "은마아파트",
    builtYear: 1979,
    roadAddress: "삼성로 212",
    city: "서울특별시",
    district: "강남구",
    neighborhood: "대치동",
    area: 76,
    transactions: [[2020, 1, 31], [2020, 7, 36], [2021, 6, 29], [2021, 12, 26], [2022, 5, 18], [2022, 8, 15], [2023, 10, 21], [2024, 5, 25]],
  },
  {
    name: "도곡렉슬",
    builtYear: 2006,
    roadAddress: "선릉로 221",
    city: "서울특별시",
    district: "강남구",
    neighborhood: "도곡동",
    area: 84,
    transactions: [[2020, 3, 26], [2020, 10, 24], [2021, 2, 28], [2021, 8, 23], [2022, 6, 16], [2022, 12, 14], [2023, 9, 20], [2024, 2, 22]],
  },
  {
    name: "타워팰리스 1차",
    builtYear: 2002,
    roadAddress: "언주로30길 56",
    city: "서울특별시",
    district: "강남구",
    neighborhood: "도곡동",
    area: 137,
    transactions: [[2020, 4, 11], [2020, 9, 9], [2021, 3, 14], [2021, 10, 12], [2022, 5, 8], [2022, 11, 7], [2024, 6, 13]],
  },
  {
    name: "삼성동 힐스테이트",
    builtYear: 2008,
    roadAddress: "학동로68길 29",
    city: "서울특별시",
    district: "강남구",
    neighborhood: "삼성동",
    area: 59,
    transactions: [[2020, 6, 17], [2020, 12, 20], [2021, 5, 22], [2021, 7, 18], [2022, 4, 14], [2022, 9, 11], [2023, 3, 16]],
  },
  {
    name: "잠실 리센츠",
    builtYear: 2008,
    roadAddress: "올림픽로 135",
    city: "서울특별시",
    district: "송파구",
    neighborhood: "잠실동",
    area: 84,
    transactions: [[2020, 2, 38], [2020, 8, 42], [2021, 5, 34], [2021, 11, 31], [2022, 3, 24], [2022, 9, 20], [2023, 4, 28], [2024, 7, 35]],
  },
  {
    name: "잠실 엘스",
    builtYear: 2008,
    roadAddress: "올림픽로 99",
    city: "서울특별시",
    district: "송파구",
    neighborhood: "잠실동",
    area: 59,
    transactions: [[2020, 1, 32], [2020, 10, 37], [2021, 6, 30], [2021, 12, 27], [2022, 5, 21], [2022, 8, 18], [2023, 2, 25]],
  },
  {
    name: "마포 래미안 푸르지오",
    builtYear: 2014,
    roadAddress: "마포대로 195",
    city: "서울특별시",
    district: "마포구",
    neighborhood: "아현동",
    area: 84,
    transactions: [[2020, 4, 29], [2020, 9, 33], [2021, 3, 25], [2021, 8, 23], [2022, 6, 17], [2022, 12, 15], [2024, 5, 26]],
  },
  {
    name: "해운대 아이파크",
    builtYear: 2011,
    roadAddress: "마린시티2로 38",
    city: "부산광역시",
    district: "해운대구",
    neighborhood: "우동",
    area: 114,
    transactions: [[2020, 5, 18], [2020, 11, 21], [2021, 4, 20], [2021, 9, 18], [2022, 2, 13], [2022, 8, 12], [2023, 6, 17]],
  },
  {
    name: "마린시티 자이",
    builtYear: 2019,
    roadAddress: "마린시티1로 9",
    city: "부산광역시",
    district: "해운대구",
    neighborhood: "우동",
    area: 84,
    transactions: [[2020, 3, 14], [2020, 7, 16], [2021, 6, 19], [2021, 12, 17], [2022, 4, 12], [2022, 10, 10], [2024, 3, 15]],
  },
  {
    name: "광교 자연앤힐스테이트",
    builtYear: 2012,
    roadAddress: "도청로 65",
    city: "경기도",
    district: "수원시",
    neighborhood: "광교동",
    area: 84,
    transactions: [[2020, 2, 24], [2020, 9, 27], [2021, 5, 22], [2021, 10, 20], [2022, 3, 15], [2022, 7, 13], [2023, 11, 18]],
  },
];

const state = {
  city: "서울특별시",
  district: "",
  neighborhood: "",
  areas: new Set(["medium"]),
  startYear: 2020,
  endYear: 2022,
  halves: new Set(),
};

const elements = {
  form: document.querySelector("#search-form"),
  city: document.querySelector("#city-select"),
  district: document.querySelector("#district-select"),
  neighborhood: document.querySelector("#neighborhood-select"),
  regionStatus: document.querySelector("#region-status"),
  areaOptions: document.querySelector("#area-options"),
  areaStatus: document.querySelector("#area-status"),
  startYear: document.querySelector("#start-year"),
  endYear: document.querySelector("#end-year"),
  endYearField: document.querySelector(".end-year-field"),
  halfOptions: document.querySelector(".half-year-options"),
  periodStatus: document.querySelector("#period-status"),
  formError: document.querySelector("#form-error"),
  resultsSection: document.querySelector("#results-section"),
  resultCount: document.querySelector("#result-count"),
  conditionSummary: document.querySelector("#condition-summary"),
  resultsContent: document.querySelector("#results-content"),
};

function setOptions(select, values, placeholder, selectedValue = "") {
  select.replaceChildren();

  if (placeholder) {
    const option = new Option(placeholder, "");
    select.add(option);
  }

  values.forEach((value) => select.add(new Option(value, value)));
  select.value = selectedValue;
}

function initializeFilters() {
  setOptions(elements.city, Object.keys(regionData), "", state.city);
  updateDistrictOptions();

  const years = Array.from({ length: 6 }, (_, index) => 2020 + index);
  setOptions(elements.startYear, years, "", String(state.startYear));
  setOptions(elements.endYear, years, "", String(state.endYear));
  updateRegionStatus();
  updatePeriodStatus();
}

function updateDistrictOptions() {
  const districts = state.city ? Object.keys(regionData[state.city]) : [];
  setOptions(elements.district, districts, "시·군·구를 선택하세요", state.district);
  elements.district.disabled = !state.city;
  updateNeighborhoodOptions();
}

function updateNeighborhoodOptions() {
  const neighborhoods = state.district ? regionData[state.city][state.district] : [];
  setOptions(elements.neighborhood, neighborhoods, "전체 읍·면·동", state.neighborhood);
  elements.neighborhood.disabled = !state.district;
}

function updateRegionStatus() {
  const selected = [state.city, state.district, state.neighborhood].filter(Boolean);
  elements.regionStatus.textContent = state.district
    ? `${selected.join(" ")} 범위 선택됨`
    : "시·군·구를 선택해 주세요.";
}

function handleAreaSelection(event) {
  const button = event.target.closest("[data-area]");
  if (!button) return;

  const key = button.dataset.area;
  if (state.areas.has(key)) {
    state.areas.delete(key);
  } else {
    state.areas.add(key);
  }

  document.querySelectorAll("[data-area]").forEach((chip) => {
    const isSelected = state.areas.has(chip.dataset.area);
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });

  const labels = [...state.areas].map((area) => areaMeta[area].label);
  elements.areaStatus.textContent = labels.length ? `${labels.join(", ")} 선택됨` : "면적을 하나 이상 선택해 주세요.";
  clearError();
}

function handleHalfSelection(event) {
  const button = event.target.closest("[data-half]");
  if (!button) return;

  const half = button.dataset.half;
  if (state.halves.has(half)) {
    state.halves.delete(half);
  } else {
    state.halves.add(half);
  }

  document.querySelectorAll("[data-half]").forEach((chip) => {
    const isSelected = state.halves.has(chip.dataset.half);
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });

  updatePeriodStatus();
  clearError();
}

function updatePeriodStatus() {
  const isHalfYearSearch = state.halves.size > 0;
  elements.endYear.disabled = isHalfYearSearch;
  elements.endYearField.classList.toggle("is-disabled", isHalfYearSearch);

  if (!isHalfYearSearch) {
    elements.periodStatus.textContent = state.startYear === state.endYear
      ? `${state.startYear}년 전체 기간`
      : `${state.startYear}~${state.endYear}년 전체 기간`;
    return;
  }

  const halfText = state.halves.size === 2
    ? "상·하반기"
    : state.halves.has("first") ? "상반기" : "하반기";
  elements.periodStatus.textContent = `${state.startYear}년 ${halfText} · 종료 연도 제외`;
}

function isAreaIncluded(area) {
  return [...state.areas].some((key) => {
    const { min, max } = areaMeta[key];
    return area >= min && area <= max;
  });
}

function isTransactionIncluded(year, month) {
  const half = month <= 6 ? "first" : "second";
  return state.halves.size
    ? year === state.startYear && state.halves.has(half)
    : year >= state.startYear && year <= state.endYear;
}

// Replace this function with a FastAPI request when the backend is connected.
async function fetchApartmentResults() {
  return mockApartments
    .filter((apartment) => (
      apartment.city === state.city
      && apartment.district === state.district
      && (!state.neighborhood || apartment.neighborhood === state.neighborhood)
      && isAreaIncluded(apartment.area)
    ))
    .map((apartment) => ({
      ...apartment,
      transactionCount: apartment.transactions
        .filter(([year, month]) => isTransactionIncluded(year, month))
        .reduce((total, transaction) => total + transaction[2], 0),
    }))
    .filter((apartment) => apartment.transactionCount > 0)
    .sort((a, b) => b.transactionCount - a.transactionCount);
}

function getAreaSummary() {
  return [...state.areas].map((key) => areaMeta[key].range).join(", ");
}

function renderSummary(resultCount) {
  const region = [state.city, state.district, state.neighborhood].filter(Boolean).join(" ");
  const periodText = state.halves.size
    ? `${state.startYear}년 ${state.halves.size === 2
      ? "상·하반기"
      : state.halves.has("first") ? "상반기" : "하반기"}`
    : state.startYear === state.endYear
      ? `${state.startYear}년 전체`
      : `${state.startYear}~${state.endYear}년 전체`;

  elements.conditionSummary.innerHTML = `
    <strong>${periodText}</strong> 동안의
    <strong>${region}</strong> <strong>${getAreaSummary()}</strong>
    아파트를 거래량이 많은 순서로 보여드릴게요.
  `;
  elements.resultCount.innerHTML = `검색 결과 <strong>${resultCount}</strong>개`;
}

function renderResults(results) {
  if (!results.length) {
    elements.resultsContent.innerHTML = `
      <div class="empty-state">
        <div>
          <span class="empty-state-mark" aria-hidden="true">—</span>
          <h3>조건에 맞는 거래 데이터가 없습니다.</h3>
          <p>지역, 면적 또는 기간을 변경해 다시 검색해 주세요.</p>
        </div>
      </div>
    `;
    return;
  }

  const rows = results.map((apartment) => `
    <tr>
      <td>
        <a class="apartment-link" href="#apartment-${encodeURIComponent(apartment.name)}"
          aria-label="${apartment.name} 상세 분석 보기">${apartment.name}</a>
      </td>
      <td>${apartment.builtYear}년</td>
      <td><span class="transaction-count">${apartment.transactionCount.toLocaleString("ko-KR")}건</span></td>
      <td>${apartment.roadAddress}</td>
    </tr>
  `).join("");

  elements.resultsContent.innerHTML = `
    <div class="table-wrap">
      <table class="result-table">
        <thead>
          <tr>
            <th scope="col">단지명</th>
            <th scope="col">건축년도</th>
            <th scope="col">거래 건수 ↓</th>
            <th scope="col">도로명</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function validateSearch() {
  if (!state.district) return "시·군·구를 선택해 주세요.";
  if (!state.areas.size) return "면적을 하나 이상 선택해 주세요.";
  if (!state.halves.size && state.startYear > state.endYear) {
    return "시작 연도는 종료 연도보다 늦을 수 없습니다.";
  }
  return "";
}

function clearError() {
  elements.formError.textContent = "";
}

async function handleSearch(event) {
  event.preventDefault();
  const error = validateSearch();

  if (error) {
    elements.formError.textContent = error;
    return;
  }

  clearError();
  const results = await fetchApartmentResults();
  renderSummary(results.length);
  renderResults(results);
  elements.resultsSection.hidden = false;
  requestAnimationFrame(() => {
    elements.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

elements.city.addEventListener("change", (event) => {
  state.city = event.target.value;
  state.district = "";
  state.neighborhood = "";
  updateDistrictOptions();
  updateRegionStatus();
  clearError();
});

elements.district.addEventListener("change", (event) => {
  state.district = event.target.value;
  state.neighborhood = "";
  updateNeighborhoodOptions();
  updateRegionStatus();
  clearError();
});

elements.neighborhood.addEventListener("change", (event) => {
  state.neighborhood = event.target.value;
  updateRegionStatus();
});

elements.startYear.addEventListener("change", (event) => {
  state.startYear = Number(event.target.value);
  updatePeriodStatus();
  clearError();
});

elements.endYear.addEventListener("change", (event) => {
  state.endYear = Number(event.target.value);
  updatePeriodStatus();
  clearError();
});

elements.areaOptions.addEventListener("click", handleAreaSelection);
elements.halfOptions.addEventListener("click", handleHalfSelection);
elements.form.addEventListener("submit", handleSearch);

initializeFilters();
