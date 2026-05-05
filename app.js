/* ══════════════════════════════════════════
   PULSE AI — app.js
   Full application logic
══════════════════════════════════════════ */

// ── State ──────────────────────────────────
const APP = {
  user: null,
  profile: null,
  interests: [],
  checkinHistory: [],
  streak: 0,
  totalCheckins: 0,
  charts: {},
};

// ── Quiz Data ──────────────────────────────
const QUIZ_STEPS = [
  {
    cat: "About You",
    q: "What brings you here?",
    hint: "Pick all that apply",
    multi: true,
    opts: [
      { icon: "🎯", label: "Stay productive" },
      { icon: "🌍", label: "Discover local events" },
      { icon: "📰", label: "Stay informed" },
      { icon: "💪", label: "Track my progress" },
      { icon: "🤝", label: "Meet people" },
      { icon: "🧘", label: "Personal growth" },
    ],
  },
  {
    cat: "Interests",
    q: "Which topics excite you most?",
    hint: "Pick all that apply",
    multi: true,
    opts: [
      { icon: "💻", label: "Technology" },
      { icon: "🍳", label: "Cooking" },
      { icon: "🏋️", label: "Fitness" },
      { icon: "🎨", label: "Arts & Culture" },
      { icon: "🎵", label: "Music" },
      { icon: "📚", label: "Books" },
      { icon: "✈️", label: "Travel" },
      { icon: "🌿", label: "Sustainability" },
      { icon: "💰", label: "Finance" },
      { icon: "🎮", label: "Gaming" },
    ],
  },
  {
    cat: "Lifestyle",
    q: "How would you describe your lifestyle?",
    hint: "Pick one",
    multi: false,
    opts: [
      { icon: "🏙️", label: "Always on the go" },
      { icon: "🏠", label: "Mostly home-based" },
      { icon: "⚖️", label: "Balanced mix" },
      { icon: "🌄", label: "Outdoor enthusiast" },
    ],
  },
  {
    cat: "Social",
    q: "How do you prefer to engage?",
    hint: "Pick one",
    multi: false,
    opts: [
      { icon: "🙋", label: "Solo explorer" },
      { icon: "👫", label: "With a partner" },
      { icon: "👥", label: "Small groups" },
      { icon: "🎉", label: "Large gatherings" },
    ],
  },
  {
    cat: "Content",
    q: "What type of content do you prefer?",
    hint: "Pick all that apply",
    multi: true,
    opts: [
      { icon: "📖", label: "Long-form articles" },
      { icon: "⚡", label: "Quick summaries" },
      { icon: "🎥", label: "Videos" },
      { icon: "🎙️", label: "Podcasts" },
      { icon: "📊", label: "Data & charts" },
    ],
  },
  {
    cat: "Goals",
    q: "What's your top goal right now?",
    hint: "Pick one",
    multi: false,
    opts: [
      { icon: "📈", label: "Career growth" },
      { icon: "🏃", label: "Health & fitness" },
      { icon: "🧠", label: "Learning new skills" },
      { icon: "💑", label: "Relationships" },
      { icon: "💸", label: "Financial freedom" },
      { icon: "🌈", label: "Creative expression" },
    ],
  },
  {
    cat: "Location",
    q: "How far are you willing to travel for events?",
    hint: "Pick one",
    multi: false,
    opts: [
      { icon: "🚶", label: "Walking distance" },
      { icon: "🚌", label: "Up to 5 km" },
      { icon: "🚗", label: "Up to 20 km" },
      { icon: "🌏", label: "Anywhere" },
    ],
  },
];

// ── Events Data ────────────────────────────
const EVENTS_DATA = [
  {
    id: 1,
    title: "Bengaluru Tech Summit 2025",
    category: "Technology",
    emoji: "💻",
    date: "May 10, 2025",
    time: "9:00 AM",
    venue: "KTPO, Whitefield",
    distance: "8.2 km away",
    color: "#2d1f6e",
    bg: "#e8e4f5",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
  {
    id: 2,
    title: "Chef's Table: South Indian Brunch",
    category: "Cooking",
    emoji: "🍳",
    date: "May 11, 2025",
    time: "11:00 AM",
    venue: "Indiranagar Social",
    distance: "3.4 km away",
    color: "#c45c2e",
    bg: "#faeee8",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  },
  {
    id: 3,
    title: "Morning HIIT & Yoga Fusion",
    category: "Fitness",
    emoji: "🏋️",
    date: "May 12, 2025",
    time: "6:30 AM",
    venue: "Cubbon Park",
    distance: "5.1 km away",
    color: "#2a7a5e",
    bg: "#e4f5ee",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  },
  {
    id: 4,
    title: "Contemporary Art Opening",
    category: "Arts & Culture",
    emoji: "🎨",
    date: "May 14, 2025",
    time: "6:00 PM",
    venue: "Gallery G, Lavelle Road",
    distance: "4.7 km away",
    color: "#8b2fc9",
    bg: "#f0e8fa",
    img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80",
  },
  {
    id: 5,
    title: "Indie Music Night",
    category: "Music",
    emoji: "🎵",
    date: "May 16, 2025",
    time: "7:30 PM",
    venue: "The Humming Tree",
    distance: "6.3 km away",
    color: "#c45c2e",
    bg: "#faeee8",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
  },
  {
    id: 6,
    title: "Startup Founders Meetup",
    category: "Technology",
    emoji: "🚀",
    date: "May 17, 2025",
    time: "5:00 PM",
    venue: "91springboard, Koramangala",
    distance: "2.9 km away",
    color: "#2d1f6e",
    bg: "#e8e4f5",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
  },
  {
    id: 7,
    title: "Sustainable Living Workshop",
    category: "Sustainability",
    emoji: "🌿",
    date: "May 18, 2025",
    time: "10:00 AM",
    venue: "Jayanagar Community Hall",
    distance: "7.5 km away",
    color: "#2a7a5e",
    bg: "#e4f5ee",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: 8,
    title: "Book Club: Sci-Fi Special",
    category: "Books",
    emoji: "📚",
    date: "May 19, 2025",
    time: "4:00 PM",
    venue: "Atta Galatta, Koramangala",
    distance: "3.1 km away",
    color: "#8b2fc9",
    bg: "#f0e8fa",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
  },
  {
    id: 9,
    title: "Personal Finance Masterclass",
    category: "Finance",
    emoji: "💰",
    date: "May 20, 2025",
    time: "2:00 PM",
    venue: "Online + Bengaluru Hub",
    distance: "Online",
    color: "#2d7a2e",
    bg: "#e4f5e4",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  },
];

// ── Daily Questions per Interest ───────────
const DAILY_QUESTIONS = {
  default: {
    q: "How are you planning your day today?",
    opts: ["Deep work session", "Meetings & calls", "Creative time", "Rest & recharge"],
  },
  Technology: {
    q: "What tech topic are you exploring this week?",
    opts: ["AI & Machine Learning", "Web Development", "Cybersecurity", "Cloud & DevOps"],
  },
  Cooking: {
    q: "What cuisine are you cooking this week?",
    opts: ["South Indian", "Italian", "Asian fusion", "Baking"],
  },
  Fitness: {
    q: "What's your workout focus today?",
    opts: ["Cardio", "Strength training", "Yoga", "Rest day"],
  },
  "Arts & Culture": {
    q: "What art form inspires you today?",
    opts: ["Painting", "Photography", "Sculpture", "Digital art"],
  },
  Music: {
    q: "What genre is on your playlist today?",
    opts: ["Indie", "Classical", "Electronic", "Jazz"],
  },
  Books: {
    q: "What genre are you reading this week?",
    opts: ["Science Fiction", "Non-fiction", "Literary fiction", "Mystery"],
  },
  Travel: {
    q: "Where are you dreaming of going next?",
    opts: ["Mountains", "Beach", "City break", "Countryside"],
  },
  Sustainability: {
    q: "What eco-habit are you focusing on?",
    opts: ["Zero waste", "Plant-based eating", "Energy saving", "Slow fashion"],
  },
  Finance: {
    q: "What's your financial focus this week?",
    opts: ["Budgeting", "Investing", "Saving", "Debt reduction"],
  },
  Gaming: {
    q: "What kind of game are you playing?",
    opts: ["RPG", "Strategy", "FPS", "Indie"],
  },
};

// ── Interest Config ────────────────────────
const INTEREST_CONFIG = {
  Technology: {
    icon: "💻",
    color: "#2d1f6e",
    bg: "#e8e4f5",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
  },
  Cooking: {
    icon: "🍳",
    color: "#c45c2e",
    bg: "#faeee8",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  },
  Fitness: {
    icon: "🏋️",
    color: "#2a7a5e",
    bg: "#e4f5ee",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
  },
  "Arts & Culture": {
    icon: "🎨",
    color: "#8b2fc9",
    bg: "#f0e8fa",
    img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80",
  },
  Music: {
    icon: "🎵",
    color: "#c45c2e",
    bg: "#faeee8",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
  },
  Books: {
    icon: "📚",
    color: "#8b2fc9",
    bg: "#f0e8fa",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
  },
  Travel: {
    icon: "✈️",
    color: "#2d6ea0",
    bg: "#e4eef5",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  },
  Sustainability: {
    icon: "🌿",
    color: "#2a7a5e",
    bg: "#e4f5ee",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  },
  Finance: {
    icon: "💰",
    color: "#2d7a2e",
    bg: "#e4f5e4",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
  },
  Gaming: {
    icon: "🎮",
    color: "#c45c2e",
    bg: "#faeee8",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
  },
};

// ══════════════════════════════════════════
// PAGE NAVIGATION
// ══════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const el = document.getElementById("page-" + id);
  if (el) el.classList.add("active");
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
function switchAuthTab(tab) {
  document.getElementById("tabSignup").classList.toggle("active", tab === "signup");
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("formSignup").classList.toggle("active", tab === "signup");
  document.getElementById("formLogin").classList.toggle("active", tab === "login");
}

function setAuthError(id, msg) {
  document.getElementById(id).textContent = msg;
}

async function doSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  setAuthError("signupError", "");

  if (!name) return setAuthError("signupError", "Please enter your name.");
  if (!email) return setAuthError("signupError", "Please enter your email.");
  if (password.length < 6)
    return setAuthError("signupError", "Password must be at least 6 characters.");

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    APP.user = cred.user;
    await initUserProfile(cred.user, name);
    showPage("quiz");
    initQuiz();
  } catch (e) {
    setAuthError("signupError", friendlyAuthError(e.code));
  }
}

async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  setAuthError("loginError", "");

  if (!email) return setAuthError("loginError", "Please enter your email.");
  if (!password) return setAuthError("loginError", "Please enter your password.");

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    APP.user = cred.user;
    await loadUserProfile(cred.user);
  } catch (e) {
    setAuthError("loginError", friendlyAuthError(e.code));
  }
}

async function doGoogleAuth() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const cred = await auth.signInWithPopup(provider);
    APP.user = cred.user;
    const doc = await db.collection("users").doc(cred.user.uid).get();
    if (!doc.exists) {
      await initUserProfile(cred.user, cred.user.displayName || "User");
      showPage("quiz");
      initQuiz();
    } else {
      await loadUserProfile(cred.user);
    }
  } catch (e) {
    console.error(e);
    setAuthError("signupError", friendlyAuthError(e.code));
    setAuthError("loginError", friendlyAuthError(e.code));
  }
}

function friendlyAuthError(code) {
  const map = {
    "auth/email-already-in-use": "That email is already registered. Try signing in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

async function initUserProfile(user, name) {
  const profile = {
    name,
    email: user.email || "",
    photoURL: user.photoURL || "",
    interests: [],
    quizAnswers: {},
    streak: 0,
    totalCheckins: 0,
    checkinHistory: [],
    lastCheckin: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection("users").doc(user.uid).set(profile);
  APP.profile = profile;
}

async function loadUserProfile(user) {
  try {
    const doc = await db.collection("users").doc(user.uid).get();
    if (doc.exists) {
      APP.profile = doc.data();
      APP.interests = APP.profile.interests || [];
      APP.streak = APP.profile.streak || 0;
      APP.totalCheckins = APP.profile.totalCheckins || 0;
      APP.checkinHistory = APP.profile.checkinHistory || [];

      if (!APP.interests.length) {
        showPage("quiz");
        initQuiz();
      } else {
        showPage("app");
        initApp();
      }
    } else {
      await initUserProfile(user, user.displayName || "User");
      showPage("quiz");
      initQuiz();
    }
  } catch (e) {
    console.error("Error loading profile:", e);
  }
}

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    APP.user = user;
  }
});

// ══════════════════════════════════════════
// QUIZ
// ══════════════════════════════════════════
let quizStep = 0;
let quizAnswers = {};

function initQuiz() {
  quizStep = 0;
  quizAnswers = {};
  renderQuizStep();

  document.getElementById("btnQuizNext").onclick = quizNext;
  document.getElementById("btnQuizBack").onclick = quizBack;
}

function renderQuizStep() {
  const step = QUIZ_STEPS[quizStep];
  const total = QUIZ_STEPS.length;

  document.getElementById("quizCat").textContent = step.cat;
  document.getElementById("quizQ").textContent = step.q;
  document.querySelector(".quiz-hint").textContent = step.hint;
  document.getElementById("quizStepLabel").textContent = `${quizStep + 1} / ${total}`;
  document.getElementById("quizProgressFill").style.width = `${((quizStep + 1) / total) * 100}%`;
  document.getElementById("btnQuizBack").style.visibility = quizStep === 0 ? "hidden" : "visible";
  document.getElementById("btnQuizNext").textContent =
    quizStep === total - 1 ? "Finish →" : "Next →";

  const container = document.getElementById("quizOptions");
  container.innerHTML = "";
  const selected = quizAnswers[quizStep] || [];

  step.opts.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option" + (selected.includes(opt.label) ? " selected" : "");
    btn.innerHTML = `<span class="opt-icon">${opt.icon}</span>${opt.label}`;
    btn.onclick = () => toggleQuizOption(quizStep, opt.label, step.multi, btn);
    container.appendChild(btn);
  });
}

function toggleQuizOption(stepIdx, label, multi, btn) {
  if (!quizAnswers[stepIdx]) quizAnswers[stepIdx] = [];
  const arr = quizAnswers[stepIdx];

  if (arr.includes(label)) {
    quizAnswers[stepIdx] = arr.filter((x) => x !== label);
    btn.classList.remove("selected");
  } else {
    if (!multi) {
      quizAnswers[stepIdx] = [label];
      document.querySelectorAll(".quiz-option").forEach((b) => b.classList.remove("selected"));
    } else {
      quizAnswers[stepIdx].push(label);
    }
    btn.classList.add("selected");
  }
}

function quizNext() {
  if (quizStep < QUIZ_STEPS.length - 1) {
    quizStep++;
    renderQuizStep();
  } else {
    finishQuiz();
  }
}

function quizBack() {
  if (quizStep > 0) {
    quizStep--;
    renderQuizStep();
  }
}

async function finishQuiz() {
  // Extract interests from step 1 (index 1)
  const interests = quizAnswers[1] || [];
  APP.interests = interests;

  try {
    await db.collection("users").doc(APP.user.uid).update({
      interests,
      quizAnswers,
    });
    APP.profile = { ...APP.profile, interests, quizAnswers };
  } catch (e) {
    console.error("Error saving quiz:", e);
  }

  showPage("app");
  initApp();
}

// ══════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════
function initApp() {
  setupSidebar();
  setupTabNav();
  renderHome();
  renderEvents();
  setupChat();
  renderProgress();
  renderNews();
  setupLogout();
  updateStreak();
}

// ── Sidebar ────────────────────────────────
function setupSidebar() {
  const user = APP.user;
  const profile = APP.profile;
  const name = profile?.name || user?.displayName || "User";
  const email = user?.email || "";

  document.getElementById("sidebarName").textContent = name;
  document.getElementById("sidebarEmail").textContent = email;

  const avatar = document.getElementById("sidebarAvatar");
  if (user?.photoURL) {
    avatar.innerHTML = `<img src="${user.photoURL}" alt="${name}" />`;
  } else {
    avatar.textContent = name.charAt(0).toUpperCase();
  }

  // Hamburger
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");

  // Create overlay if not exists
  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.getElementById("page-app").appendChild(overlay);
  }

  hamburger.onclick = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("visible");
  };
  overlay.onclick = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  };
}

// ── Tab Navigation ─────────────────────────
function setupTabNav() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.onclick = () => {
      const tab = item.dataset.tab;
      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      document.getElementById("tab-" + tab)?.classList.add("active");

      // Close sidebar on mobile
      document.getElementById("sidebar").classList.remove("open");
      document.querySelector(".sidebar-overlay")?.classList.remove("visible");
    };
  });
}

// ── Logout ─────────────────────────────────
function setupLogout() {
  document.getElementById("btnLogout").onclick = async () => {
    await auth.signOut();
    APP.user = null;
    APP.profile = null;
    APP.interests = [];
    showPage("auth");
  };
}

// ══════════════════════════════════════════
// HOME TAB
// ══════════════════════════════════════════
function renderHome() {
  const name = APP.profile?.name || APP.user?.displayName || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? `Good morning, ${name.split(" ")[0]} ✦` :
    hour < 17 ? `Good afternoon, ${name.split(" ")[0]} ✦` :
    `Good evening, ${name.split(" ")[0]} ✦`;

  document.getElementById("homeGreeting").textContent = greeting;

  // Date badge
  const now = new Date();
  document.getElementById("dateBadge").textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Stats
  document.getElementById("statStreak").textContent = APP.streak;
  document.getElementById("statEvents").textContent = EVENTS_DATA.length;
  document.getElementById("statCheckins").textContent = APP.totalCheckins;

  // Interest tags
  renderInterestTags();

  // Daily check-in
  renderDailyCheckin();

  // Events preview (first 4)
  renderEventsGrid("homeEventsGrid", EVENTS_DATA.slice(0, 4));
}

function renderInterestTags() {
  const container = document.getElementById("interestTags");
  container.innerHTML = "";
  const interests = APP.interests.length ? APP.interests : ["Technology", "Fitness", "Cooking"];
  interests.forEach((interest) => {
    const cfg = INTEREST_CONFIG[interest] || { icon: "⭐", color: "#2d1f6e" };
    const tag = document.createElement("div");
    tag.className = "interest-tag";
    tag.innerHTML = `<span class="tag-icon">${cfg.icon}</span>${interest}`;
    tag.onclick = () => showInterestDetail(interest);
    container.appendChild(tag);
  });
}

function renderDailyCheckin() {
  const interests = APP.interests;
  const primary = interests[0] || "default";
  const qData = DAILY_QUESTIONS[primary] || DAILY_QUESTIONS.default;
  const todayKey = new Date().toISOString().split("T")[0];
  const alreadyAnswered = APP.checkinHistory.some((c) => c.date === todayKey);

  document.getElementById("dailyQuestionText").textContent = qData.q;
  const optsEl = document.getElementById("dailyOptions");
  optsEl.innerHTML = "";

  if (alreadyAnswered) {
    const ans = APP.checkinHistory.find((c) => c.date === todayKey);
    optsEl.innerHTML = `<span class="daily-answered">✅ Today's check-in done! You answered: <strong>${ans?.answer || ""}</strong></span>`;
    return;
  }

  qData.opts.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "daily-opt";
    btn.textContent = opt;
    btn.onclick = () => recordCheckin(opt, qData.q);
    optsEl.appendChild(btn);
  });
}

async function recordCheckin(answer, question) {
  const todayKey = new Date().toISOString().split("T")[0];
  const entry = { date: todayKey, answer, question };

  APP.checkinHistory = APP.checkinHistory.filter((c) => c.date !== todayKey);
  APP.checkinHistory.unshift(entry);
  APP.totalCheckins++;

  updateStreak();
  renderDailyCheckin();

  // Update stats
  document.getElementById("statStreak").textContent = APP.streak;
  document.getElementById("statCheckins").textContent = APP.totalCheckins;

  try {
    await db.collection("users").doc(APP.user.uid).update({
      checkinHistory: APP.checkinHistory.slice(0, 60),
      totalCheckins: APP.totalCheckins,
      streak: APP.streak,
      lastCheckin: todayKey,
    });
  } catch (e) {
    console.error("Error saving checkin:", e);
  }

  // Refresh progress charts
  if (APP.charts.checkins) renderProgressCharts();
  renderHistoryList();
}

function updateStreak() {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const dates = APP.checkinHistory.map((c) => c.date);

  if (!dates.includes(today) && !dates.includes(yesterday)) {
    APP.streak = 0;
  } else {
    let streak = 0;
    let check = today;
    while (dates.includes(check)) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().split("T")[0];
    }
    APP.streak = streak;
  }
}

// ══════════════════════════════════════════
// EVENTS TAB
// ══════════════════════════════════════════
function renderEvents() {
  const filterEl = document.getElementById("eventsFilter");
  const categories = ["All", ...new Set(EVENTS_DATA.map((e) => e.category))];

  filterEl.innerHTML = "";
  categories.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (i === 0 ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filtered = cat === "All" ? EVENTS_DATA : EVENTS_DATA.filter((e) => e.category === cat);
      renderEventsGrid("eventsGrid", filtered);
    };
    filterEl.appendChild(btn);
  });

  renderEventsGrid("eventsGrid", EVENTS_DATA);
}

function renderEventsGrid(containerId, events) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  events.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <img class="event-card-img" src="${ev.img}" alt="${ev.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
      <div class="event-card-top" style="display:none;background:${ev.bg}">${ev.emoji}</div>
      <div class="event-card-body">
        <span class="event-tag" style="background:${ev.bg};color:${ev.color}">${ev.category}</span>
        <div class="event-title">${ev.title}</div>
        <div class="event-meta">
          <span>📅 ${ev.date} · ${ev.time}</span>
          <span>📍 ${ev.venue}</span>
        </div>
        <div class="event-dist">📏 ${ev.distance}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ══════════════════════════════════════════
// PROGRESS TAB
// ══════════════════════════════════════════
function renderProgress() {
  renderProgressCharts();
  renderHistoryList();
}

function renderProgressCharts() {
  // Weekly check-ins chart
  const days = [];
  const counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    days.push(d.toLocaleDateString("en-IN", { weekday: "short" }));
    counts.push(APP.checkinHistory.filter((c) => c.date === key).length);
  }

  const ctx1 = document.getElementById("chartCheckins").getContext("2d");
  if (APP.charts.checkins) APP.charts.checkins.destroy();
  APP.charts.checkins = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        {
          label: "Check-ins",
          data: counts,
          backgroundColor: "rgba(45,31,110,0.15)",
          borderColor: "#2d1f6e",
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });

  // Interest activity chart
  const interests = APP.interests.length ? APP.interests : ["Technology", "Fitness", "Cooking"];
  const interestCounts = interests.map((int) =>
    APP.checkinHistory.filter((c) =>
      (DAILY_QUESTIONS[int]?.opts || []).includes(c.answer)
    ).length
  );

  const ctx2 = document.getElementById("chartInterests").getContext("2d");
  if (APP.charts.interests) APP.charts.interests.destroy();
  APP.charts.interests = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: interests,
      datasets: [
        {
          data: interestCounts.some((c) => c > 0) ? interestCounts : interests.map(() => 1),
          backgroundColor: ["#2d1f6e", "#c45c2e", "#2a7a5e", "#8b2fc9", "#2d6ea0"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
    },
  });
}

function renderHistoryList() {
  const container = document.getElementById("historyList");
  container.innerHTML = "";

  if (!APP.checkinHistory.length) {
    container.innerHTML = `<p style="color:var(--text-muted);font-style:italic;padding:20px 0;">No check-ins yet. Complete your first daily check-in!</p>`;
    return;
  }

  APP.checkinHistory.slice(0, 20).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    const d = new Date(entry.date);
    item.innerHTML = `
      <div class="history-date">${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
      <div class="history-answer">
        <div class="history-q">${entry.question || "Daily check-in"}</div>
        <strong>${entry.answer}</strong>
      </div>
      <div class="history-check">✓</div>
    `;
    container.appendChild(item);
  });
}

// ══════════════════════════════════════════
// CHAT TAB
// ══════════════════════════════════════════
function setupChat() {
  const input = document.getElementById("chatInput");
  const btn = document.getElementById("btnSend");

  // Set personalised intro
  const interests = APP.interests.slice(0, 3).join(", ") || "various topics";
  document.getElementById("chatIntroMsg").textContent =
    `Hi! I'm your PulseAI assistant. I know you're interested in ${interests}. Ask me about events, news, or anything on your mind!`;

  btn.onclick = sendChatMessage;
  input.onkeydown = (e) => {
    if (e.key === "Enter") sendChatMessage();
  };
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  addChatBubble("user", msg);

  // Typing indicator
  const typingId = addTypingBubble();

  const interests = APP.interests.join(", ") || "general topics";
  const name = APP.profile?.name?.split(" ")[0] || "there";

  const systemPrompt = `You are PulseAI, a friendly and insightful personal assistant for ${name}, based in Bengaluru, India. 
The user's interests are: ${interests}.
You help with events, news, personal advice, and anything related to their interests.
Keep responses concise (2-4 sentences), warm, and personalised. Use the user's interests when relevant.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: msg }],
      }),
    });

    const data = await response.json();
    removeTypingBubble(typingId);

    const reply =
      data.content?.map((b) => b.text || "").join("") ||
      "Sorry, I couldn't process that. Please try again!";
    addChatBubble("ai", reply);
  } catch (e) {
    removeTypingBubble(typingId);
    addChatBubble(
      "ai",
      "I'm having trouble connecting right now. Please try again in a moment!"
    );
  }
}

function addChatBubble(role, text) {
  const window_ = document.getElementById("chatWindow");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.innerHTML = `
    <div class="bubble-avatar">${role === "ai" ? "AI" : "You"}</div>
    <div class="bubble-text">${escapeHtml(text)}</div>
  `;
  window_.appendChild(bubble);
  window_.scrollTop = window_.scrollHeight;
  return bubble;
}

function addTypingBubble() {
  const window_ = document.getElementById("chatWindow");
  const id = "typing-" + Date.now();
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble ai";
  bubble.id = id;
  bubble.innerHTML = `
    <div class="bubble-avatar">AI</div>
    <div class="bubble-text"><div class="typing-dots"><span></span><span></span><span></span></div></div>
  `;
  window_.appendChild(bubble);
  window_.scrollTop = window_.scrollHeight;
  return id;
}

function removeTypingBubble(id) {
  document.getElementById(id)?.remove();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

// ══════════════════════════════════════════
// NEWS TAB
// ══════════════════════════════════════════
async function renderNews() {
  const container = document.getElementById("newsGrid");
  container.innerHTML = `<div class="news-loading">Fetching your personalised brief…</div>`;

  const interests = APP.interests.slice(0, 5).join(", ") || "technology, business, world affairs";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Generate 6 realistic, plausible news headlines and summaries for someone in Bengaluru, India who is interested in: ${interests}. 
Return ONLY a JSON array, no markdown, no backticks. Format:
[{"topic":"Topic","headline":"Headline here","summary":"2-sentence summary here.","source":"Source Name","time":"X hours ago"}]`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "[]";

    let articles = [];
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      articles = JSON.parse(clean);
    } catch {
      articles = getFallbackNews();
    }

    container.innerHTML = "";
    const colors = ["#2d1f6e", "#c45c2e", "#2a7a5e", "#8b2fc9", "#2d6ea0", "#c45c2e"];

    articles.forEach((art, i) => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <div class="news-topic" style="color:${colors[i % colors.length]}">${art.topic || "General"}</div>
        <div class="news-headline">${art.headline}</div>
        <div class="news-summary">${art.summary}</div>
        <div class="news-meta">${art.source || "PulseAI Brief"} · ${art.time || "Today"}</div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    const fallback = getFallbackNews();
    container.innerHTML = "";
    const colors = ["#2d1f6e", "#c45c2e", "#2a7a5e", "#8b2fc9", "#2d6ea0", "#c45c2e"];
    fallback.forEach((art, i) => {
      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <div class="news-topic" style="color:${colors[i % colors.length]}">${art.topic}</div>
        <div class="news-headline">${art.headline}</div>
        <div class="news-summary">${art.summary}</div>
        <div class="news-meta">${art.source} · ${art.time}</div>
      `;
      container.appendChild(card);
    });
  }
}

function getFallbackNews() {
  return [
    {
      topic: "Technology",
      headline: "Bengaluru Emerges as Global AI Hub with Record Startup Funding",
      summary:
        "The city saw a 40% surge in AI startup investments this quarter. Major tech giants are expanding their R&D centres in Whitefield and Electronic City.",
      source: "Tech India",
      time: "2 hours ago",
    },
    {
      topic: "Business",
      headline: "India's Startup Ecosystem Ranks Third Globally in 2025",
      summary:
        "With over 100 unicorns, India's startup landscape continues to attract foreign investment. The government's digital infrastructure push has been a key catalyst.",
      source: "Economic Times",
      time: "4 hours ago",
    },
    {
      topic: "Health",
      headline: "New Study Links Regular Exercise to 30% Lower Stress Levels",
      summary:
        "Researchers from IISc Bengaluru found that just 20 minutes of daily movement significantly reduces cortisol levels. The study covered 5,000 urban professionals.",
      source: "Health Today",
      time: "6 hours ago",
    },
    {
      topic: "Culture",
      headline: "Bengaluru's Art Scene Sees Renaissance with New Gallery Openings",
      summary:
        "Over 12 new contemporary art spaces have opened in the city this year alone. Local artists are gaining international recognition through digital platforms.",
      source: "Deccan Herald",
      time: "8 hours ago",
    },
    {
      topic: "Environment",
      headline: "Karnataka Sets Bold Target: 70% Renewable Energy by 2030",
      summary:
        "The state government announced a comprehensive green energy roadmap covering solar, wind, and hydro projects. Bengaluru will host the new Clean Energy Corridor.",
      source: "The Hindu",
      time: "12 hours ago",
    },
    {
      topic: "Finance",
      headline: "Nifty 50 Crosses 25,000 Mark Amid Strong Quarterly Earnings",
      summary:
        "Indian markets surged as IT and banking sectors reported better-than-expected results. Foreign institutional investors net bought ₹8,200 crore this week.",
      source: "Mint",
      time: "1 hour ago",
    },
  ];
}

// ══════════════════════════════════════════
// INTEREST DETAIL PAGE
// ══════════════════════════════════════════
function showInterestDetail(interest) {
  const cfg = INTEREST_CONFIG[interest] || { icon: "⭐", color: "#2d1f6e", img: "", bg: "#e8e4f5" };

  // Set CSS accent variable
  document.getElementById("page-interest").style.setProperty("--ip-accent", cfg.color);

  document.getElementById("ipHeroBgImg").src = cfg.img;
  document.getElementById("ipHeroIcon").textContent = cfg.icon;
  document.getElementById("ipHeroTitle").textContent = interest;
  document.getElementById("ipHeroSub").textContent = "Your personal hub";

  // Stats
  const todayKey = new Date().toISOString().split("T")[0];
  const relevantCheckins = APP.checkinHistory.filter((c) =>
    (DAILY_QUESTIONS[interest]?.opts || []).includes(c.answer)
  );
  document.getElementById("ipStreakNum").textContent = APP.streak;
  document.getElementById("ipCheckinNum").textContent = relevantCheckins.length;

  const eventsForInterest = EVENTS_DATA.filter((e) => e.category === interest);
  document.getElementById("ipEventsNum").textContent = eventsForInterest.length;

  // Daily check-in
  renderIpDailyCheckin(interest);

  // Chart
  renderIpChart(interest, cfg.color);

  // Events
  renderIpEvents(eventsForInterest, cfg.color);

  // News (AI-generated)
  renderIpNews(interest, cfg.color);

  // Back button
  document.getElementById("ipBack").onclick = () => {
    showPage("app");
  };

  showPage("interest");
}

function renderIpDailyCheckin(interest) {
  const qData = DAILY_QUESTIONS[interest] || DAILY_QUESTIONS.default;
  const todayKey = new Date().toISOString().split("T")[0];
  const alreadyAnswered = APP.checkinHistory.some((c) => c.date === todayKey);

  document.getElementById("ipDailyQ").textContent = qData.q;
  const optsEl = document.getElementById("ipDailyOpts");
  optsEl.innerHTML = "";

  if (alreadyAnswered) {
    const ans = APP.checkinHistory.find((c) => c.date === todayKey);
    optsEl.innerHTML = `<span class="ip-answered">✅ Done! You answered: <strong>${ans?.answer || ""}</strong></span>`;
    return;
  }

  qData.opts.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "ip-daily-btn";
    btn.textContent = opt;
    btn.onclick = () => {
      recordCheckin(opt, qData.q);
      renderIpDailyCheckin(interest);
    };
    optsEl.appendChild(btn);
  });
}

function renderIpChart(interest, color) {
  const days = [];
  const counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    days.push(d.toLocaleDateString("en-IN", { weekday: "short" }));
    const opts = DAILY_QUESTIONS[interest]?.opts || [];
    counts.push(APP.checkinHistory.filter((c) => c.date === key && opts.includes(c.answer)).length);
  }

  const ctx = document.getElementById("ipChart").getContext("2d");
  if (APP.charts.ip) APP.charts.ip.destroy();
  APP.charts.ip = new Chart(ctx, {
    type: "line",
    data: {
      labels: days,
      datasets: [
        {
          label: interest,
          data: counts,
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: color,
          pointRadius: 5,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function renderIpEvents(events, color) {
  const container = document.getElementById("ipEventsGrid");
  container.innerHTML = "";

  if (!events.length) {
    container.innerHTML = `<p class="ip-no-events">No upcoming events for this interest right now.</p>`;
    return;
  }

  events.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "ip-event-card";
    card.innerHTML = `
      <div class="ip-event-emoji">${ev.emoji}</div>
      <div class="ip-event-title">${ev.title}</div>
      <div class="ip-event-meta">
        <span>📅 ${ev.date} · ${ev.time}</span>
        <span>📍 ${ev.venue}</span>
      </div>
      <div class="ip-event-dist">📏 ${ev.distance}</div>
    `;
    container.appendChild(card);
  });
}

async function renderIpNews(interest, color) {
  const container = document.getElementById("ipNewsList");
  container.innerHTML = `<div class="ip-news-loading">Fetching ${interest} news…</div>`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Generate 4 realistic news items specifically about ${interest} for someone in Bengaluru, India.
Return ONLY a JSON array, no markdown, no backticks:
[{"headline":"Headline","summary":"One sentence summary.","source":"Source","time":"X hours ago"}]`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "[]";

    let articles = [];
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      articles = JSON.parse(clean);
    } catch {
      articles = [];
    }

    container.innerHTML = "";
    articles.forEach((art) => {
      const item = document.createElement("div");
      item.className = "ip-news-item";
      item.style.borderLeftColor = color;
      item.innerHTML = `
        <div class="ip-news-headline">${art.headline}</div>
        <div class="ip-news-summary">${art.summary}</div>
        <div class="ip-news-meta">${art.source || "PulseAI"} · ${art.time || "Today"}</div>
      `;
      container.appendChild(item);
    });

    if (!articles.length) {
      container.innerHTML = `<p class="ip-news-loading">No news available right now.</p>`;
    }
  } catch (e) {
    container.innerHTML = `<p class="ip-news-loading">Couldn't load news. Check your connection.</p>`;
  }
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  showPage("auth");

  // Listen for auth state
  auth.onAuthStateChanged(async (user) => {
    if (user && document.getElementById("page-auth").classList.contains("active")) {
      APP.user = user;
      await loadUserProfile(user);
    }
  });
});
