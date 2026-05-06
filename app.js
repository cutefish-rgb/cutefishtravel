const storeKey = "cutefishTravelPlanner";
const adminKey = "cutefishTravelAdmin";
const sessionKey = "cutefishTravelAdminSession";
const firebaseCollection = "travelPlanner";
const firebaseDocument = "siteData";

const today = new Date();
let calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
let currentView = "home";
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

const sampleTrips = [
  {
    id: crypto.randomUUID(),
    title: "宜蘭溫泉蔬食小旅行",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    location: "宜蘭 礁溪",
    transport: "台北車站集合，搭乘葛瑪蘭客運至礁溪轉乘接駁車。",
    hotel: "山月溫泉旅宿，雙人房，含早餐與大眾湯。",
    attractions: "礁溪溫泉公園、林美石磐步道、幾米公園、傳藝中心。",
    carRental: "第二日 9 人座一台，租車 10 小時，含保險。",
    weatherForecast: "預計 24-29 度，午後可能短暫陣雨，建議攜帶薄外套與折傘。",
    luggageList: "健走鞋、薄外套、折傘、個人藥品、保溫瓶、泡湯衣物。",
    tripNotes: "步道行程可依天氣調整，長輩可選擇在咖啡廳休息。",
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
    transport: "高鐵台中站集合，包車往返。",
    hotel: "一日遊無住宿。",
    attractions: "新社花海、審計新村、宮原眼科周邊。",
    carRental: "中型巴士一台，含司機。",
    weatherForecast: "夏季偏熱，建議查看出發前三日預報，準備帽子與補水。",
    luggageList: "遮陽帽、防曬、輕便鞋、環保杯、外套。",
    tripNotes: "花市步行時間較多，會安排充足休息點。",
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
  trips: sampleTrips,
  hotels: [
    { id: crypto.randomUUID(), name: "山月溫泉旅宿", city: "宜蘭縣", address: "宜蘭縣礁溪鄉德陽路", mapUrl: "https://maps.google.com/", price: 4, comfort: 5, breakfast: 4, location: 5, note: "離車站近，長輩移動方便。" }
  ],
  restaurants: [
    { id: crypto.randomUUID(), name: "綠桌蔬食", city: "宜蘭縣", address: "宜蘭縣礁溪鄉溫泉路", mapUrl: "https://maps.google.com/", price: 4, taste: 5, location: 4, environment: 5, note: "合菜選擇多，可先預約包廂。" }
  ],
  wishlist: [
    { id: crypto.randomUUID(), place: "花蓮雲山水", month: "10 月", surveyUrl: "https://forms.gle/example", note: "想安排兩天一夜，避開暑假人潮。" }
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
    if ("surveyUrl" in item) return item;
    changed = true;
    return { ...item, surveyUrl: "" };
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
  clean.trips = clean.trips || [];
  clean.trips = clean.trips.map((trip) => ({
    gatherTime: "",
    gatherPlace: "",
    contactName: "",
    contactPhone: "",
    albumUrl: "",
    ...trip
  }));
  clean.hotels = clean.hotels || [];
  clean.restaurants = clean.restaurants || [];
  clean.wishlist = (clean.wishlist || []).map((item) => ({ surveyUrl: "", ...item }));
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
  renderCalendar(data);
  renderCountdown(data);
  renderTrips(data);
  renderQr();
  if (currentView !== "home") renderRecommendation(currentView);
}

function renderHero(data) {
  document.getElementById("heroTitle").textContent = data.hero.title;
  document.getElementById("heroQuote").textContent = data.hero.quote;
  document.getElementById("hero").style.backgroundImage =
    `linear-gradient(90deg, rgba(20, 43, 38, 0.78), rgba(20, 43, 38, 0.2)), url("${data.hero.image}")`;
}

function renderCalendar(data) {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const tripDates = new Set();

  data.trips.forEach((trip) => {
    const start = parseLocalDate(trip.startDate);
    const end = parseLocalDate(trip.endDate || trip.startDate);
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      tripDates.add(localDateKey(date));
    }
  });

  title.textContent = `${year} 年 ${month + 1} 月`;
  grid.innerHTML = "";
  for (let i = 0; i < firstDay; i += 1) grid.append(dayCell("", "empty"));
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month, day);
    const iso = localDateKey(date);
    grid.append(dayCell(day, tripDates.has(iso) ? "trip-day" : "", date));
  }
}

function dayCell(text, className, date) {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = `day ${className}`;
  if (className === "empty") return cell;
  const solar = document.createElement("span");
  solar.className = "solar-day";
  solar.textContent = text;
  const lunar = document.createElement("span");
  lunar.className = "lunar-day";
  lunar.textContent = lunarText(date);
  cell.append(solar, lunar);
  return cell;
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
  if (!next) {
    title.textContent = "目前沒有即將出發的旅遊";
    box.innerHTML = "";
    return;
  }
  title.textContent = next.title;
  const diff = Math.max(0, parseLocalDate(next.startDate).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
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

function renderTrips(data) {
  const list = document.getElementById("tripList");
  const trips = upcomingTrips(data).slice(0, 6);
  list.innerHTML = trips.map((trip) => {
    const total = totalCost(trip.costs);
    return `
      <article class="trip-card">
        <time>${dateText(trip.startDate, trip.endDate)}</time>
        <h3>${trip.title}</h3>
        <p>${trip.location}</p>
        <div class="tag-list">
          <span class="tag">總費用 ${money(total)}</span>
          <span class="tag">AA ${money(total / Math.max(1, Number(trip.attendees) || 1))}</span>
          <span class="tag">${trip.attendees || 1} 人</span>
        </div>
        <div class="card-actions">
          <button type="button" data-trip="${trip.id}">查看詳情</button>
          <button class="admin-only" type="button" data-edit-trip="${trip.id}">編輯</button>
          <button class="admin-only" type="button" data-delete-trip="${trip.id}">刪除</button>
        </div>
      </article>
    `;
  }).join("") || `<article class="trip-card"><h3>還沒有近期旅遊</h3><p>管理員登入後可以新增下一趟旅程。</p></article>`;
}

function renderQr() {
  const img = document.getElementById("qrCode");
  const url = encodeURIComponent(location.href);
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${url}`;
}

function showTrip(id) {
  const data = loadData();
  const trip = data.trips.find((item) => item.id === id);
  if (!trip) return;
  const totals = categoryTotals(trip.costs);
  const total = totalCost(trip.costs);
  const aa = total / Math.max(1, Number(trip.attendees) || 1);
  document.getElementById("tripDetail").innerHTML = `
    <h2>${trip.title}</h2>
    <p><strong>${dateText(trip.startDate, trip.endDate)}</strong>｜${trip.location}</p>
    <div class="card-actions detail-actions">
      <button type="button" data-copy-trip="${trip.id}">複製行程摘要</button>
    </div>
    <p class="form-note" id="tripCopyNote"></p>
    <div class="detail-grid">
      ${detailBlock("集合資訊", gatheringText(trip))}
      ${detailBlock("交通", trip.transport)}
      ${detailBlock("住宿", trip.hotel)}
      ${detailBlock("景點", trip.attractions)}
      ${detailBlock("租車資訊", trip.carRental)}
      ${detailBlock("旅遊地點天氣預測", trip.weatherForecast)}
      ${detailBlock("行李清單建議", trip.luggageList)}
      ${detailBlock("備註", trip.tripNotes)}
    </div>
    <section class="detail-section">
      <h3>每日行程時間表</h3>
      <div class="schedule-table">
        ${trip.schedule.map((row) => `<div class="schedule-row"><strong>${row.day} ${row.time}</strong><span>${row.activity}</span></div>`).join("")}
      </div>
    </section>
    <section class="detail-section">
      <h3>費用明細與 AA 計算</h3>
      <div class="cost-table">
        ${trip.costs.map((cost) => `<div class="cost-row"><span>${cost.category}｜${cost.item}</span><strong>${money(cost.amount)}</strong></div>`).join("")}
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
    transport: "",
    hotel: "",
    attractions: "",
    carRental: "",
    weatherForecast: "",
    luggageList: "",
    tripNotes: "",
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
    ${area("tripNotes", "備註", trip.tripNotes)}
    ${area("references", "參考網址，每行一個", (trip.references || []).join("\n"))}
    ${area("costs", "費用明細，每行：分類｜項目｜金額", (trip.costs || []).map((c) => `${c.category}｜${c.item}｜${c.amount}`).join("\n"))}
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
  const trip = {
    id,
    title: formData.get("title").trim(),
    location: formData.get("location").trim(),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || formData.get("startDate"),
    attendees: Number(formData.get("attendees")) || 1,
    transport: formData.get("transport").trim(),
    hotel: formData.get("hotel").trim(),
    attractions: formData.get("attractions").trim(),
    carRental: formData.get("carRental").trim(),
    weatherForecast: formData.get("weatherForecast").trim(),
    luggageList: formData.get("luggageList").trim(),
    tripNotes: formData.get("tripNotes").trim(),
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

function tripSummaryText(trip) {
  const total = totalCost(trip.costs);
  const aa = total / Math.max(1, Number(trip.attendees) || 1);
  const firstSchedule = (trip.schedule || []).slice(0, 5).map((row) => `${row.day} ${row.time} ${row.activity}`).join("\n");
  return [
    `【${trip.title}】`,
    `日期：${dateText(trip.startDate, trip.endDate)}`,
    `地點：${trip.location || "尚未填寫"}`,
    trip.gatherTime || trip.gatherPlace ? `集合：${[trip.gatherTime, trip.gatherPlace].filter(Boolean).join("｜")}` : "",
    trip.contactName || trip.contactPhone ? `聯絡：${[trip.contactName, trip.contactPhone].filter(Boolean).join("｜")}` : "",
    `人數：${trip.attendees || 1} 人`,
    `費用：總計 ${money(total)}，AA 每人 ${money(aa)}`,
    trip.weatherForecast ? `天氣：${trip.weatherForecast}` : "",
    trip.luggageList ? `行李建議：${trip.luggageList}` : "",
    firstSchedule ? `行程：\n${firstSchedule}` : "",
    trip.surveyUrl ? `行前調查：${trip.surveyUrl}` : "",
    trip.videoUrl ? `影片：${trip.videoUrl}` : "",
    trip.albumUrl ? `相簿：${trip.albumUrl}` : "",
    trip.tripNotes ? `備註：${trip.tripNotes}` : ""
  ].filter(Boolean).join("\n");
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
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=zh&format=json`;
  const geoResponse = await fetch(geoUrl);
  if (!geoResponse.ok) throw new Error("Geocoding request failed");
  const geoData = await geoResponse.json();
  const place = geoData.results?.[0];
  if (!place) throw new Error("Location not found");

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
  return formatWeatherForecast(location, place, forecastData, Boolean(requestedStart));
}

function forecastStartDate(startDate) {
  if (!startDate) return "";
  const tripStart = parseLocalDate(startDate);
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysAway = Math.floor((tripStart - dayStart) / 86400000);
  if (daysAway < 0 || daysAway > 15) return "";
  return startDate;
}

function formatWeatherForecast(location, place, forecastData, matchesTripDate) {
  const daily = forecastData.daily || {};
  const placeName = [place.name, place.admin1, place.country].filter(Boolean).join("，");
  const lines = (daily.time || []).map((date, index) => {
    const min = Math.round(daily.temperature_2m_min?.[index]);
    const max = Math.round(daily.temperature_2m_max?.[index]);
    const rain = daily.precipitation_probability_max?.[index];
    const weather = weatherCodeText(daily.weather_code?.[index]);
    return `${fullDateText(date)}：${weather}，${min}-${max} 度，降雨機率最高 ${rain ?? 0}%`;
  });
  const note = matchesTripDate
    ? `以下為 ${location} 旅遊日期附近的天氣預測：`
    : `目前只能自動抓近期天氣，以下為 ${location}（${placeName}）未來 5 天預測；出發前三天建議再更新一次：`;
  return [note, ...lines].join("\n");
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

function parseCosts(text) {
  return text.split("\n").map((line) => {
    const [category = "其他", item = "", amount = "0"] = line.split("｜").map((part) => part.trim());
    return { category, item, amount: Number(amount.replaceAll(",", "")) || 0 };
  }).filter((cost) => cost.item || cost.amount);
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

function renderRecommendation(type) {
  const data = loadData();
  const titleMap = { hotels: "飯店推薦", restaurants: "蔬食餐廳推薦", wishlist: "許願清單" };
  currentView = type;
  document.querySelector(".layout").classList.add("hidden");
  document.getElementById("recommendationView").classList.remove("hidden");
  document.getElementById("recommendationTitle").textContent = titleMap[type];
  document.getElementById("recommendationGrid").innerHTML = data[type].map((item) => recommendationCard(type, item)).join("") ||
    `<article class="recommend-card"><h3>尚未新增</h3><p>管理員登入後可以新增內容。</p></article>`;
}

function recommendationCard(type, item) {
  if (type === "hotels") {
    return `
      <article class="recommend-card">
        <h3>${item.name}</h3>
        <p>${item.city || "尚未填寫城市"}</p>
        <p>${item.address || "尚未填寫地址"}</p>
        ${item.mapUrl ? `<p><a href="${item.mapUrl}" target="_blank" rel="noreferrer">Google Map</a></p>` : ""}
        <p>價位 ${stars(item.price)}</p><p>舒適度 ${stars(item.comfort)}</p><p>早餐 ${stars(item.breakfast)}</p><p>地點 ${stars(item.location)}</p>
        <p>${item.note || ""}</p>${recommendActions(type, item.id)}
      </article>`;
  }
  if (type === "restaurants") {
    return `
      <article class="recommend-card">
        <h3>${item.name}</h3>
        <p>${item.city || "尚未填寫城市"}</p>
        <p>${item.address || "尚未填寫地址"}</p>
        ${item.mapUrl ? `<p><a href="${item.mapUrl}" target="_blank" rel="noreferrer">Google Map</a></p>` : ""}
        <p>價位 ${stars(item.price)}</p><p>美味 ${stars(item.taste)}</p><p>地點 ${stars(item.location)}</p><p>用餐環境 ${stars(item.environment)}</p>
        <p>${item.note || ""}</p>${recommendActions(type, item.id)}
      </article>`;
  }
  return `
    <article class="recommend-card">
      <h3>${item.place}</h3>
      <p>${item.month}</p>
      ${item.surveyUrl ? `<p><a href="${item.surveyUrl}" target="_blank" rel="noreferrer">意願調查</a></p>` : "<p>尚未提供意願調查</p>"}
      <p>${item.note || ""}</p>
      ${recommendActions(type, item.id)}
    </article>`;
}

function recommendActions(type, id) {
  return `<div class="card-actions"><button class="admin-only" type="button" data-edit-rec="${type}:${id}">編輯</button><button class="admin-only" type="button" data-delete-rec="${type}:${id}">刪除</button></div>`;
}

function openRecommendationForm(type, id) {
  const data = loadData();
  const item = data[type].find((entry) => entry.id === id) || { id: crypto.randomUUID(), month: "", city: "", address: "", mapUrl: "", surveyUrl: "", note: "" };
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
  return `${input("place", "想去的地點", item.place || "")}${input("month", "想去月份", item.month || "")}${input("surveyUrl", "意願調查 Google Form", item.surveyUrl || "", "url")}${area("note", "備註", item.note || "")}`;
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
  ["price", "comfort", "breakfast", "location", "taste", "environment"].forEach((key) => {
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
  if (target.id === "adminButton") openLogin();
  if (target.id === "editHeroButton") openHeroForm();
  if (target.id === "shareButton") {
    document.getElementById("shareNote").textContent = "";
    document.getElementById("shareDialog").showModal();
  }
  if (target.id === "newTripButton") openTripForm();
  if (target.id === "prevMonth") {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar(loadData());
  }
  if (target.id === "nextMonth") {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar(loadData());
  }
  if (target.dataset.trip) showTrip(target.dataset.trip);
  if (target.dataset.editTrip) openTripForm(target.dataset.editTrip);
  if (target.dataset.deleteTrip) deleteTrip(target.dataset.deleteTrip);
  if (target.dataset.copyTrip) copyTripSummary(target.dataset.copyTrip);
  if (target.dataset.view) renderRecommendation(target.dataset.view);
  if (target.id === "closeRecommendation") {
    currentView = "home";
    document.querySelector(".layout").classList.remove("hidden");
    document.getElementById("recommendationView").classList.add("hidden");
  }
  if (target.id === "addRecommendation") openRecommendationForm(currentView);
  if (target.dataset.editRec) {
    const [type, id] = target.dataset.editRec.split(":");
    openRecommendationForm(type, id);
  }
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

setInterval(() => renderCountdown(loadData()), 1000);
render();
initFirebase();
