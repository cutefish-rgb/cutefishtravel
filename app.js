const storeKey = "cutefishTravelPlanner";
const adminKey = "cutefishTravelAdmin";
const sessionKey = "cutefishTravelAdminSession";
const firebaseCollection = "travelPlanner";
const firebaseDocument = "siteData";

const today = new Date();
let calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
let currentView = "home";
let tripSearchQuery = "";
let tripStatusFilter = "all";
let autoWeatherRefreshRunning = false;
let appState;
let firebaseState = {
  configured: false,
  ready: false,
  remoteMissing: false,
  auth: null,
  db: null,
  docRef: null,
  user: null,
  adminEmails: []
};

const taiwanHolidays = {
  "2026-01-01": "元旦",
  "2026-02-14": "春節假期",
  "2026-02-15": "春節假期",
  "2026-02-16": "春節假期",
  "2026-02-17": "春節",
  "2026-02-18": "春節",
  "2026-02-19": "春節",
  "2026-02-20": "春節假期",
  "2026-02-21": "春節假期",
  "2026-02-22": "春節假期",
  "2026-02-27": "和平紀念日補假",
  "2026-02-28": "和平紀念日",
  "2026-04-03": "兒童節補假",
  "2026-04-04": "兒童節",
  "2026-04-05": "清明節",
  "2026-04-06": "清明節補假",
  "2026-05-01": "勞動節",
  "2026-06-19": "端午節",
  "2026-09-25": "中秋節",
  "2026-09-28": "教師節",
  "2026-10-09": "國慶日補假",
  "2026-10-10": "國慶日",
  "2026-10-24": "臺灣光復節",
  "2026-10-26": "臺灣光復節補假",
  "2026-12-25": "行憲紀念日"
};

const tripStatusLabels = {
  planning: "規劃中",
  open: "開放報名",
  confirmed: "已成團",
  done: "已結束"
};

const sampleTrips = [
  {
    id: crypto.randomUUID(),
    title: "宜蘭溫泉蔬食小旅行",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    location: "宜蘭 礁溪",
    status: "open",
    mapUrl: "https://maps.google.com/?q=宜蘭礁溪",
    transport: "台北車站集合，搭乘葛瑪蘭客運至礁溪轉乘接駁車。",
    hotel: "山月溫泉旅宿，雙人房，含早餐與大眾湯。",
    attractions: "礁溪溫泉公園、林美石磐步道、幾米公園、傳藝中心。",
    carRental: "第二日 9 人座一台，租車 10 小時，含保險。",
    weatherForecast: "預計 24-29 度，午後可能短暫陣雨，建議攜帶薄外套與折傘。",
    luggageList: "健走鞋、薄外套、折傘、個人藥品、保溫瓶、泡湯衣物。",
    tripNotes: "步道行程可依天氣調整，長輩可選擇在咖啡廳休息。",
    review: "",
    checklist: [
      { item: "訂房確認", done: true },
      { item: "客運票與租車確認", done: false },
      { item: "行前天氣更新", done: false },
      { item: "個人藥品與雨具", done: false }
    ],
    gatherTime: "09:00",
    gatherPlace: "台北車站東三門",
    contactName: "Cutefish",
    contactPhone: "",
    surveyUrl: "https://forms.gle/example",
    videoUrl: "https://www.youtube.com/",
    albumUrl: "",
    references: ["https://www.taiwan.net.tw/", "https://www.yilantravel.com.tw/"],
    costs: [
      { category: "交通", item: "來回客運", amount: 720 },
      { category: "住宿", item: "兩晚住宿", amount: 5200 },
      { category: "餐飲", item: "蔬食合菜", amount: 1300 },
      { category: "租車", item: "九人座", amount: 1800 }
    ],
    attendees: 8,
    schedule: [
      { day: "Day 1", time: "09:00", activity: "台北車站集合出發" },
      { day: "Day 1", time: "13:30", activity: "入住溫泉旅宿與午茶" },
      { day: "Day 2", time: "10:00", activity: "林美石磐步道輕健行" },
      { day: "Day 3", time: "15:00", activity: "回程與伴手禮時間" }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: "台中花市與老宅咖啡",
    startDate: "2026-07-04",
    endDate: "2026-07-04",
    location: "台中市區",
    status: "planning",
    mapUrl: "https://maps.google.com/?q=台中市區",
    transport: "高鐵台中站集合，包車往返。",
    hotel: "一日遊無住宿。",
    attractions: "新社花海、審計新村、宮原眼科周邊。",
    carRental: "中型巴士一台，含司機。",
    weatherForecast: "夏季偏熱，建議查看出發前三日預報，準備帽子與補水。",
    luggageList: "遮陽帽、防曬、輕便鞋、環保杯、外套。",
    tripNotes: "花市步行時間較多，會安排充足休息點。",
    review: "",
    checklist: [
      { item: "包車確認", done: false },
      { item: "午餐餐廳預約", done: false },
      { item: "提醒攜帶遮陽用品", done: false }
    ],
    gatherTime: "08:30",
    gatherPlace: "高鐵台中站出口",
    contactName: "Cutefish",
    contactPhone: "",
    surveyUrl: "",
    videoUrl: "",
    albumUrl: "",
    references: ["https://travel.taichung.gov.tw/"],
    costs: [
      { category: "交通", item: "高鐵優惠票", amount: 1320 },
      { category: "包車", item: "中型巴士", amount: 900 },
      { category: "餐飲", item: "午餐與咖啡", amount: 850 }
    ],
    attendees: 12,
    schedule: [
      { day: "Day 1", time: "08:30", activity: "高鐵台中站集合" },
      { day: "Day 1", time: "10:00", activity: "新社花市散策" },
      { day: "Day 1", time: "14:30", activity: "審計新村自由活動" }
    ]
  }
];

const sampleData = {
  hero: {
    title: "跟著 Cutefish 去旅行",
    quote: "We travel not to escape life, but for life not to escape us.",
    image: "assets/hero-travel.png"
  },
  notices: [
    { text: "近期旅程請出發前三天更新天氣與集合資訊。" },
    { text: "新增旅遊後可用 LINE 公告快速分享給同行者。" }
  ],
  trips: sampleTrips,
  hotels: [
    { id: crypto.randomUUID(), name: "山月溫泉旅宿", city: "宜蘭縣", address: "宜蘭縣礁溪鄉德陽路", mapUrl: "https://maps.google.com/", price: 4, comfort: 5, breakfast: 4, location: 5, note: "離車站近，長輩移動方便。" }
  ],
  restaurants: [
    { id: crypto.randomUUID(), name: "綠桌蔬食", city: "宜蘭縣", address: "宜蘭縣礁溪鄉溫泉路", mapUrl: "https://maps.google.com/", price: 4, taste: 5, location: 4, environment: 5, note: "合菜選擇多，可先預約包廂。" }
  ],
  wishlist: [
    { id: crypto.randomUUID(), place: "花蓮雲山水", month: "10 月", priority: "high", tags: "賞景, 長輩友善, 兩天一夜", surveyStatus: "sent", inspirationLinks: ["https://www.taiwan.net.tw/"], wantCount: 6, bestSeason: "秋季", budget: 5000, surveyUrl: "https://forms.gle/example", note: "想安排兩天一夜，避開暑假人潮。" }
  ]
};

appState = loadLocalData();

function loadLocalData() {
  const saved = localStorage.getItem(storeKey);
  if (!saved) {
    localStorage.setItem(storeKey, JSON.stringify(sampleData));
    return structuredClone(sampleData);
  }
  const data = JSON.parse(saved);
  let changed = false;
  if (!data.hero) data.hero = structuredClone(sampleData.hero);
  if (!data.hero.image || data.hero.image === "assets/cutefish-banner.jpg") {
    data.hero.image = "assets/hero-travel.png";
    changed = true;
  }
  data.wishlist = (data.wishlist || []).map((item) => {
    const next = { priority: "medium", tags: "", surveyStatus: "notSent", inspirationLinks: [], wantCount: 0, bestSeason: "", budget: 0, surveyUrl: "", ...item, inspirationLinks: normalizeLinks(item.inspirationLinks) };
    if ("surveyUrl" in item && "wantCount" in item && "bestSeason" in item && "budget" in item && "priority" in item && "tags" in item && "surveyStatus" in item && "inspirationLinks" in item) return next;
    changed = true;
    return next;
  });
  if (changed) saveData(data);
  return data;
}

function loadData() {
  return appState;
}

function saveData(data) {
  appState = sanitizeData(data);
  localStorage.setItem(storeKey, JSON.stringify(appState));
  if (canWriteFirebase()) {
    firebaseState.docRef.set(appState).catch((error) => {
      console.error(error);
      alert("Firebase 儲存失敗，請檢查 Firestore 規則與管理員權限。");
    });
  }
}

function isAdmin() {
  if (firebaseState.configured) {
    return Boolean(firebaseState.user && isAdminEmail(firebaseState.user.email));
  }
  return localStorage.getItem(sessionKey) === "true";
}

function sanitizeData(data) {
  const clean = structuredClone(data || sampleData);
  if (!clean.hero) clean.hero = structuredClone(sampleData.hero);
  if (!clean.hero.image || clean.hero.image === "assets/cutefish-banner.jpg") {
    clean.hero.image = "assets/hero-travel.png";
  }
  clean.notices = normalizeNotices(clean.notices);
  clean.trips = clean.trips || [];
  clean.trips = clean.trips.map((trip) => ({
    status: "planning",
    checklist: [],
    mapUrl: "",
    coverImage: "",
    currentWeather: null,
    weatherForecastUpdatedAt: "",
    participants: [],
    review: "",
    gatherTime: "",
    gatherPlace: "",
    contactName: "",
    contactPhone: "",
    albumUrl: "",
    ...trip,
    checklist: normalizeChecklist(trip.checklist),
    participants: normalizeParticipants(trip.participants),
    costs: normalizeCosts(trip.costs)
  }));
  clean.hotels = clean.hotels || [];
  clean.restaurants = clean.restaurants || [];
  clean.wishlist = (clean.wishlist || []).map((item) => ({ priority: "medium", tags: "", surveyStatus: "notSent", inspirationLinks: [], wantCount: 0, bestSeason: "", budget: 0, surveyUrl: "", ...item, wantCount: Number(item.wantCount) || 0, budget: Number(item.budget) || 0, inspirationLinks: normalizeLinks(item.inspirationLinks) }));
  delete clean.updatedAt;
  return clean;
}

function isFirebaseConfigured() {
  const config = window.firebaseConfig || {};
  return Boolean(
    window.firebase &&
    config.apiKey &&
    config.projectId &&
    !String(config.apiKey).includes("PASTE_") &&
    !String(config.projectId).includes("PASTE_")
  );
}

function isAdminEmail(email) {
  const allowed = firebaseState.adminEmails.map((item) => item.toLowerCase());
  return allowed.includes(String(email || "").toLowerCase());
}

function canWriteFirebase() {
  return firebaseState.ready && firebaseState.docRef && isAdmin();
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.info("Firebase 尚未設定，網站目前使用瀏覽器本機資料。");
    render();
    return;
  }

  try {
    firebaseState.configured = true;
    firebaseState.adminEmails = window.firebaseAdminEmails || [];
    firebase.initializeApp(window.firebaseConfig);
    firebaseState.auth = firebase.auth();
    firebaseState.db = firebase.firestore();
    firebaseState.docRef = firebaseState.db.collection(firebaseCollection).doc(firebaseDocument);
    firebaseState.ready = true;

    firebaseState.auth.onAuthStateChanged((user) => {
      firebaseState.user = user;
      if (user && firebaseState.remoteMissing && isAdmin()) {
        saveData(appState);
        firebaseState.remoteMissing = false;
      }
      render();
    });

    firebaseState.docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        appState = sanitizeData(snapshot.data());
        localStorage.setItem(storeKey, JSON.stringify(appState));
        firebaseState.remoteMissing = false;
      } else {
        firebaseState.remoteMissing = true;
      }
      render();
    }, (error) => {
      console.error(error);
      alert("Firebase 讀取失敗，請檢查 Firestore 規則。網站會暫時使用本機資料。");
      render();
    });
  } catch (error) {
    console.error(error);
    alert("Firebase 初始化失敗，請確認 firebase-config.js 設定是否正確。");
    render();
  }
}

function money(value) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function fullDateText(value) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(parseLocalDate(value));
}

function dateText(start, end) {
  return start === end ? start : `${start} 至 ${end}`;
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function byDate(a, b) {
  return parseLocalDate(a.startDate) - parseLocalDate(b.startDate);
}

function upcomingTrips(data) {
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return data.trips.filter((trip) => parseLocalDate(trip.startDate) >= dayStart).sort(byDate);
}

function categoryTotals(costs) {
  return costs.reduce((totals, cost) => {
    const amount = Number(cost.amount) || 0;
    totals[cost.category] = (totals[cost.category] || 0) + amount;
    return totals;
  }, {});
}

function totalCost(costs) {
  return costs.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0);
}

function stars(value) {
  const count = Math.max(0, Math.min(5, Number(value) || 0));
  return `<span class="stars" aria-label="${count} 顆星">${"★".repeat(count)}${"☆".repeat(5 - count)}</span>`;
}

function render() {
  const data = loadData();
  document.body.classList.toggle("admin", isAdmin());
  document.getElementById("adminButton").textContent = isAdmin() ? "管理員登出" : "管理員登入";
  renderHero(data);
  renderNotices(data);
  renderCalendar(data);
  renderCountdown(data);
  renderTrips(data);
  renderQr();
  if (["hotels", "restaurants", "wishlist"].includes(currentView)) renderRecommendation(currentView);
  if (currentView === "allTrips") renderAllTrips();
  scheduleAutoWeatherRefresh();
}

function renderHero(data) {
  document.getElementById("heroTitle").textContent = data.hero.title;
  document.getElementById("heroQuote").textContent = data.hero.quote;
  document.getElementById("hero").style.backgroundImage =
    `linear-gradient(90deg, rgba(20, 43, 38, 0.78), rgba(20, 43, 38, 0.2)), url("${data.hero.image}")`;
}

function renderNotices(data) {
  const band = document.getElementById("noticeBand");
  const notices = normalizeNotices(data.notices);
  band.innerHTML = notices.length ? notices.map((notice) => `<p>${escapeHtml(notice.text)}</p>`).join("") : "";
  band.classList.toggle("hidden", !notices.length);
}

function renderCalendar(data) {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const tripDates = new Map();

  [...data.trips].sort(byDate).forEach((trip) => {
    const start = parseLocalDate(trip.startDate);
    const end = parseLocalDate(trip.endDate || trip.startDate);
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const key = localDateKey(date);
      if (!tripDates.has(key)) tripDates.set(key, trip);
    }
  });

  title.textContent = `${year} 年 ${month + 1} 月`;
  grid.innerHTML = "";
  for (let i = 0; i < firstDay; i += 1) grid.append(dayCell("", "empty"));
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month, day);
    const iso = localDateKey(date);
    const holiday = holidayName(iso);
    const classes = [
      iso === localDateKey(today) ? "today-day" : "",
      tripDates.has(iso) ? "trip-day" : "",
      holiday ? "holiday-day" : "",
      date.getDay() === 0 ? "sunday-day" : "",
      date.getDay() === 6 ? "saturday-day" : ""
    ].filter(Boolean).join(" ");
    grid.append(dayCell(day, classes, date, tripDates.get(iso), holiday));
  }
}

function dayCell(text, className, date, trip, holiday) {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = `day ${className}`;
  if (className === "empty") return cell;
  if (trip) {
    cell.dataset.trip = trip.id;
    cell.title = `查看 ${trip.title}`;
    cell.setAttribute("aria-label", `${localDateKey(date)} 查看 ${trip.title}`);
  } else if (holiday) {
    cell.title = holiday;
    cell.setAttribute("aria-label", `${localDateKey(date)} ${holiday}`);
  }
  const solar = document.createElement("span");
  solar.className = "solar-day";
  solar.textContent = text;
  const lunar = document.createElement("span");
  lunar.className = "lunar-day";
  lunar.textContent = lunarText(date);
  cell.append(solar, lunar);
  if (holiday) {
    const holidayLabel = document.createElement("span");
    holidayLabel.className = "holiday-label";
    holidayLabel.textContent = holiday;
    cell.append(holidayLabel);
  }
  return cell;
}

function holidayName(isoDate) {
  return taiwanHolidays[isoDate] || "";
}

function lunarText(date) {
  try {
    const parts = new Intl.DateTimeFormat("zh-TW-u-ca-chinese", {
      month: "long",
      day: "numeric"
    }).formatToParts(date);
    const month = parts.find((part) => part.type === "month")?.value || "";
    const day = Number(parts.find((part) => part.type === "day")?.value || 0);
    if (day === 1) return month;
    return lunarDayName(day);
  } catch {
    return "";
  }
}

function lunarDayName(day) {
  const ones = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (day <= 10) return `初${ones[day]}`;
  if (day < 20) return `十${ones[day - 10]}`;
  if (day === 20) return "二十";
  if (day < 30) return `廿${ones[day - 20]}`;
  return "三十";
}

function renderCountdown(data) {
  const next = upcomingTrips(data)[0];
  const title = document.getElementById("countdownTitle");
  const box = document.getElementById("countdown");
  const reminder = document.getElementById("countdownReminder");
  if (!next) {
    title.textContent = "目前沒有即將出發的旅遊";
    box.innerHTML = "";
    if (reminder) reminder.textContent = "";
    return;
  }
  title.textContent = next.title;
  const diff = Math.max(0, parseLocalDate(next.startDate).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (reminder) reminder.textContent = tripReminderText(days, next);
  box.innerHTML = `
    <div class="countdown-days">
      <span>${days}</span>
      <small>天後出發</small>
    </div>
    <div class="countdown-rest" aria-label="剩餘 ${hours} 時 ${minutes} 分 ${seconds} 秒">
      <span><strong>${hours}</strong><small>時</small></span>
      <span><strong>${minutes}</strong><small>分</small></span>
      <span><strong>${seconds}</strong><small>秒</small></span>
    </div>
  `;
}

function filteredTrips(trips) {
  const query = tripSearchQuery.trim().toLowerCase();
  return trips.filter((trip) => {
    const matchesStatus = tripStatusFilter === "all" || (trip.status || "planning") === tripStatusFilter;
    const haystack = [trip.title, trip.location, trip.tripNotes, trip.review, trip.gatherPlace].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesStatus && matchesQuery;
  });
}

function tripReminderText(days, trip) {
  if (days <= 3) return "出發前三天請更新天氣、確認集合資訊、行李與行前檢查清單。";
  if (days <= 7) return "出發前一週建議確認交通、住宿與同行人數。";
  return `目前狀態：${tripStatusText(trip.status)}。出發前三天記得再更新天氣與集合資訊。`;
}

function renderTrips(data) {
  const list = document.getElementById("tripList");
  const trips = filteredTrips(upcomingTrips(data)).slice(0, 6);
  list.innerHTML = trips.map((trip) => {
    const total = totalCost(trip.costs);
    const aa = total / Math.max(1, Number(trip.attendees) || 1);
    return `
      <article class="trip-card">
        ${trip.coverImage ? `<img class="trip-cover" src="${trip.coverImage}" alt="${escapeAttr(trip.title)} 封面圖" />` : ""}
        <div class="trip-card-main">
          <time>${dateText(trip.startDate, trip.endDate)}</time>
          <span class="tag status-tag status-${trip.status || "planning"}">${tripStatusText(trip.status)}</span>
          <h3>${trip.title}</h3>
          <p>${trip.location}</p>
          ${currentWeatherSnippet(trip)}
        </div>
        <div class="tag-list">
          <span class="tag">總費用 ${money(total)}</span>
          <span class="tag">AA ${money(aa)}</span>
          <span class="tag">${trip.attendees || 1} 人</span>
        </div>
        <div class="card-actions">
          <button type="button" data-trip="${trip.id}">查看詳情</button>
          ${currentWeatherButton(trip)}
          ${trip.mapUrl ? `<a href="${trip.mapUrl}" target="_blank" rel="noreferrer">Google Map</a>` : ""}
          <button class="admin-only" type="button" data-edit-trip="${trip.id}">編輯</button>
          <button class="admin-only" type="button" data-delete-trip="${trip.id}">刪除</button>
        </div>
      </article>
    `;
  }).join("") || `<article class="trip-card"><h3>找不到符合條件的旅遊</h3><p>可以調整搜尋或狀態篩選。</p></article>`;
}

function renderQr() {
  const img = document.getElementById("qrCode");
  const url = encodeURIComponent(location.href);
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${url}`;
}

function openTripFromHash() {
  const id = location.hash.startsWith("#trip-") ? location.hash.replace("#trip-", "") : "";
  if (id) showTrip(id);
}

function openRecommendationFromHash() {
  const match = location.hash.match(/^#rec-(hotels|restaurants)-(.+)$/);
  if (!match) return;
  const [, type, id] = match;
  renderRecommendation(type);
  requestAnimationFrame(() => {
    const card = document.getElementById(`rec-${type}-${id}`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.classList.add("highlight-card");
    setTimeout(() => card?.classList.remove("highlight-card"), 1800);
  });
}

function showTrip(id) {
  const data = loadData();
  const trip = data.trips.find((item) => item.id === id);
  if (!trip) return;
  const totals = categoryTotals(trip.costs);
  const total = totalCost(trip.costs);
  const aa = total / Math.max(1, Number(trip.attendees) || 1);
  const detail = document.getElementById("tripDetail");
  detail.dataset.tripId = id;
  detail.innerHTML = `
    <h2>${trip.title}</h2>
    <p><span class="tag status-tag status-${trip.status || "planning"}">${tripStatusText(trip.status)}</span></p>
    <p><strong>${dateText(trip.startDate, trip.endDate)}</strong>｜${trip.location}</p>
    <section class="gathering-highlight">
      <strong>集合資訊</strong>
      <p>${escapeHtml(gatheringText(trip))}</p>
    </section>
    <div class="card-actions detail-actions">
      <button type="button" data-copy-trip="${trip.id}">複製行程摘要</button>
      <button type="button" data-line-trip="${trip.id}">複製 LINE 公告</button>
      <button type="button" data-print-trip="${trip.id}">匯出 PDF</button>
      ${currentWeatherButton(trip)}
      ${trip.mapUrl ? `<a href="${trip.mapUrl}" target="_blank" rel="noreferrer">Google Map 導航</a>` : ""}
    </div>
    <section class="trip-qr-panel">
      <div>
        <strong>分享本旅程</strong>
        <p>手機掃描後可開啟這趟旅程。</p>
      </div>
      <img src="${tripQrUrl(trip.id)}" alt="${escapeAttr(trip.title)} QR Code" />
    </section>
    <p class="form-note" id="tripCopyNote"></p>
    ${currentWeatherPanel(trip)}
    <div class="detail-grid">
      ${detailBlock("集合資訊", gatheringText(trip))}
      ${detailBlock("交通", trip.transport)}
      ${detailBlock("住宿", trip.hotel)}
      ${detailBlock("景點", trip.attractions)}
      ${detailBlock("租車資訊", trip.carRental)}
      ${detailBlock("旅遊地點天氣預測", trip.weatherForecast)}
      ${detailBlock("行李清單建議", trip.luggageList)}
      ${detailBlock("備註", trip.tripNotes)}
      ${detailBlock("旅遊後回顧", trip.review)}
    </div>
    <section class="detail-section">
      <h3>行前檢查清單</h3>
      ${checklistHtml(trip.checklist)}
    </section>
    <section class="detail-section">
      <h3>報名名單與付款</h3>
      ${participantsHtml(trip.participants)}
    </section>
    <section class="detail-section">
      <h3>每日行程時間表</h3>
      <div class="schedule-table">
        ${trip.schedule.map((row) => `<div class="schedule-row"><strong>${row.day} ${row.time}</strong><span>${row.activity}</span></div>`).join("")}
      </div>
    </section>
    <section class="detail-section">
      <h3>費用明細與 AA 計算</h3>
      <div class="cost-table">
        ${trip.costs.map((cost) => `<div class="cost-row"><span>${cost.category}｜${cost.item}<small>${cost.status ? costStatusText(cost.status) : ""}</small></span><strong>${money(cost.amount)}</strong></div>`).join("")}
      </div>
      <p>${Object.entries(totals).map(([name, value]) => `${name} ${money(value)}`).join("，")}</p>
      <p class="total">總計 ${money(total)}，${trip.attendees || 1} 人 AA 每人 ${money(aa)}</p>
    </section>
    <section class="detail-section">
      <h3>參考網址</h3>
      ${linkList(trip.references)}
      <h3>行前調查</h3>
      ${trip.surveyUrl ? `<a href="${trip.surveyUrl}" target="_blank" rel="noreferrer">開啟 Google Form</a>` : "<p>尚未提供。</p>"}
      <h3>旅遊影片</h3>
      ${trip.videoUrl ? `<a href="${trip.videoUrl}" target="_blank" rel="noreferrer">觀看影片</a>` : "<p>旅遊後可放入影片網址。</p>"}
      <h3>旅遊相簿</h3>
      ${trip.albumUrl ? `<a href="${trip.albumUrl}" target="_blank" rel="noreferrer">開啟相簿</a>` : "<p>旅遊後可放入相簿網址。</p>"}
    </section>
  `;
  document.getElementById("tripDialog").showModal();
}

function gatheringText(trip) {
  return [
    trip.gatherTime ? `集合時間：${trip.gatherTime}` : "",
    trip.gatherPlace ? `集合地點：${trip.gatherPlace}` : "",
    trip.contactName ? `聯絡人：${trip.contactName}` : "",
    trip.contactPhone ? `聯絡電話：${trip.contactPhone}` : ""
  ].filter(Boolean).join("\n") || "尚未填寫。";
}

function detailBlock(title, text) {
  return `<section><h3>${title}</h3><p>${text || "尚未填寫。"}</p></section>`;
}

function linkList(links) {
  const valid = (links || []).filter(Boolean);
  if (!valid.length) return "<p>尚未提供。</p>";
  return `<ul>${valid.map((link) => `<li><a href="${link}" target="_blank" rel="noreferrer">${link}</a></li>`).join("")}</ul>`;
}

function openLogin() {
  if (isAdmin()) {
    if (firebaseState.configured && firebaseState.auth) {
      firebaseState.auth.signOut();
      return;
    }
    localStorage.removeItem(sessionKey);
    render();
    return;
  }
  document.getElementById("loginNote").textContent = "";
  document.getElementById("loginDialog").showModal();
}

function getAdmin() {
  const saved = localStorage.getItem(adminKey);
  return saved ? JSON.parse(saved) : null;
}

function setAdminFlow() {
  document.getElementById("adminDialogTitle").textContent = "設定管理員帳號";
  document.getElementById("adminFields").innerHTML = `
    ${input("email", "管理員 email", "", "email")}
    ${input("password", "管理員密碼", "", "password")}
  `;
  const dialog = document.getElementById("adminDialog");
  dialog.dataset.formType = "accountSetup";
  dialog.dataset.id = "";
  dialog.showModal();
}

function forgotPasswordFlow() {
  document.getElementById("adminDialogTitle").textContent = "重設管理員密碼";
  document.getElementById("adminFields").innerHTML = firebaseState.configured
    ? `${input("email", "管理員 email", "", "email")}`
    : `
      ${input("email", "管理員 email", "", "email")}
      ${input("password", "新密碼", "", "password")}
    `;
  const dialog = document.getElementById("adminDialog");
  dialog.dataset.formType = "accountReset";
  dialog.dataset.id = "";
  dialog.showModal();
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (firebaseState.configured) {
    if (!firebaseState.ready) {
      document.getElementById("loginNote").textContent = "Firebase 尚未連線完成，請稍候。";
      return;
    }
    try {
      const credential = await firebaseState.auth.signInWithEmailAndPassword(email, password);
      if (!isAdminEmail(credential.user.email)) {
        await firebaseState.auth.signOut();
        document.getElementById("loginNote").textContent = "這個 email 不在管理員清單中。";
        return;
      }
      document.getElementById("loginDialog").close();
      render();
    } catch (error) {
      console.error(error);
      document.getElementById("loginNote").textContent = firebaseAuthMessage(error);
    }
    return;
  }
  const admin = getAdmin();
  if (!admin) {
    document.getElementById("loginNote").textContent = "請先設定管理員帳號。";
    return;
  }
  if (email === admin.email && password === admin.password) {
    localStorage.setItem(sessionKey, "true");
    document.getElementById("loginDialog").close();
    render();
  } else {
    document.getElementById("loginNote").textContent = "Email 或密碼不正確。";
  }
}

function openTripForm(id) {
  const data = loadData();
  const trip = data.trips.find((item) => item.id === id) || {
    id: crypto.randomUUID(),
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    mapUrl: "",
    coverImage: "",
    status: "planning",
    currentWeather: null,
    weatherForecastUpdatedAt: "",
    transport: "",
    hotel: "",
    attractions: "",
    carRental: "",
    weatherForecast: "",
    luggageList: "",
    tripNotes: "",
    review: "",
    participants: [],
    checklist: [],
    gatherTime: "",
    gatherPlace: "",
    contactName: "",
    contactPhone: "",
    surveyUrl: "",
    videoUrl: "",
    albumUrl: "",
    references: [""],
    costs: [{ category: "交通", item: "", amount: 0 }],
    attendees: 1,
    schedule: [{ day: "Day 1", time: "09:00", activity: "" }]
  };
  document.getElementById("adminDialogTitle").textContent = id ? "編輯旅遊" : "新增旅遊";
  document.getElementById("adminFields").innerHTML = tripFields(trip);
  const dialog = document.getElementById("adminDialog");
  dialog.dataset.formType = "trip";
  dialog.dataset.id = trip.id;
  dialog.showModal();
}

function tripFields(trip) {
  return `
    <div class="admin-grid">
      ${input("title", "旅遊名稱", trip.title)}
      ${input("location", "地點", trip.location)}
      ${input("mapUrl", "主要地點 Google Map 連結", trip.mapUrl, "url")}
      ${input("coverImage", "旅程封面圖網址或檔案路徑", trip.coverImage, "url")}
      ${statusSelect(trip.status)}
      ${input("startDate", "開始日期", trip.startDate, "date")}
      ${input("endDate", "結束日期", trip.endDate, "date")}
      ${input("attendees", "同行人數", trip.attendees, "number")}
      ${input("gatherTime", "集合時間", trip.gatherTime)}
      ${input("gatherPlace", "集合地點", trip.gatherPlace)}
      ${input("contactName", "聯絡人", trip.contactName)}
      ${input("contactPhone", "聯絡電話", trip.contactPhone, "tel")}
      ${input("surveyUrl", "Google Form 行前調查網址", trip.surveyUrl, "url")}
      ${input("videoUrl", "旅遊影片網址", trip.videoUrl, "url")}
      ${input("albumUrl", "旅遊相簿網址", trip.albumUrl, "url")}
    </div>
    ${area("transport", "交通", trip.transport)}
    ${area("hotel", "住宿", trip.hotel)}
    ${area("attractions", "景點", trip.attractions)}
    ${area("carRental", "租車資訊", trip.carRental)}
    ${weatherForecastField(trip.weatherForecast)}
    ${area("luggageList", "行李清單建議", trip.luggageList)}
    ${area("participants", "報名名單，每行：姓名｜付款狀態｜金額｜備註", participantsText(trip.participants))}
    ${area("checklist", "行前檢查清單，每行一項；完成項目前面可加 ✓", checklistText(trip.checklist))}
    ${area("tripNotes", "備註", trip.tripNotes)}
    ${area("review", "旅遊後回顧 / 下次改進", trip.review)}
    ${area("references", "參考網址，每行一個", (trip.references || []).join("\n"))}
    ${area("costs", "費用明細，每行：分類｜項目｜金額｜狀態（預估/已確認/已付款）", (trip.costs || []).map((c) => `${c.category}｜${c.item}｜${c.amount}｜${costStatusText(c.status || "estimated")}`).join("\n"))}
    ${area("schedule", "每日行程時間表，每行：Day｜時間｜活動", (trip.schedule || []).map((s) => `${s.day}｜${s.time}｜${s.activity}`).join("\n"))}
  `;
}

function weatherForecastField(value) {
  return `
    <label>要去旅遊地點的天氣預測
      <textarea name="weatherForecast">${escapeHtml(value || "")}</textarea>
    </label>
    <button class="secondary weather-fetch" id="fetchWeatherButton" type="button">帶入天氣預測</button>
  `;
}

function statusSelect(value = "planning") {
  return `<label>旅程狀態<select name="status">${Object.entries(tripStatusLabels).map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
}

function tripStatusText(status) {
  return tripStatusLabels[status] || tripStatusLabels.planning;
}

function normalizeChecklist(items) {
  if (Array.isArray(items)) {
    return items.map((item) => {
      if (typeof item === "string") return { item, done: false };
      return { item: String(item.item || "").trim(), done: Boolean(item.done) };
    }).filter((item) => item.item);
  }
  return [];
}

function checklistText(items) {
  return normalizeChecklist(items).map((item) => `${item.done ? "✓ " : ""}${item.item}`).join("\n");
}

function checklistHtml(items) {
  const list = normalizeChecklist(items);
  if (!list.length) return "<p>尚未建立檢查清單。</p>";
  return `<ul class="checklist-view">${list.map((item) => `<li class="${item.done ? "done" : ""}"><span>${item.done ? "✓" : ""}</span>${escapeHtml(item.item)}</li>`).join("")}</ul>`;
}

function input(name, label, value, type = "text") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeAttr(value)}" ${type === "number" ? "min=\"1\"" : ""} /></label>`;
}

function area(name, label, value) {
  return `<label>${label}<textarea name="${name}">${escapeHtml(value || "")}</textarea></label>`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function saveTripForm(form, id) {
  const data = loadData();
  const formData = new FormData(form);
  const existingTrip = data.trips.find((item) => item.id === id);
  const trip = {
    id,
    title: formData.get("title").trim(),
    location: formData.get("location").trim(),
    mapUrl: formData.get("mapUrl").trim(),
    coverImage: formData.get("coverImage").trim(),
    status: formData.get("status") || "planning",
    currentWeather: existingTrip?.currentWeather || null,
    weatherForecastUpdatedAt: existingTrip?.weatherForecastUpdatedAt || "",
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || formData.get("startDate"),
    attendees: Number(formData.get("attendees")) || 1,
    transport: formData.get("transport").trim(),
    hotel: formData.get("hotel").trim(),
    attractions: formData.get("attractions").trim(),
    carRental: formData.get("carRental").trim(),
    weatherForecast: formData.get("weatherForecast").trim(),
    luggageList: formData.get("luggageList").trim(),
    checklist: parseChecklist(formData.get("checklist")),
    tripNotes: formData.get("tripNotes").trim(),
    review: formData.get("review").trim(),
    participants: parseParticipants(formData.get("participants")),
    gatherTime: formData.get("gatherTime").trim(),
    gatherPlace: formData.get("gatherPlace").trim(),
    contactName: formData.get("contactName").trim(),
    contactPhone: formData.get("contactPhone").trim(),
    surveyUrl: formData.get("surveyUrl").trim(),
    videoUrl: formData.get("videoUrl").trim(),
    albumUrl: formData.get("albumUrl").trim(),
    references: formData.get("references").split("\n").map((line) => line.trim()).filter(Boolean),
    costs: parseCosts(formData.get("costs")),
    schedule: parseSchedule(formData.get("schedule"))
  };
  const index = data.trips.findIndex((item) => item.id === id);
  if (index >= 0) data.trips[index] = trip;
  else data.trips.push(trip);
  saveData(data);
}

async function copyLineAnnouncement(id) {
  const trip = loadData().trips.find((item) => item.id === id);
  if (!trip) return;
  try {
    await navigator.clipboard.writeText(lineAnnouncementText(trip));
    document.getElementById("tripCopyNote").textContent = "LINE 公告已複製。";
  } catch (error) {
    console.error(error);
    document.getElementById("tripCopyNote").textContent = "複製失敗，請改用手動選取文字。";
  }
}

async function copyTripSummary(id) {
  const trip = loadData().trips.find((item) => item.id === id);
  if (!trip) return;
  const summary = tripSummaryText(trip);
  try {
    await navigator.clipboard.writeText(summary);
    document.getElementById("tripCopyNote").textContent = "行程摘要已複製，可以貼到 LINE。";
  } catch (error) {
    console.error(error);
    document.getElementById("tripCopyNote").textContent = "複製失敗，請改用手動選取文字。";
  }
}

function lineAnnouncementText(trip) {
  const total = totalCost(trip.costs);
  const aa = total / Math.max(1, Number(trip.attendees) || 1);
  return [
    `【${trip.title}】`,
    `日期：${dateText(trip.startDate, trip.endDate)}`,
    `集合：${[trip.gatherTime, trip.gatherPlace].filter(Boolean).join("｜") || "待公告"}`,
    `費用：AA 約 ${money(aa)}`,
    trip.surveyUrl ? `報名/調查：${trip.surveyUrl}` : "",
    trip.mapUrl ? `地圖：${trip.mapUrl}` : "",
    trip.tripNotes ? `備註：${trip.tripNotes}` : ""
  ].filter(Boolean).join("\n");
}

function tripSummaryText(trip) {
  const total = totalCost(trip.costs);
  const aa = total / Math.max(1, Number(trip.attendees) || 1);
  const firstSchedule = (trip.schedule || []).slice(0, 5).map((row) => `${row.day} ${row.time} ${row.activity}`).join("\n");
  return [
    `【${trip.title}】`,
    `日期：${dateText(trip.startDate, trip.endDate)}`,
    `狀態：${tripStatusText(trip.status)}`,
    `地點：${trip.location || "尚未填寫"}`,
    trip.mapUrl ? `Google Map：${trip.mapUrl}` : "",
    trip.gatherTime || trip.gatherPlace ? `集合：${[trip.gatherTime, trip.gatherPlace].filter(Boolean).join("｜")}` : "",
    trip.contactName || trip.contactPhone ? `聯絡：${[trip.contactName, trip.contactPhone].filter(Boolean).join("｜")}` : "",
    `人數：${trip.attendees || 1} 人`,
    `費用：總計 ${money(total)}，AA 每人 ${money(aa)}`,
    trip.weatherForecast ? `天氣：${trip.weatherForecast}` : "",
    trip.luggageList ? `行李建議：${trip.luggageList}` : "",
    trip.participants?.length ? `報名名單：\n${participantsText(trip.participants)}` : "",
    trip.checklist?.length ? `行前檢查：\n${checklistText(trip.checklist)}` : "",
    firstSchedule ? `行程：\n${firstSchedule}` : "",
    trip.surveyUrl ? `行前調查：${trip.surveyUrl}` : "",
    trip.videoUrl ? `影片：${trip.videoUrl}` : "",
    trip.albumUrl ? `相簿：${trip.albumUrl}` : "",
    trip.tripNotes ? `備註：${trip.tripNotes}` : "",
    trip.review ? `旅遊後回顧：${trip.review}` : ""
  ].filter(Boolean).join("\n");
}

function recommendationQrUrl(type, id) {
  const url = new URL(location.href);
  url.hash = `rec-${type}-${id}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url.toString())}`;
}

function recommendationSharePanel(type, item) {
  if (!["hotels", "restaurants"].includes(type)) return "";
  return `
    <section class="recommend-qr-panel">
      <div>
        <strong>分享本推薦</strong>
        <p>手機掃描可開啟這筆推薦。</p>
      </div>
      <img src="${recommendationQrUrl(type, item.id)}" alt="${escapeAttr(item.name)} QR Code" />
    </section>`;
}

function recommendationSummaryText(type, item) {
  if (type === "hotels") {
    return [
      `【飯店推薦】${item.name}`,
      `城市：${item.city || "尚未填寫"}`,
      `地址：${item.address || "尚未填寫"}`,
      item.mapUrl ? `Google Map：${item.mapUrl}` : "",
      `價位：${ratingText(item.price)}`,
      `舒適度：${ratingText(item.comfort)}`,
      `早餐：${ratingText(item.breakfast)}`,
      `地點：${ratingText(item.location)}`,
      item.note ? `備註：${item.note}` : ""
    ].filter(Boolean).join("\n");
  }
  return [
    `【蔬食餐廳推薦】${item.name}`,
    `城市：${item.city || "尚未填寫"}`,
    `地址：${item.address || "尚未填寫"}`,
    item.mapUrl ? `Google Map：${item.mapUrl}` : "",
    `價位：${ratingText(item.price)}`,
    `美味：${ratingText(item.taste)}`,
    `地點：${ratingText(item.location)}`,
    `用餐環境：${ratingText(item.environment)}`,
    item.note ? `備註：${item.note}` : ""
  ].filter(Boolean).join("\n");
}

function ratingText(value) {
  const count = Math.max(0, Math.min(5, Number(value) || 0));
  return `${count}/5`;
}

async function copyRecommendationSummary(type, id) {
  const item = loadData()[type]?.find((entry) => entry.id === id);
  if (!item) return;
  const note = document.getElementById("recommendationNote");
  try {
    await navigator.clipboard.writeText(recommendationSummaryText(type, item));
    if (note) note.textContent = "推薦摘要已複製，可以貼到 LINE 或訊息裡。";
  } catch (error) {
    console.error(error);
    if (note) note.textContent = "複製失敗，請改用手動選取文字。";
  }
}

function exportRecommendationPdf(type, id) {
  const item = loadData()[type]?.find((entry) => entry.id === id);
  if (!item) return;
  const printArea = document.getElementById("printArea");
  const originalTitle = document.title;
  printArea.innerHTML = recommendationPrintHtml(type, item);
  printArea.setAttribute("aria-hidden", "false");
  document.title = `${safeFileName(item.name)}-${type === "hotels" ? "hotel" : "restaurant"}`;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
    printArea.setAttribute("aria-hidden", "true");
  }, 500);
}

function recommendationPrintHtml(type, item) {
  const title = type === "hotels" ? "飯店推薦" : "蔬食餐廳推薦";
  const ratingRows = type === "hotels"
    ? [["價位", item.price], ["舒適度", item.comfort], ["早餐", item.breakfast], ["地點", item.location]]
    : [["價位", item.price], ["美味", item.taste], ["地點", item.location], ["用餐環境", item.environment]];
  return `
    <article class="print-document">
      <header class="print-header">
        <p>跟著 Cutefish 去旅行</p>
        <h1>${escapeHtml(item.name)}</h1>
        <div>${escapeHtml(title)}｜${escapeHtml(item.city || "尚未填寫城市")}</div>
      </header>
      <section class="print-grid">
        ${printBlock("地址", item.address)}
        ${printBlock("備註", item.note)}
        ${ratingRows.map(([label, value]) => printBlock(label, ratingText(value))).join("")}
      </section>
      <section class="print-section">
        <h2>連結</h2>
        ${printLinkList([["Google Map", item.mapUrl], ["分享網址", recommendationShareUrl(type, item.id)]])}
      </section>
    </article>
  `;
}

function recommendationShareUrl(type, id) {
  const url = new URL(location.href);
  url.hash = `rec-${type}-${id}`;
  return url.toString();
}

function exportTripPdf(id) {
  const trip = loadData().trips.find((item) => item.id === id);
  if (!trip) return;
  const printArea = document.getElementById("printArea");
  const originalTitle = document.title;
  printArea.innerHTML = tripPrintHtml(trip);
  printArea.setAttribute("aria-hidden", "false");
  document.title = `${safeFileName(trip.title)}-${trip.startDate || "travel"}`;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
    printArea.setAttribute("aria-hidden", "true");
  }, 500);
}

function tripPrintHtml(trip) {
  const total = totalCost(trip.costs);
  const aa = total / Math.max(1, Number(trip.attendees) || 1);
  return `
    <article class="print-document">
      <header class="print-header">
        <p>跟著 Cutefish 去旅行</p>
        <h1>${escapeHtml(trip.title)}</h1>
        <div>${escapeHtml(tripStatusText(trip.status))}｜${escapeHtml(dateText(trip.startDate, trip.endDate))}｜${escapeHtml(trip.location || "尚未填寫地點")}</div>
      </header>
      <section class="print-grid">
        ${printBlock("集合資訊", gatheringText(trip))}
        ${printBlock("交通", trip.transport)}
        ${printBlock("住宿", trip.hotel)}
        ${printBlock("景點", trip.attractions)}
        ${printBlock("租車資訊", trip.carRental)}
        ${printBlock("天氣預測", trip.weatherForecast)}
        ${printBlock("行李清單建議", trip.luggageList)}
        ${printBlock("行前檢查清單", checklistText(trip.checklist) || "尚未建立檢查清單。")}
        ${printBlock("備註", trip.tripNotes)}
        ${printBlock("旅遊後回顧", trip.review)}
      </section>
      <section class="print-section">
        <h2>報名名單與付款</h2>
        ${printParticipants(trip.participants)}
      </section>
      <section class="print-section">
        <h2>每日行程時間表</h2>
        <table>
          <tbody>
            ${(trip.schedule || []).map((row) => `<tr><th>${escapeHtml(`${row.day} ${row.time}`)}</th><td>${escapeHtml(row.activity || "")}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
      <section class="print-section">
        <h2>費用明細與 AA 計算</h2>
        <table>
          <tbody>
            ${(trip.costs || []).map((cost) => `<tr><td>${escapeHtml(`${cost.category}｜${cost.item}｜${costStatusText(cost.status || "estimated")}`)}</td><td>${escapeHtml(money(cost.amount))}</td></tr>`).join("")}
          </tbody>
        </table>
        <p class="print-total">總計 ${escapeHtml(money(total))}，${trip.attendees || 1} 人 AA 每人 ${escapeHtml(money(aa))}</p>
      </section>
      <section class="print-section">
        <h2>連結</h2>
        ${printLinkList([
          ["行前調查", trip.surveyUrl],
          ["旅遊影片", trip.videoUrl],
          ["旅遊相簿", trip.albumUrl],
          ["Google Map", trip.mapUrl],
          ...(trip.references || []).map((link, index) => [`參考網址 ${index + 1}`, link])
        ])}
      </section>
    </article>
  `;
}

function printBlock(title, text) {
  return `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text || "尚未填寫。")}</p></section>`;
}

function printLinkList(items) {
  const valid = items.filter(([, url]) => url);
  if (!valid.length) return "<p>尚未提供。</p>";
  return `<ul>${valid.map(([label, url]) => `<li><strong>${escapeHtml(label)}：</strong>${escapeHtml(url)}</li>`).join("")}</ul>`;
}

function safeFileName(value) {
  return String(value || "travel").replace(/[\/:*?"<>|]/g, "-").slice(0, 60);
}

function scheduleAutoWeatherRefresh() {
  if (autoWeatherRefreshRunning) return;
  const tripIds = loadData().trips.filter(shouldAutoRefreshWeather).map((trip) => trip.id);
  if (!tripIds.length) return;
  autoWeatherRefreshRunning = true;
  setTimeout(() => refreshUpcomingWeatherForecasts(tripIds).finally(() => {
    autoWeatherRefreshRunning = false;
  }), 0);
}

function shouldAutoRefreshWeather(trip) {
  if ((trip.status || "planning") !== "planning") return false;
  if (!trip.location || !trip.startDate) return false;
  const daysAway = daysUntilTrip(trip.startDate);
  if (daysAway < 0 || daysAway > 7) return false;
  const todayKey = localDateKey(today);
  const attemptKey = `weatherAutoAttempt:${trip.id}:${todayKey}`;
  if (sessionStorage.getItem(attemptKey)) return false;
  const updatedAt = trip.weatherForecastUpdatedAt ? new Date(trip.weatherForecastUpdatedAt) : null;
  if (!updatedAt || Number.isNaN(updatedAt.getTime())) return true;
  return localDateKey(updatedAt) !== todayKey;
}

async function refreshUpcomingWeatherForecasts(tripIds) {
  const data = loadData();
  let changed = false;
  for (const id of tripIds) {
    const trip = data.trips.find((item) => item.id === id);
    if (!trip || !shouldAutoRefreshWeather(trip)) continue;
    sessionStorage.setItem(`weatherAutoAttempt:${trip.id}:${localDateKey(today)}`, "true");
    try {
      trip.weatherForecast = await getWeatherForecast(trip.location, trip.startDate);
      trip.weatherForecastUpdatedAt = new Date().toISOString();
      changed = true;
    } catch (error) {
      console.error("自動更新天氣失敗", error);
    }
  }
  if (changed) {
    saveData(data);
    render();
  }
}

function currentWeatherButton(trip) {
  if ((trip.status || "planning") !== "planning") return "";
  return `<button type="button" data-current-weather="${trip.id}">更新即時天氣</button>`;
}

function currentWeatherSnippet(trip) {
  if (!trip.currentWeather) return "";
  return `<p class="current-weather-mini">${escapeHtml(currentWeatherShortText(trip.currentWeather))}</p>`;
}

function currentWeatherPanel(trip) {
  if (!trip.currentWeather) {
    if ((trip.status || "planning") !== "planning") return "";
    return `
      <section class="current-weather-panel empty-weather">
        <strong>當地即時天氣</strong>
        <p>尚未更新，按「更新即時天氣」即可讀取現在狀況。</p>
      </section>`;
  }
  return `
    <section class="current-weather-panel">
      <div>
        <strong>當地即時天氣</strong>
        <p>${escapeHtml(currentWeatherUpdatedText(trip.currentWeather))}</p>
      </div>
      <div class="weather-now-main">${escapeHtml(Math.round(trip.currentWeather.temperature))}°C</div>
      <div class="weather-now-meta">
        <span>${escapeHtml(trip.currentWeather.condition)}</span>
        <span>體感 ${escapeHtml(Math.round(trip.currentWeather.apparentTemperature))}°C</span>
        <span>濕度 ${escapeHtml(Math.round(trip.currentWeather.humidity))}%</span>
        <span>降雨 ${escapeHtml(Number(trip.currentWeather.precipitation) || 0)} mm</span>
        <span>風速 ${escapeHtml(Math.round(trip.currentWeather.windSpeed))} km/h</span>
      </div>
    </section>`;
}

function currentWeatherShortText(weather) {
  return `現在 ${Math.round(weather.temperature)}°C，${weather.condition}｜${currentWeatherUpdatedText(weather)}`;
}

function currentWeatherUpdatedText(weather) {
  return `${weather.placeName || "旅遊地點"}，更新 ${formatWeatherTime(weather.updatedAt)}`;
}

function formatWeatherTime(value) {
  if (!value) return "剛剛";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

async function updateTripCurrentWeather(id, button) {
  const data = loadData();
  const trip = data.trips.find((item) => item.id === id);
  if (!trip) return;
  if (!trip.location) {
    alert("請先在旅程裡填寫旅遊地點。");
    return;
  }
  const originalText = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "讀取中...";
  }
  try {
    trip.currentWeather = await getCurrentWeather(trip.location);
    saveData(data);
    const detailOpen = document.getElementById("tripDetail")?.dataset.tripId === id;
    render();
    if (detailOpen) showTrip(id);
  } catch (error) {
    console.error(error);
    alert("即時天氣讀取失敗，請稍後再試，或確認旅遊地點是否能搜尋到。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

async function getCurrentWeather(location) {
  const place = await geocodePlace(location);
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: "weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m",
    timezone: "auto"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Current weather request failed");
  const data = await response.json();
  const current = data.current || {};
  return {
    placeName: [place.name, place.admin1, place.country].filter(Boolean).join("，"),
    condition: weatherCodeText(current.weather_code),
    temperature: Number(current.temperature_2m) || 0,
    apparentTemperature: Number(current.apparent_temperature) || 0,
    humidity: Number(current.relative_humidity_2m) || 0,
    precipitation: Number(current.precipitation) || 0,
    windSpeed: Number(current.wind_speed_10m) || 0,
    updatedAt: current.time || new Date().toISOString()
  };
}

async function geocodePlace(location) {
  for (const candidate of locationCandidates(location)) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&language=zh&format=json`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Geocoding request failed");
    const geoData = await geoResponse.json();
    const place = geoData.results?.[0];
    if (place) return place;
  }
  throw new Error("Location not found");
}

function locationCandidates(location) {
  const base = String(location || "").trim();
  const shortName = base.split(/[，,、｜|\s]/)[0];
  const variants = [base, shortName];
  [base, shortName].forEach((name) => {
    if (!name) return;
    variants.push(name.replace(/台/g, "臺"));
    variants.push(name.replace(/臺/g, "台"));
    if (!/[市縣]$/.test(name)) {
      variants.push(`${name}市`, `${name}縣`);
      variants.push(`${name.replace(/台/g, "臺")}市`, `${name.replace(/台/g, "臺")}縣`);
      variants.push(`${name.replace(/臺/g, "台")}市`, `${name.replace(/臺/g, "台")}縣`);
    }
  });
  return [...new Set(variants.filter(Boolean))];
}

async function fetchTripWeather() {
  const form = document.getElementById("adminForm");
  const button = document.getElementById("fetchWeatherButton");
  const location = form.elements.location?.value.trim();
  const startDate = form.elements.startDate?.value;
  const weatherField = form.elements.weatherForecast;
  if (!location) {
    alert("請先填寫旅遊地點。");
    return;
  }

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "查詢中...";

  try {
    weatherField.value = await getWeatherForecast(location, startDate);
  } catch (error) {
    console.error(error);
    alert("天氣預測帶入失敗，請稍後再試，或先手動填寫。");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function getWeatherForecast(location, startDate) {
  const place = await geocodePlace(location);

  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto"
  });
  const requestedStart = forecastStartDate(startDate);
  if (requestedStart) {
    const requestedEnd = new Date(parseLocalDate(requestedStart));
    requestedEnd.setDate(requestedEnd.getDate() + 4);
    params.set("start_date", requestedStart);
    params.set("end_date", localDateKey(requestedEnd));
  } else {
    params.set("forecast_days", "5");
  }

  const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!forecastResponse.ok) throw new Error("Forecast request failed");
  const forecastData = await forecastResponse.json();
  return formatWeatherForecast(location, place, forecastData, Boolean(requestedStart), startDate);
}

function forecastStartDate(startDate) {
  const daysAway = daysUntilTrip(startDate);
  if (daysAway < 0 || daysAway > 15) return "";
  return startDate;
}

function formatWeatherForecast(location, place, forecastData, matchesTripDate, startDate = "") {
  const daily = forecastData.daily || {};
  const placeName = [place.name, place.admin1, place.country].filter(Boolean).join("，");
  const forecastDays = (daily.time || []).map((date, index) => ({
    date,
    min: Math.round(daily.temperature_2m_min?.[index]),
    max: Math.round(daily.temperature_2m_max?.[index]),
    rain: daily.precipitation_probability_max?.[index] ?? 0,
    code: daily.weather_code?.[index],
    weather: weatherCodeText(daily.weather_code?.[index])
  }));
  const lines = forecastDays.map((day) => `${fullDateText(day.date)}：${day.weather}，${day.min}-${day.max} 度，降雨機率最高 ${day.rain}%`);
  const daysAway = daysUntilTrip(startDate);
  const timing = daysAway >= 0 && daysAway <= 3 ? "出發前三天內" : daysAway >= 0 && daysAway <= 7 ? "出發前一週內" : "近期";
  const note = matchesTripDate
    ? `已自動更新 ${location} 旅遊日期附近的天氣預測（${timing}）：`
    : `目前只能自動抓近期天氣，以下為 ${location}（${placeName}）未來 5 天預測；出發前三天建議再更新一次：`;
  return [note, ...lines, "", travelWeatherAdvice(forecastDays, daysAway)].filter(Boolean).join("\n");
}

function travelWeatherAdvice(days, daysAway) {
  if (!days.length) return "";
  const maxTemp = Math.max(...days.map((day) => day.max).filter(Number.isFinite));
  const minTemp = Math.min(...days.map((day) => day.min).filter(Number.isFinite));
  const maxRain = Math.max(...days.map((day) => Number(day.rain) || 0));
  const hasRain = days.some((day) => [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(Number(day.code)) || Number(day.rain) >= 40);
  const advice = [];
  if (hasRain) advice.push("攜帶摺疊傘或輕便雨衣，鞋子建議選防滑好走的款式");
  if (Number.isFinite(maxTemp) && maxTemp >= 30) advice.push("天氣偏熱，準備帽子、防曬、補水用品");
  if (Number.isFinite(minTemp) && minTemp <= 18) advice.push("早晚偏涼，帶薄外套或圍巾");
  if (!advice.length) advice.push("天氣看起來穩定，仍建議出發前一天再確認一次");
  const prefix = daysAway >= 0 && daysAway <= 3 ? "臨行建議" : "準備建議";
  return `${prefix}：${advice.join("；")}。`;
}

function daysUntilTrip(startDate) {
  if (!startDate) return Infinity;
  const tripStart = parseLocalDate(startDate);
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((tripStart - dayStart) / 86400000);
}

function weatherCodeText(code) {
  const labels = {
    0: "晴朗",
    1: "大致晴朗",
    2: "局部多雲",
    3: "陰天",
    45: "有霧",
    48: "霧淞",
    51: "毛毛雨",
    53: "毛毛雨",
    55: "較強毛毛雨",
    56: "凍毛毛雨",
    57: "較強凍毛毛雨",
    61: "小雨",
    63: "降雨",
    65: "大雨",
    66: "凍雨",
    67: "較強凍雨",
    71: "小雪",
    73: "降雪",
    75: "大雪",
    77: "雪粒",
    80: "短暫陣雨",
    81: "陣雨",
    82: "強陣雨",
    85: "短暫陣雪",
    86: "強陣雪",
    95: "雷雨",
    96: "雷雨伴隨冰雹",
    99: "強雷雨伴隨冰雹"
  };
  return labels[code] || "天氣狀況未明";
}

function normalizeNotices(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({ text: String(item.text || item || "").trim() })).filter((item) => item.text);
}

function parseNotices(text) {
  return String(text || "").split("\n").map((line) => ({ text: line.trim() })).filter((item) => item.text);
}

function costStatusText(status = "estimated") {
  const labels = { estimated: "預估", confirmed: "已確認", paid: "已付款" };
  return labels[status] || status || "預估";
}

function costStatusKey(value = "estimated") {
  const text = String(value).trim();
  const map = { 預估: "estimated", 已確認: "confirmed", 已付款: "paid", estimated: "estimated", confirmed: "confirmed", paid: "paid" };
  return map[text] || "estimated";
}

function normalizeCosts(costs) {
  return (costs || []).map((cost) => ({ status: "estimated", ...cost, status: costStatusKey(cost.status || "estimated") }));
}

function normalizeParticipants(items) {
  if (!Array.isArray(items)) return [];
  return items.map((person) => ({
    name: String(person.name || "").trim(),
    paymentStatus: costStatusKey(person.paymentStatus || "estimated"),
    amount: Number(person.amount) || 0,
    note: String(person.note || "").trim()
  })).filter((person) => person.name);
}

function participantsText(items) {
  return normalizeParticipants(items).map((person) => `${person.name}｜${costStatusText(person.paymentStatus)}｜${person.amount || ""}｜${person.note || ""}`).join("\n");
}

function parseParticipants(text) {
  return String(text || "").split("\n").map((line) => {
    const [name = "", paymentStatus = "預估", amount = "", note = ""] = line.split("｜").map((part) => part.trim());
    return { name, paymentStatus: costStatusKey(paymentStatus), amount: Number(String(amount).replaceAll(",", "")) || 0, note };
  }).filter((person) => person.name);
}

function participantsHtml(items) {
  const people = normalizeParticipants(items);
  if (!people.length) return "<p>尚未建立報名名單。</p>";
  return `<div class="participant-list">${people.map((person) => `<div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(costStatusText(person.paymentStatus))}</span><span>${person.amount ? escapeHtml(money(person.amount)) : ""}</span><small>${escapeHtml(person.note)}</small></div>`).join("")}</div>`;
}

function printParticipants(items) {
  const people = normalizeParticipants(items);
  if (!people.length) return "<p>尚未建立報名名單。</p>";
  return `<table><tbody>${people.map((person) => `<tr><th>${escapeHtml(person.name)}</th><td>${escapeHtml(costStatusText(person.paymentStatus))} ${person.amount ? escapeHtml(money(person.amount)) : ""} ${escapeHtml(person.note)}</td></tr>`).join("")}</tbody></table>`;
}

function parseCosts(text) {
  return text.split("\n").map((line) => {
    const [category = "其他", item = "", amount = "0", status = "預估"] = line.split("｜").map((part) => part.trim());
    return { category, item, amount: Number(amount.replaceAll(",", "")) || 0, status: costStatusKey(status) };
  }).filter((cost) => cost.item || cost.amount);
}

function parseChecklist(text) {
  return String(text || "").split("\n").map((line) => {
    const raw = line.trim();
    const done = /^[✓✔xX]\s*/.test(raw);
    const item = raw.replace(/^[✓✔xX]\s*/, "").trim();
    return { item, done };
  }).filter((item) => item.item);
}

function parseSchedule(text) {
  return text.split("\n").map((line) => {
    const [day = "Day 1", time = "", activity = ""] = line.split("｜").map((part) => part.trim());
    return { day, time, activity };
  }).filter((row) => row.activity);
}

function openHeroForm() {
  const data = loadData();
  document.getElementById("adminDialogTitle").textContent = "首頁大圖與文字";
  document.getElementById("adminFields").innerHTML = `
    ${input("title", "首頁標題", data.hero.title)}
    ${input("quote", "首頁文字", data.hero.quote)}
    ${input("image", "大圖網址或檔案路徑", data.hero.image)}
    ${area("notices", "首頁小通知，每行一則", normalizeNotices(data.notices).map((notice) => notice.text).join("\n"))}
  `;
  const dialog = document.getElementById("adminDialog");
  dialog.dataset.formType = "hero";
  dialog.dataset.id = "";
  dialog.showModal();
}

function saveHeroForm(form) {
  const data = loadData();
  const formData = new FormData(form);
  data.hero = {
    title: formData.get("title").trim(),
    quote: formData.get("quote").trim(),
    image: formData.get("image").trim() || "assets/hero-travel.png"
  };
  data.notices = parseNotices(formData.get("notices"));
  saveData(data);
}

async function saveAccountForm(form, mode) {
  const formData = new FormData(form);
  const email = formData.get("email").trim();
  const password = formData.get("password");
  if (firebaseState.configured) {
    if (!email || (mode === "accountSetup" && !password)) {
      document.getElementById("loginNote").textContent = "請填寫 email 與密碼。";
      return false;
    }
    if (!isAdminEmail(email)) {
      document.getElementById("loginNote").textContent = "請先把這個 email 加到 firebaseAdminEmails。";
      return false;
    }
    try {
      if (mode === "accountSetup") {
        await firebaseState.auth.createUserWithEmailAndPassword(email, password);
        document.getElementById("loginNote").textContent = "Firebase 管理員帳號已建立並登入。";
      } else {
        await firebaseState.auth.sendPasswordResetEmail(email);
        document.getElementById("loginNote").textContent = "密碼重設信已寄出，請到信箱收信。";
      }
      return true;
    } catch (error) {
      console.error(error);
      document.getElementById("loginNote").textContent = firebaseAuthMessage(error);
      return false;
    }
  }
  if (!email || !password) {
    document.getElementById("loginNote").textContent = "請填寫 email 與密碼。";
    return false;
  }
  const admin = getAdmin();
  if (mode === "accountReset" && admin && email !== admin.email) {
    document.getElementById("loginNote").textContent = "找不到這個管理員 email。";
    return false;
  }
  localStorage.setItem(adminKey, JSON.stringify({ email, password }));
  document.getElementById("loginNote").textContent = mode === "accountReset" ? "密碼已重設，請重新登入。" : "管理員帳號已設定，請登入。";
  return true;
}

function firebaseAuthMessage(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "這個 Firebase 管理員帳號已存在，請直接登入；忘記密碼可按「忘記密碼」。",
    "auth/operation-not-allowed": "Firebase 尚未啟用 Email/Password 登入，請到 Authentication > Sign-in method 開啟。",
    "auth/weak-password": "密碼太短，請至少使用 6 個字元。",
    "auth/invalid-email": "Email 格式不正確，請重新檢查。",
    "auth/user-not-found": "找不到這個 Firebase 帳號，請先設定管理員帳號。",
    "auth/wrong-password": "密碼不正確，請重新輸入或使用忘記密碼。",
    "auth/invalid-credential": "Email 或密碼不正確，請重新輸入。",
    "auth/unauthorized-domain": "這個網址尚未加入 Firebase 授權網域，請到 Authentication > Settings > Authorized domains 加入目前網域。",
    "auth/network-request-failed": "網路連線失敗，請確認目前可以連上 Firebase。"
  };
  return messages[code] || `Firebase 帳號處理失敗：${code || "未知錯誤"}`;
}

function tripQrUrl(id) {
  const url = new URL(location.href);
  url.hash = `trip-${id}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(url.toString())}`;
}

function renderAllTrips() {
  currentView = "allTrips";
  document.querySelector(".layout").classList.add("hidden");
  document.getElementById("recommendationView").classList.add("hidden");
  document.getElementById("allTripsView")?.classList.add("hidden");
  document.getElementById("allTripsView").classList.remove("hidden");
  const trips = [...loadData().trips].sort(byDate);
  document.getElementById("allTripList").innerHTML = groupedTripsHtml(trips);
}

function groupedTripsHtml(trips) {
  if (!trips.length) return `<article class="trip-card"><h3>尚未建立旅程</h3><p>管理員可以新增第一趟旅遊。</p></article>`;
  const groups = trips.reduce((map, trip) => {
    const month = (trip.startDate || "未排日期").slice(0, 7);
    if (!map.has(month)) map.set(month, []);
    map.get(month).push(trip);
    return map;
  }, new Map());
  return [...groups.entries()].map(([month, items]) => `
    <section class="trip-month-group">
      <h3>${monthLabel(month)}</h3>
      <div class="trip-list">${items.map((trip) => allTripCard(trip)).join("")}</div>
    </section>
  `).join("");
}

function allTripCard(trip) {
  const total = totalCost(trip.costs || []);
  return `
    <article class="trip-card">
      ${trip.coverImage ? `<img class="trip-cover" src="${trip.coverImage}" alt="${escapeAttr(trip.title)} 封面圖" />` : ""}
      <div class="trip-card-main">
        <time>${dateText(trip.startDate, trip.endDate)}</time>
        <span class="tag status-tag status-${trip.status || "planning"}">${tripStatusText(trip.status)}</span>
        <h3>${trip.title}</h3>
        <p>${trip.location}</p>
        ${currentWeatherSnippet(trip)}
      </div>
      <div class="tag-list"><span class="tag">總費用 ${money(total)}</span><span class="tag">${trip.attendees || 1} 人</span></div>
      <div class="card-actions">
        <button type="button" data-trip="${trip.id}">查看詳情</button>
        ${currentWeatherButton(trip)}
        ${trip.mapUrl ? `<a href="${trip.mapUrl}" target="_blank" rel="noreferrer">Google Map</a>` : ""}
        <button class="admin-only" type="button" data-edit-trip="${trip.id}">編輯</button>
      </div>
    </article>
  `;
}

function monthLabel(month) {
  if (month === "未排日期") return month;
  const [year, value] = month.split("-");
  return `${year} 年 ${Number(value)} 月`;
}

function showHome() {
  currentView = "home";
  document.querySelector(".layout").classList.remove("hidden");
  document.getElementById("recommendationView").classList.add("hidden");
  document.getElementById("allTripsView")?.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRecommendation(type) {
  const data = loadData();
  const titleMap = { hotels: "飯店推薦", restaurants: "蔬食餐廳推薦", wishlist: "許願清單" };
  currentView = type;
  document.querySelector(".layout").classList.add("hidden");
  document.getElementById("allTripsView")?.classList.add("hidden");
  document.getElementById("recommendationView").classList.remove("hidden");
  document.getElementById("recommendationTitle").textContent = titleMap[type];
  const note = document.getElementById("recommendationNote");
  if (note) note.textContent = "";
  document.getElementById("recommendationGrid").innerHTML = data[type].map((item) => recommendationCard(type, item)).join("") ||
    `<article class="recommend-card"><h3>尚未新增</h3><p>管理員登入後可以新增內容。</p></article>`;
}

function recommendationCard(type, item) {
  if (type === "hotels") {
    return `
      <article class="recommend-card" id="rec-${type}-${item.id}">
        <h3>${item.name}</h3>
        <p>${item.city || "尚未填寫城市"}</p>
        <p>${item.address || "尚未填寫地址"}</p>
        ${item.mapUrl ? `<p><a href="${item.mapUrl}" target="_blank" rel="noreferrer">Google Map</a></p>` : ""}
        <p>價位 ${stars(item.price)}</p><p>舒適度 ${stars(item.comfort)}</p><p>早餐 ${stars(item.breakfast)}</p><p>地點 ${stars(item.location)}</p>
        <p>${item.note || ""}</p>
        ${recommendationSharePanel(type, item)}
        ${recommendActions(type, item.id)}
      </article>`;
  }
  if (type === "restaurants") {
    return `
      <article class="recommend-card" id="rec-${type}-${item.id}">
        <h3>${item.name}</h3>
        <p>${item.city || "尚未填寫城市"}</p>
        <p>${item.address || "尚未填寫地址"}</p>
        ${item.mapUrl ? `<p><a href="${item.mapUrl}" target="_blank" rel="noreferrer">Google Map</a></p>` : ""}
        <p>價位 ${stars(item.price)}</p><p>美味 ${stars(item.taste)}</p><p>地點 ${stars(item.location)}</p><p>用餐環境 ${stars(item.environment)}</p>
        <p>${item.note || ""}</p>
        ${recommendationSharePanel(type, item)}
        ${recommendActions(type, item.id)}
      </article>`;
  }
  return `
    <article class="recommend-card">
      <h3>${item.place}</h3>
      <p>${item.month || "尚未填寫月份"}</p>
      <div class="tag-list">
        <span class="tag priority-tag priority-${item.priority || "medium"}">${wishPriorityText(item.priority)}</span>
        <span class="tag">${Number(item.wantCount) || 0} 人想去</span>
        ${item.bestSeason ? `<span class="tag">最佳季節 ${item.bestSeason}</span>` : ""}
        ${Number(item.budget) ? `<span class="tag">預估 ${money(item.budget)}</span>` : ""}
        <span class="tag">調查 ${surveyStatusText(item.surveyStatus)}</span>
        ${wishTags(item.tags).map((tag) => `<span class="tag wish-tag">${tag}</span>`).join("")}
      </div>
      ${item.surveyUrl ? `<p><a href="${item.surveyUrl}" target="_blank" rel="noreferrer">意願調查</a></p>` : "<p>尚未提供意願調查</p>"}
      ${wishLinkList(item.inspirationLinks)}
      <p>${item.note || ""}</p>
      ${recommendActions(type, item.id)}
    </article>`;
}

function recommendActions(type, id) {
  const recommendTools = ["hotels", "restaurants"].includes(type)
    ? `<button type="button" data-copy-rec="${type}:${id}">複製推薦摘要</button><button type="button" data-print-rec="${type}:${id}">匯出 PDF</button>`
    : "";
  const createTrip = type === "wishlist" ? `<button class="admin-only" type="button" data-wish-trip="${id}">建立旅程</button>` : "";
  return `<div class="card-actions">${recommendTools}${createTrip}<button class="admin-only" type="button" data-edit-rec="${type}:${id}">編輯</button><button class="admin-only" type="button" data-delete-rec="${type}:${id}">刪除</button></div>`;
}

function openRecommendationForm(type, id) {
  const data = loadData();
  const item = data[type].find((entry) => entry.id === id) || { id: crypto.randomUUID(), month: "", city: "", address: "", mapUrl: "", priority: "medium", tags: "", surveyStatus: "notSent", inspirationLinks: [], wantCount: 0, bestSeason: "", budget: 0, surveyUrl: "", note: "" };
  document.getElementById("adminDialogTitle").textContent = id ? "編輯項目" : "新增項目";
  document.getElementById("adminFields").innerHTML = recommendationFields(type, item);
  const dialog = document.getElementById("adminDialog");
  dialog.dataset.formType = type;
  dialog.dataset.id = item.id;
  dialog.showModal();
}

function recommendationFields(type, item) {
  if (type === "hotels") {
    return `${input("name", "飯店名稱", item.name || "")}${input("city", "所在城市", item.city || "")}${input("address", "地址", item.address || "")}${input("mapUrl", "Google Map 連結", item.mapUrl || "", "url")}${ratingInputs(["price:價位", "comfort:舒適度", "breakfast:早餐", "location:地點"], item)}${area("note", "備註", item.note || "")}`;
  }
  if (type === "restaurants") {
    return `${input("name", "餐廳名稱", item.name || "")}${input("city", "所在城市", item.city || "")}${input("address", "地址", item.address || "")}${input("mapUrl", "Google Map 連結", item.mapUrl || "", "url")}${ratingInputs(["price:價位", "taste:美味", "location:地點", "environment:用餐環境"], item)}${area("note", "備註", item.note || "")}`;
  }
  return `${input("place", "想去的地點", item.place || "")}${input("month", "想去月份", item.month || "")}${wishPrioritySelect(item.priority)}${input("tags", "分類標籤，逗號分隔", item.tags || "")}${surveyStatusSelect(item.surveyStatus)}${input("wantCount", "想去人數", item.wantCount || 0, "number")}${input("bestSeason", "最佳季節", item.bestSeason || "")}${input("budget", "預估預算 / 每人", item.budget || 0, "number")}${input("surveyUrl", "意願調查 Google Form", item.surveyUrl || "", "url")}${area("inspirationLinks", "靈感 / 參考連結，每行一個", normalizeLinks(item.inspirationLinks).join("\n"))}${area("note", "備註", item.note || "")}`;
}

function wishPrioritySelect(value = "medium") {
  const options = { high: "必去", medium: "可安排", low: "先收藏" };
  return `<label>優先順序<select name="priority">${Object.entries(options).map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
}

function surveyStatusSelect(value = "notSent") {
  const options = { notSent: "未發送", sent: "已發送", closed: "已截止" };
  return `<label>意願調查狀態<select name="surveyStatus">${Object.entries(options).map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
}

function wishPriorityText(value = "medium") {
  return { high: "必去", medium: "可安排", low: "先收藏" }[value] || "可安排";
}

function surveyStatusText(value = "notSent") {
  return { notSent: "未發送", sent: "已發送", closed: "已截止" }[value] || "未發送";
}

function wishTags(value = "") {
  return String(value || "").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
}

function normalizeLinks(value) {
  if (Array.isArray(value)) return value.map((link) => String(link).trim()).filter(Boolean);
  return String(value || "").split("\n").map((link) => link.trim()).filter(Boolean);
}

function wishLinkList(links) {
  const valid = normalizeLinks(links);
  if (!valid.length) return "";
  return `<ul>${valid.map((link, index) => `<li><a href="${link}" target="_blank" rel="noreferrer">靈感連結 ${index + 1}</a></li>`).join("")}</ul>`;
}

function ratingInputs(fields, item) {
  return `<div class="admin-grid">${fields.map((field) => {
    const [name, label] = field.split(":");
    return `<label>${label}<select name="${name}">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${Number(item[name] || 5) === n ? "selected" : ""}>${n} 顆星</option>`).join("")}</select></label>`;
  }).join("")}</div>`;
}

function saveRecommendationForm(form, type, id) {
  const data = loadData();
  const formData = new FormData(form);
  const item = Object.fromEntries(formData.entries());
  item.id = id;
  if (type === "wishlist") item.inspirationLinks = normalizeLinks(formData.get("inspirationLinks"));
  ["price", "comfort", "breakfast", "location", "taste", "environment", "wantCount", "budget"].forEach((key) => {
    if (item[key]) item[key] = Number(item[key]);
  });
  const index = data[type].findIndex((entry) => entry.id === id);
  if (index >= 0) data[type][index] = item;
  else data[type].push(item);
  saveData(data);
}

function deleteTrip(id) {
  if (!confirm("確定要刪除這趟旅遊嗎？")) return;
  const data = loadData();
  data.trips = data.trips.filter((trip) => trip.id !== id);
  saveData(data);
  render();
}

function createTripFromWish(id) {
  const data = loadData();
  const wish = data.wishlist.find((item) => item.id === id);
  if (!wish) return;
  const trip = {
    id: crypto.randomUUID(),
    title: `${wish.place} 小旅行`,
    startDate: "",
    endDate: "",
    location: wish.place || "",
    mapUrl: "",
    coverImage: "",
    status: "planning",
    transport: "",
    hotel: "",
    attractions: wish.note || "",
    carRental: "",
    weatherForecast: "",
    luggageList: "",
    tripNotes: [wish.month ? `想去月份：${wish.month}` : "", wish.bestSeason ? `最佳季節：${wish.bestSeason}` : "", Number(wish.budget) ? `預估預算：${money(wish.budget)} / 人` : "", wish.surveyUrl ? `意願調查：${wish.surveyUrl}` : ""].filter(Boolean).join("\n"),
    review: "",
    participants: [],
    checklist: [
      { item: "確認旅遊日期", done: false },
      { item: "確認同行人數", done: false },
      { item: "安排交通與住宿", done: false }
    ],
    gatherTime: "",
    gatherPlace: "",
    contactName: "",
    contactPhone: "",
    surveyUrl: wish.surveyUrl || "",
    videoUrl: "",
    albumUrl: "",
    references: normalizeLinks(wish.inspirationLinks),
    costs: Number(wish.budget) ? [{ category: "預算", item: "每人預估", amount: Number(wish.budget), status: "estimated" }] : [],
    attendees: Number(wish.wantCount) || 1,
    schedule: [{ day: "Day 1", time: "09:00", activity: "待規劃" }]
  };
  data.trips.push(trip);
  saveData(data);
  alert("已從許願清單建立一筆規劃中的旅程。接著可以到旅程列表編輯日期與細節。");
  showHome();
  render();
  openTripForm(trip.id);
}

function deleteRecommendation(type, id) {
  if (!confirm("確定要刪除這個項目嗎？")) return;
  const data = loadData();
  data[type] = data[type].filter((item) => item.id !== id);
  saveData(data);
  renderRecommendation(type);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.classList.contains("close") && target.id !== "closeTripDialog") {
    target.closest("dialog")?.close();
  }
  if (target.id === "adminButton" || target.id === "mobileAdminButton") openLogin();
  if (target.id === "editHeroButton" || target.id === "editHeroMainButton") openHeroForm();
  if (target.id === "shareButton") {
    document.getElementById("shareNote").textContent = "";
    document.getElementById("shareDialog").showModal();
  }
  if (target.id === "newTripButton" || target.id === "newTripFromAllButton") openTripForm();
  if (target.id === "allTripsButton" || target.id === "mobileAllTripsButton") renderAllTrips();
  if (target.id === "closeAllTrips") showHome();
  if (target.id === "prevMonth") {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar(loadData());
  }
  if (target.id === "nextMonth") {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar(loadData());
  }
  if (target.dataset.trip) showTrip(target.dataset.trip);
  if (target.dataset.currentWeather) updateTripCurrentWeather(target.dataset.currentWeather, target);
  if (target.dataset.editTrip) openTripForm(target.dataset.editTrip);
  if (target.dataset.deleteTrip) deleteTrip(target.dataset.deleteTrip);
  if (target.dataset.lineTrip) copyLineAnnouncement(target.dataset.lineTrip);
  if (target.dataset.copyTrip) copyTripSummary(target.dataset.copyTrip);
  if (target.dataset.printTrip) exportTripPdf(target.dataset.printTrip);
  if (target.dataset.copyRec) {
    const [type, id] = target.dataset.copyRec.split(":");
    copyRecommendationSummary(type, id);
  }
  if (target.dataset.printRec) {
    const [type, id] = target.dataset.printRec.split(":");
    exportRecommendationPdf(type, id);
  }
  if (target.dataset.view) renderRecommendation(target.dataset.view);
  if (target.id === "closeRecommendation" || target.id === "heroHomeButton" || target.dataset.mobileHome !== undefined) showHome();
  if (target.dataset.mobileCalendar !== undefined) document.querySelector(".calendar-panel")?.scrollIntoView({ behavior: "smooth" });
  if (target.dataset.mobileTrips !== undefined) document.getElementById("tripsSection")?.scrollIntoView({ behavior: "smooth" });
  if (target.id === "addRecommendation") openRecommendationForm(currentView);
  if (target.dataset.editRec) {
    const [type, id] = target.dataset.editRec.split(":");
    openRecommendationForm(type, id);
  }
  if (target.dataset.wishTrip) createTripFromWish(target.dataset.wishTrip);
  if (target.dataset.deleteRec) {
    const [type, id] = target.dataset.deleteRec.split(":");
    deleteRecommendation(type, id);
  }
  if (target.id === "copyLinkButton") {
    navigator.clipboard.writeText(location.href);
    document.getElementById("shareNote").textContent = "分享連結已複製。";
  }
  if (target.id === "setupAdminButton") setAdminFlow();
  if (target.id === "forgotPasswordButton") forgotPasswordFlow();
  if (target.id === "fetchWeatherButton") fetchTripWeather();
  if (target.id === "closeTripDialog") document.getElementById("tripDialog").close();
});

document.querySelector(".brand").addEventListener("dblclick", () => {
  if (isAdmin()) openHeroForm();
});

document.getElementById("loginForm").addEventListener("submit", handleLogin);

document.getElementById("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const dialog = document.getElementById("adminDialog");
  const type = dialog.dataset.formType;
  const id = dialog.dataset.id;
  if (type === "trip") saveTripForm(event.currentTarget, id);
  if (type === "hero") saveHeroForm(event.currentTarget);
  if (["accountSetup", "accountReset"].includes(type) && !(await saveAccountForm(event.currentTarget, type))) return;
  if (["hotels", "restaurants", "wishlist"].includes(type)) saveRecommendationForm(event.currentTarget, type, id);
  dialog.close();
  render();
});

document.getElementById("tripSearch")?.addEventListener("input", (event) => {
  tripSearchQuery = event.target.value;
  renderTrips(loadData());
});

document.getElementById("tripStatusFilter")?.addEventListener("change", (event) => {
  tripStatusFilter = event.target.value;
  renderTrips(loadData());
});

setInterval(() => renderCountdown(loadData()), 1000);
render();
initFirebase();
openTripFromHash();
openRecommendationFromHash();
window.addEventListener("hashchange", () => {
  openTripFromHash();
  openRecommendationFromHash();
});
