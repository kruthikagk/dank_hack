/* ══════════════════════════════════════════
   PULSE AI — APP.JS
   Full featured AI personalised website
══════════════════════════════════════════ */

// ─── ANTHROPIC API ───────────────────────
const CLAUDE_API = "https://api.anthropic.com/v1/messages";

async function callClaude(systemPrompt, userMessage, history = []) {
  const messages = [
    ...history,
    { role: "user", content: userMessage }
  ];
  const res = await fetch(CLAUDE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages
    })
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "Sorry, I couldn't respond.";
}

// ─── STORAGE HELPERS ─────────────────────
const S = {
  get: (k, def = null) => { try { const v = localStorage.getItem("pulseai_" + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem("pulseai_" + k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem("pulseai_" + k); } catch {} }
};

// ─── STATE ────────────────────────────────
let state = {
  user: S.get("user", null),
  interests: S.get("interests", []),
  quizDone: S.get("quizDone", false),
  checkinHistory: S.get("checkinHistory", {}),
  chatHistory: [],
  currentTab: "home",
  eventsFilter: "all"
};

// ─── QUIZ DATA ────────────────────────────
const QUIZ = [
  {
    cat: "About You",
    q: "What brings you here today?",
    options: [
      { icon: "🏆", label: "Hackathon" },
      { icon: "🧑‍💻", label: "Coding / Tech" },
      { icon: "🍳", label: "Cooking" },
      { icon: "🎨", label: "Art & Design" },
      { icon: "📚", label: "Reading / Books" },
      { icon: "🎵", label: "Music" },
      { icon: "🏋️", label: "Fitness" },
      { icon: "🌍", label: "Travel" },
      { icon: "🎮", label: "Gaming" },
      { icon: "🚀", label: "Startups" }
    ]
  },
  {
    cat: "Events",
    q: "What kind of events do you like attending?",
    options: [
      { icon: "🧑‍🏫", label: "Workshops" },
      { icon: "🎤", label: "Conferences" },
      { icon: "🎭", label: "Cultural Shows" },
      { icon: "🍽️", label: "Food Festivals" },
      { icon: "🏃", label: "Sports Events" },
      { icon: "🎬", label: "Film Screenings" },
      { icon: "📈", label: "Networking" },
      { icon: "🎪", label: "Community Fairs" },
      { icon: "🎓", label: "Debates" },
      { icon: "🤝", label: "Volunteering" }
    ]
  },
  {
    cat: "Learning",
    q: "What topics are you excited to learn about?",
    options: [
      { icon: "🤖", label: "AI & ML" },
      { icon: "💰", label: "Finance" },
      { icon: "🌱", label: "Sustainability" },
      { icon: "🔬", label: "Science" },
      { icon: "🧘", label: "Wellness" },
      { icon: "⚖️", label: "Law / Policy" },
      { icon: "🛸", label: "Space" },
      { icon: "🏗️", label: "Architecture" },
      { icon: "🧬", label: "Health / Bio" },
      { icon: "🌐", label: "Global Affairs" }
    ]
  },
  {
    cat: "Goals",
    q: "What is your main goal for this week?",
    options: [
      { icon: "💡", label: "Learn a new skill" },
      { icon: "🤝", label: "Meet new people" },
      { icon: "🏗️", label: "Build a project" },
      { icon: "😌", label: "Relax & recharge" },
      { icon: "📰", label: "Stay updated" },
      { icon: "💼", label: "Career growth" },
      { icon: "🏆", label: "Win a competition" },
      { icon: "📊", label: "Track progress" },
      { icon: "🍀", label: "Self-improvement" },
      { icon: "🎯", label: "Complete a challenge" }
    ]
  },
  {
    cat: "Social",
    q: "How do you prefer to engage with others?",
    options: [
      { icon: "👥", label: "Group activities" },
      { icon: "👤", label: "One-on-one" },
      { icon: "💬", label: "Online chats" },
      { icon: "🎙️", label: "Speaking up" },
      { icon: "🤫", label: "Quiet observer" },
      { icon: "🔗", label: "Networking" },
      { icon: "🌐", label: "Global community" },
      { icon: "🏘️", label: "Local community" },
      { icon: "📲", label: "Social media" },
      { icon: "📧", label: "Email & forums" }
    ]
  },
  {
    cat: "News",
    q: "What news topics matter most to you?",
    options: [
      { icon: "🤖", label: "Technology" },
      { icon: "🌍", label: "World News" },
      { icon: "📈", label: "Business" },
      { icon: "🌱", label: "Climate" },
      { icon: "🏋️", label: "Sports" },
      { icon: "🎭", label: "Entertainment" },
      { icon: "🔬", label: "Science" },
      { icon: "🏥", label: "Health" },
      { icon: "⚖️", label: "Politics" },
      { icon: "🚀", label: "Innovation" }
    ]
  },
  {
    cat: "Vibe",
    q: "What's your daily mood like usually?",
    options: [
      { icon: "🔥", label: "Energetic & driven" },
      { icon: "🧘", label: "Calm & mindful" },
      { icon: "🤩", label: "Curious & excited" },
      { icon: "💪", label: "Focused & productive" },
      { icon: "😴", label: "Slow & reflective" },
      { icon: "🎉", label: "Playful & fun" },
      { icon: "📐", label: "Analytical" },
      { icon: "🎨", label: "Creative" },
      { icon: "🌊", label: "Go with the flow" },
      { icon: "⚡", label: "Intense & ambitious" }
    ]
  }
];

// ─── EVENTS DATA ─────────────────────────
function generateEvents(interests) {
  const allEvents = [
    { id: 1, icon: "🏆", title: "Bengaluru Hackathon 2025", type: "hackathon", category: "Coding / Tech", date: "May 10–12", location: "NIMHANS Convention Centre", dist: "3.2 km", color: "#7c6aff22", tagColor: "#7c6aff" },
    { id: 2, icon: "🍳", title: "Street Food Festival", type: "food", category: "Cooking", date: "May 11", location: "UB City Mall", dist: "5.1 km", color: "#ff6a9f22", tagColor: "#ff6a9f" },
    { id: 3, icon: "🎨", title: "Modern Art Exhibition", type: "art", category: "Art & Design", date: "May 9–15", location: "National Gallery of Modern Art", dist: "7.4 km", color: "#6affda22", tagColor: "#6affda" },
    { id: 4, icon: "🚀", title: "Startup Pitch Night", type: "startup", category: "Startups", date: "May 14", location: "WeWork Galaxy", dist: "4.0 km", color: "#ffb86c22", tagColor: "#ffb86c" },
    { id: 5, icon: "🎵", title: "Jazz at Indiranagar", type: "music", category: "Music", date: "May 12", location: "Windmills Craftworks", dist: "6.5 km", color: "#ff6a9f22", tagColor: "#ff6a9f" },
    { id: 6, icon: "🏋️", title: "Marathon & Run Club", type: "fitness", category: "Fitness", date: "May 13", location: "Cubbon Park", dist: "2.8 km", color: "#6affda22", tagColor: "#6affda" },
    { id: 7, icon: "📚", title: "Book Club: Sci-Fi Edition", type: "books", category: "Reading / Books", date: "May 15", location: "Blossom Book House", dist: "5.9 km", color: "#7c6aff22", tagColor: "#7c6aff" },
    { id: 8, icon: "🎮", title: "Gaming LAN Party", type: "gaming", category: "Gaming", date: "May 11", location: "Smaaash, Phoenix Mall", dist: "8.2 km", color: "#ffb86c22", tagColor: "#ffb86c" },
    { id: 9, icon: "🌍", title: "Travel Photography Walk", type: "travel", category: "Travel", date: "May 16", location: "Brigade Road", dist: "4.7 km", color: "#6affda22", tagColor: "#6affda" },
    { id: 10, icon: "🎓", title: "College Debate Championship", type: "debate", category: "Debates", date: "May 17", location: "Christ University", dist: "9.1 km", color: "#7c6aff22", tagColor: "#7c6aff" },
    { id: 11, icon: "🤖", title: "AI & ML Summit", type: "tech", category: "AI & ML", date: "May 18–19", location: "Bangalore International Exhibition Centre", dist: "12.3 km", color: "#7c6aff22", tagColor: "#7c6aff" },
    { id: 12, icon: "🧘", title: "Wellness & Mindfulness Retreat", type: "wellness", category: "Wellness", date: "May 20", location: "Lalbagh Botanical Garden", dist: "3.6 km", color: "#6affda22", tagColor: "#6affda" }
  ];

  // Sort by relevance to interests
  return allEvents.sort((a, b) => {
    const aMatch = interests.some(i => a.category.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(a.type));
    const bMatch = interests.some(i => b.category.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(b.type));
    return bMatch - aMatch;
  });
}

// ─── DAILY QUESTIONS ─────────────────────
const DAILY_QUESTIONS = [
  {
    q: "How focused do you feel today?",
    options: ["🔥 Super focused", "👍 Pretty good", "😐 Average", "😴 Struggling"]
  },
  {
    q: "What's your energy like right now?",
    options: ["⚡ High energy", "🌊 Steady flow", "😌 Mellow", "🪫 Low battery"]
  },
  {
    q: "What are you most excited about today?",
    options: ["💼 Work/project", "🎉 Social plans", "📚 Learning", "😴 Rest & recovery"]
  },
  {
    q: "How's your mood this morning?",
    options: ["😄 Great!", "🙂 Good", "😐 Okay", "😔 Could be better"]
  },
  {
    q: "What's your biggest priority right now?",
    options: ["🎯 A goal I'm chasing", "🤝 Connecting with people", "🧘 Taking care of myself", "🔍 Exploring something new"]
  },
  {
    q: "How much did you learn yesterday?",
    options: ["🤩 A lot!", "👍 A bit", "😐 Not much", "💤 I rested instead"]
  },
  {
    q: "What would make today a success?",
    options: ["✅ Finishing a task", "💡 A new insight", "😊 Feeling happy", "🤝 Helping someone"]
  }
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayQuestion() {
  const day = new Date().getDay();
  return DAILY_QUESTIONS[day % DAILY_QUESTIONS.length];
}

// ─── NEWS GENERATION VIA AI ──────────────
async function fetchPersonalisedNews(interests) {
  const topInterests = interests.slice(0, 5).join(", ") || "technology, world affairs";
  const prompt = `You are a news curator. Generate 6 brief, realistic-sounding news briefs for today tailored to these topics: ${topInterests}. 
  
  Return ONLY valid JSON array, no markdown, no backticks, no preamble. Format:
  [{"topic":"Technology","headline":"Headline here","summary":"2-3 sentence summary here.","source":"Source Name","time":"2 hours ago"}]`;

  try {
    const raw = await callClaude(
      "You are a JSON-only news generator. Return raw JSON only, no markdown.",
      prompt
    );
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return interests.slice(0, 6).map((interest, i) => ({
      topic: interest,
      headline: `Latest in ${interest}: New developments emerge`,
      summary: `Exciting progress has been made in the ${interest} space today. Experts are weighing in on what this means for the future.`,
      source: "PulseAI Brief",
      time: `${i + 1} hour${i > 0 ? "s" : ""} ago`
    }));
  }
}

// ─── CHAT AI ─────────────────────────────
async function sendChat(userMsg) {
  const interests = state.interests;
  const system = `You are PulseAI, a smart, friendly, concise personal assistant. The user's interests are: ${interests.join(", ")}. Their location is Bengaluru, India. Personalise every response. Keep replies under 3 short paragraphs. Be helpful, warm, and insightful.`;

  state.chatHistory.push({ role: "user", content: userMsg });
  const history = state.chatHistory.slice(-10).slice(0, -1); // exclude last, it's added below
  const reply = await callClaude(system, userMsg, history);
  state.chatHistory.push({ role: "assistant", content: reply });
  return reply;
}

// ─── PAGES ───────────────────────────────
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + id).classList.add("active");
}

// ─── LOGIN ────────────────────────────────
function initLogin() {
  document.getElementById("btnGoogle").addEventListener("click", () => {
    // Simulate Google login
    const mockUser = {
      name: "Alex Kumar",
      email: "alex@gmail.com",
      avatar: null,
      initials: "AK"
    };
    state.user = mockUser;
    S.set("user", mockUser);

    if (state.quizDone && state.interests.length > 0) {
      showPage("app");
      initApp();
    } else {
      showPage("quiz");
      initQuiz();
    }
  });
}

// ─── QUIZ ─────────────────────────────────
let quizStep = 0;
let quizSelections = {}; // step -> [selected labels]

function initQuiz() {
  quizStep = 0;
  quizSelections = {};
  renderQuizStep();

  document.getElementById("btnQuizNext").addEventListener("click", quizNext);
  document.getElementById("btnQuizBack").addEventListener("click", quizBack);
}

function renderQuizStep() {
  const data = QUIZ[quizStep];
  document.getElementById("quizCat").textContent = data.cat;
  document.getElementById("quizQ").textContent = data.q;
  document.getElementById("quizStepLabel").textContent = `${quizStep + 1} / ${QUIZ.length}`;
  document.getElementById("quizProgressFill").style.width = `${((quizStep + 1) / QUIZ.length) * 100}%`;

  const container = document.getElementById("quizOptions");
  container.innerHTML = "";
  data.options.forEach(opt => {
    const el = document.createElement("button");
    el.className = "quiz-option";
    const already = (quizSelections[quizStep] || []).includes(opt.label);
    if (already) el.classList.add("selected");
    el.innerHTML = `<span class="opt-icon">${opt.icon}</span>${opt.label}`;
    el.addEventListener("click", () => {
      const sel = quizSelections[quizStep] || [];
      if (sel.includes(opt.label)) {
        quizSelections[quizStep] = sel.filter(s => s !== opt.label);
      } else {
        quizSelections[quizStep] = [...sel, opt.label];
      }
      renderQuizStep();
    });
    container.appendChild(el);
  });

  // Animate
  container.style.opacity = 0;
  setTimeout(() => { container.style.transition = "opacity 0.3s"; container.style.opacity = 1; }, 10);

  document.getElementById("btnQuizBack").style.visibility = quizStep === 0 ? "hidden" : "visible";
  document.getElementById("btnQuizNext").textContent = quizStep === QUIZ.length - 1 ? "Finish ✓" : "Next →";
}

function quizNext() {
  if (quizStep < QUIZ.length - 1) {
    quizStep++;
    renderQuizStep();
  } else {
    // Collect all interests
    const all = Object.values(quizSelections).flat();
    state.interests = [...new Set(all)];
    S.set("interests", state.interests);
    S.set("quizDone", true);
    state.quizDone = true;
    showPage("app");
    initApp();
  }
}

function quizBack() {
  if (quizStep > 0) {
    quizStep--;
    renderQuizStep();
  }
}

// ─── APP ──────────────────────────────────
function initApp() {
  initSidebar();
  updateHomeGreeting();
  renderDateBadge();
  renderInterestTags();
  renderDailyQuestion();
  renderStats();
  renderHomeEvents();
  setupTabs();
  initHamburger();

  // Lazy load other tabs on switch
}

function initSidebar() {
  const av = document.getElementById("sidebarAvatar");
  if (state.user?.avatar) {
    av.innerHTML = `<img src="${state.user.avatar}" alt="avatar" />`;
  } else {
    av.textContent = state.user?.initials || "U";
  }

  document.getElementById("btnLogout").addEventListener("click", () => {
    S.del("user");
    S.del("quizDone");
    state.user = null;
    state.quizDone = false;
    showPage("login");
  });
}

function initHamburger() {
  const hbg = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");

  // Create overlay
  let overlay = document.getElementById("sidebarOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    overlay.id = "sidebarOverlay";
    document.body.appendChild(overlay);
  }

  hbg.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("visible");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  });
}

function setupTabs() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.dataset.tab;
      switchTab(tab);

      // Close mobile sidebar
      document.getElementById("sidebar").classList.remove("open");
      document.getElementById("sidebarOverlay")?.classList.remove("visible");
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add("active");
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");
  state.currentTab = tab;

  if (tab === "chat") initChat();
  if (tab === "events") renderEventsTab();
  if (tab === "progress") renderProgress();
  if (tab === "news") renderNews();
}

// ─── HOME ─────────────────────────────────
function updateHomeGreeting() {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const name = state.user?.name?.split(" ")[0] || "";
  document.getElementById("homeGreeting").textContent = `${greeting}, ${name} ✦`;
}

function renderDateBadge() {
  const now = new Date();
  document.getElementById("dateBadge").textContent = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long"
  });
}

function renderInterestTags() {
  const container = document.getElementById("interestTags");
  container.innerHTML = state.interests.length
    ? state.interests.map(i => {
        const opt = QUIZ.flatMap(q => q.options).find(o => o.label === i);
        return `<div class="interest-tag"><span class="tag-icon">${opt?.icon || "✦"}</span>${i}</div>`;
      }).join("")
    : "<span style='color:var(--text-muted);font-size:0.85rem'>No interests selected yet.</span>";
}

function renderDailyQuestion() {
  const todayKey = getTodayKey();
  const todayAnswer = state.checkinHistory[todayKey];
  const dq = getTodayQuestion();

  document.getElementById("dailyQuestionText").textContent = dq.q;
  const optsContainer = document.getElementById("dailyOptions");
  optsContainer.innerHTML = "";

  if (todayAnswer) {
    optsContainer.innerHTML = `<div class="daily-answered">✅ You answered: <strong>${todayAnswer.answer}</strong> — See you tomorrow!</div>`;
    return;
  }

  dq.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "daily-opt";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      const entry = {
        q: dq.q,
        answer: opt,
        timestamp: new Date().toISOString()
      };
      state.checkinHistory[todayKey] = entry;
      S.set("checkinHistory", state.checkinHistory);
      renderDailyQuestion();
      renderStats();
    });
    optsContainer.appendChild(btn);
  });
}

function renderStats() {
  const history = state.checkinHistory;
  const keys = Object.keys(history).sort();
  const total = keys.length;

  // Streak calculation
  let streak = 0;
  const today = getTodayKey();
  let checkDate = new Date();
  while (true) {
    const key = checkDate.toISOString().slice(0, 10);
    if (history[key]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }

  document.querySelector("#statStreak .stat-num").textContent = streak;
  document.getElementById("statCheckins").textContent = total;

  const events = generateEvents(state.interests);
  document.getElementById("statEvents").textContent = events.length;
}

function renderHomeEvents() {
  const events = generateEvents(state.interests).slice(0, 4);
  const grid = document.getElementById("homeEventsGrid");
  grid.innerHTML = events.map(e => eventCardHTML(e)).join("");
}

function eventCardHTML(e) {
  return `
    <div class="event-card">
      <div class="event-card-top" style="background:${e.color}">
        <span>${e.icon}</span>
      </div>
      <div class="event-card-body">
        <div class="event-tag" style="background:${e.tagColor}22;color:${e.tagColor}">${e.type}</div>
        <div class="event-title">${e.title}</div>
        <div class="event-meta">
          <span>📅 ${e.date}</span>
          <span>📍 ${e.location}</span>
        </div>
        <div class="event-dist">◉ ${e.dist} away</div>
      </div>
    </div>`;
}

// ─── EVENTS TAB ───────────────────────────
function renderEventsTab() {
  const events = generateEvents(state.interests);
  const filterContainer = document.getElementById("eventsFilter");
  const categories = ["all", ...new Set(events.map(e => e.type))];

  filterContainer.innerHTML = categories.map(cat =>
    `<button class="filter-btn ${state.eventsFilter === cat ? "active" : ""}" data-cat="${cat}">
      ${cat === "all" ? "All Events" : cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>`
  ).join("");

  filterContainer.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.eventsFilter = btn.dataset.cat;
      renderEventsGrid(events);
      filterContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  renderEventsGrid(events);
}

function renderEventsGrid(events) {
  const filtered = state.eventsFilter === "all"
    ? events
    : events.filter(e => e.type === state.eventsFilter);

  document.getElementById("eventsGrid").innerHTML = filtered.map(e => eventCardHTML(e)).join("");
}

// ─── CHAT ─────────────────────────────────
let chatInitialized = false;
function initChat() {
  if (chatInitialized) return;
  chatInitialized = true;

  const intro = `Hi ${state.user?.name?.split(" ")[0] || "there"}! I'm your PulseAI assistant. I know you're into ${state.interests.slice(0, 3).join(", ") || "various things"} — ask me anything about events, news, or just chat!`;
  document.getElementById("chatIntroMsg").textContent = intro;

  document.getElementById("btnSend").addEventListener("click", handleSend);
  document.getElementById("chatInput").addEventListener("keydown", e => {
    if (e.key === "Enter") handleSend();
  });
}

async function handleSend() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";

  appendBubble("user", msg);
  const typing = appendTyping();

  const reply = await sendChat(msg);
  typing.remove();
  appendBubble("ai", reply);
}

function appendBubble(role, text) {
  const win = document.getElementById("chatWindow");
  const div = document.createElement("div");
  div.className = `chat-bubble ${role}`;
  div.innerHTML = `
    <div class="bubble-avatar">${role === "ai" ? "AI" : (state.user?.initials || "U")}</div>
    <div class="bubble-text">${text}</div>`;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return div;
}

function appendTyping() {
  const win = document.getElementById("chatWindow");
  const div = document.createElement("div");
  div.className = "chat-bubble ai";
  div.innerHTML = `<div class="bubble-avatar">AI</div><div class="bubble-text"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return div;
}

// ─── PROGRESS ─────────────────────────────
function renderProgress() {
  const history = state.checkinHistory;
  const keys = Object.keys(history).sort().slice(-7);
  const labels = keys.map(k => {
    const d = new Date(k);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
  });
  const values = keys.map(() => 1);

  // Fill missing days with 0
  const allLabels = [];
  const allVals = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    allLabels.push(d.toLocaleDateString("en-IN", { weekday: "short" }));
    allVals.push(history[key] ? 1 : 0);
  }

  // Destroy old charts
  ["chartCheckins", "chartInterests"].forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas._chart) { canvas._chart.destroy(); }
  });

  const ctxC = document.getElementById("chartCheckins");
  ctxC._chart = new Chart(ctxC, {
    type: "bar",
    data: {
      labels: allLabels,
      datasets: [{
        label: "Check-ins",
        data: allVals,
        backgroundColor: allVals.map(v => v ? "rgba(124,106,255,0.7)" : "rgba(255,255,255,0.05)"),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { max: 1, ticks: { stepSize: 1, color: "rgba(240,240,248,0.4)" }, grid: { color: "rgba(255,255,255,0.05)" } },
        x: { ticks: { color: "rgba(240,240,248,0.4)" }, grid: { display: false } }
      }
    }
  });

  // Interest radar
  const interestLabels = state.interests.slice(0, 6);
  const interestData = interestLabels.map(() => Math.floor(Math.random() * 7) + 3);

  const ctxI = document.getElementById("chartInterests");
  ctxI._chart = new Chart(ctxI, {
    type: "radar",
    data: {
      labels: interestLabels.length ? interestLabels : ["No interests yet"],
      datasets: [{
        label: "Activity",
        data: interestLabels.length ? interestData : [0],
        backgroundColor: "rgba(124,106,255,0.2)",
        borderColor: "rgba(124,106,255,0.8)",
        pointBackgroundColor: "#7c6aff",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#7c6aff"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: "rgba(255,255,255,0.07)" },
          angleLines: { color: "rgba(255,255,255,0.07)" },
          pointLabels: { color: "rgba(240,240,248,0.55)", font: { size: 11 } }
        }
      }
    }
  });

  // History list
  const histList = document.getElementById("historyList");
  const allKeys = Object.keys(history).sort().reverse();
  if (allKeys.length === 0) {
    histList.innerHTML = `<div style="color:var(--text-muted);font-size:0.88rem;padding:16px">No check-ins yet. Answer the daily question to start your streak!</div>`;
    return;
  }
  histList.innerHTML = allKeys.map(k => {
    const d = new Date(k);
    const entry = history[k];
    return `<div class="history-item">
      <div class="history-date">${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
      <div class="history-answer">
        <div class="history-q">${entry.q}</div>
        <strong>${entry.answer}</strong>
      </div>
      <div class="history-check">✓</div>
    </div>`;
  }).join("");
}

// ─── NEWS ─────────────────────────────────
let newsLoaded = false;
async function renderNews() {
  if (newsLoaded) return;
  newsLoaded = true;
  const grid = document.getElementById("newsGrid");
  grid.innerHTML = `<div class="news-loading">✦ Generating your personalised brief…</div>`;

  const articles = await fetchPersonalisedNews(state.interests);
  const topicColors = {
    "Technology": "#7c6aff", "AI & ML": "#7c6aff", "Business": "#ffb86c",
    "World News": "#6affda", "Climate": "#6affda", "Sports": "#ff6a9f",
    "Entertainment": "#ff6a9f", "Science": "#3fa8ff", "Health": "#3fa8ff",
    "Politics": "#ffb86c", "Innovation": "#7c6aff"
  };

  grid.innerHTML = articles.map(a => {
    const color = topicColors[a.topic] || "#7c6aff";
    return `<div class="news-card">
      <div class="news-topic" style="color:${color}">${a.topic}</div>
      <div class="news-headline">${a.headline}</div>
      <div class="news-summary">${a.summary}</div>
      <div class="news-meta">📰 ${a.source} · ${a.time}</div>
    </div>`;
  }).join("");
}

// ─── INIT ─────────────────────────────────
function init() {
  if (state.user && state.quizDone) {
    showPage("app");
    initApp();
  } else if (state.user && !state.quizDone) {
    showPage("quiz");
    initQuiz();
  } else {
    showPage("login");
    initLogin();
  }
}

init();
/* ════════════════════════════════════════════════════════
   INTEREST DETAIL PAGE — JS MODULE
   Paste this at the VERY BOTTOM of app.js
════════════════════════════════════════════════════════ */

// ─── INTEREST THEME MAP ──────────────────
// Each interest gets a unique visual identity:
// hero gradient, accent colour, Unsplash image keyword, daily questions
const INTEREST_THEMES = {
  "Cooking": {
    accent: "#ff9a3c",
    gradient: "linear-gradient(135deg,#3d1a00 0%,#8b3a00 40%,#c9591a 100%)",
    bg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
    questions: [
      { q: "What did you cook or try today?", opts: ["🍳 Breakfast dish", "🥗 Something healthy", "🍝 A recipe I found", "🧁 Baked something", "😅 I ordered in"] },
      { q: "How confident are you in the kitchen today?", opts: ["👨‍🍳 Chef mode", "💪 Getting better", "😐 Average", "😬 Struggling"] },
      { q: "What cuisine are you exploring this week?", opts: ["🇮🇳 Indian", "🍜 Asian", "🍕 Italian", "🌮 Mexican", "🌍 Something new"] }
    ]
  },
  "Coding / Tech": {
    accent: "#7c6aff",
    gradient: "linear-gradient(135deg,#0d0d2b 0%,#1a1060 40%,#3b2dbf 100%)",
    bg: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80",
    questions: [
      { q: "What did you code or build today?", opts: ["🐛 Fixed a bug", "🚀 New feature", "📚 Learning a concept", "💡 Just exploring", "😴 Rest day"] },
      { q: "How's your flow state today?", opts: ["⚡ In the zone", "👍 Decent focus", "😐 Distracted", "🤯 Overwhelmed"] },
      { q: "What are you working on?", opts: ["🤖 AI/ML project", "🌐 Web app", "📱 Mobile app", "🔧 Tools/scripts", "🎮 Game"] }
    ]
  },
  "Hackathon": {
    accent: "#f7c948",
    gradient: "linear-gradient(135deg,#1a1200 0%,#4a3200 40%,#8b6300 100%)",
    bg: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    questions: [
      { q: "How prepared do you feel for your next hackathon?", opts: ["🔥 Super ready", "💪 Getting there", "📚 Still learning", "😅 Need a team"] },
      { q: "What's your strongest hackathon skill?", opts: ["⚡ Speed coding", "🎨 Design", "💡 Ideation", "📊 Presentation", "🤝 Team lead"] },
      { q: "What's your goal this week?", opts: ["🏆 Win a prize", "🔧 Build a prototype", "🤝 Find teammates", "📚 Practice", "🌐 Network"] }
    ]
  },
  "Art & Design": {
    accent: "#ff6a9f",
    gradient: "linear-gradient(135deg,#1a0010 0%,#4a0030 40%,#9b0060 100%)",
    bg: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
    questions: [
      { q: "Did you create anything today?", opts: ["🎨 Drew or painted", "✏️ Sketched ideas", "💻 Digital design", "📷 Photography", "😴 Not today"] },
      { q: "What's inspiring you right now?", opts: ["🌿 Nature", "🏙️ Urban life", "🎵 Music", "📚 Art history", "✨ My imagination"] },
      { q: "What medium are you exploring?", opts: ["🖌️ Painting", "✏️ Illustration", "🖥️ UI/UX", "📸 Photography", "🎬 Motion"] }
    ]
  },
  "Music": {
    accent: "#9b6aff",
    gradient: "linear-gradient(135deg,#0a0018 0%,#1e0050 40%,#4b0082 100%)",
    bg: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    questions: [
      { q: "Did you listen to or create music today?", opts: ["🎵 Listened to new stuff", "🎸 Practiced instrument", "🎧 Deep listening session", "🎤 Sang along", "😴 Not today"] },
      { q: "What genre are you into right now?", opts: ["🎷 Jazz", "🎸 Rock/Indie", "🎹 Classical", "🔊 EDM", "🌶️ Hip-hop/R&B"] },
      { q: "How's your musical journey?", opts: ["🚀 Progressing fast", "👍 Steady pace", "💡 Exploring new styles", "😐 Need motivation"] }
    ]
  },
  "Fitness": {
    accent: "#6affda",
    gradient: "linear-gradient(135deg,#001a14 0%,#004a38 40%,#00836a 100%)",
    bg: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
    questions: [
      { q: "Did you work out today?", opts: ["💪 Full workout", "🚶 Light activity", "🧘 Stretching/yoga", "😴 Rest day", "😅 Skipped it"] },
      { q: "How's your energy level?", opts: ["⚡ Peak energy", "👍 Good", "😐 Okay", "🪫 Tired"] },
      { q: "What's your focus this week?", opts: ["🏋️ Strength", "🏃 Cardio", "🧘 Flexibility", "⚖️ Weight loss", "🏆 Performance"] }
    ]
  },
  "Reading / Books": {
    accent: "#ffb86c",
    gradient: "linear-gradient(135deg,#1a0f00 0%,#4a2800 40%,#8b5200 100%)",
    bg: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
    questions: [
      { q: "Did you read today?", opts: ["📖 Read for an hour+", "📄 A few pages", "🎧 Audiobook", "📱 Articles/blogs", "😴 Not today"] },
      { q: "What genre are you in?", opts: ["🚀 Sci-fi/Fantasy", "📊 Non-fiction", "🔍 Mystery/Thriller", "💭 Philosophy", "📜 Historical"] },
      { q: "How many books this year so far?", opts: ["🏆 10+", "📚 5–9", "📖 2–4", "📄 Just 1", "🆕 Starting first"] }
    ]
  },
  "Gaming": {
    accent: "#3fa8ff",
    gradient: "linear-gradient(135deg,#000d1a 0%,#001e40 40%,#003a80 100%)",
    bg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
    questions: [
      { q: "Did you play today?", opts: ["🎮 Long session", "⚡ Quick match", "🎯 Competitive grind", "🌍 Explored a world", "😴 Not today"] },
      { q: "What mode are you in?", opts: ["🏆 Ranked/Competitive", "😌 Casual", "🤝 With friends", "🧩 Solo story", "🆕 Trying new game"] },
      { q: "What kind of games?", opts: ["🔫 FPS/Action", "🧠 Strategy/RTS", "🗡️ RPG", "🏎️ Racing/Sports", "🧩 Puzzle/Indie"] }
    ]
  },
  "Travel": {
    accent: "#6affda",
    gradient: "linear-gradient(135deg,#001520 0%,#003050 40%,#005580 100%)",
    bg: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
    questions: [
      { q: "Are you planning a trip?", opts: ["✈️ Booked one!", "🗺️ Research phase", "💭 Just dreaming", "🏠 Staycation mode", "✅ Just returned"] },
      { q: "What kind of travel excites you?", opts: ["🏔️ Adventure", "🏖️ Beach/Relax", "🏛️ Cultural", "🍽️ Food tourism", "🎒 Backpacking"] },
      { q: "Next destination on your wishlist?", opts: ["🇯🇵 Asia", "🇪🇺 Europe", "🌎 Americas", "🌍 Africa/ME", "🇮🇳 India local"] }
    ]
  },
  "Startups": {
    accent: "#f7c948",
    gradient: "linear-gradient(135deg,#1a1100 0%,#3a2800 40%,#705000 100%)",
    bg: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80",
    questions: [
      { q: "What did you work on startup-wise today?", opts: ["💡 Refined my idea", "🔧 Built something", "🤝 Networked", "📊 Researched market", "😴 Took a break"] },
      { q: "Where are you in your journey?", opts: ["💭 Idea stage", "🔬 Validating", "🚀 Building MVP", "📈 Growing", "💰 Fundraising"] },
      { q: "Biggest challenge right now?", opts: ["🧑‍🤝‍🧑 Finding co-founder", "💰 Funding", "👥 Getting users", "🔧 Tech/Product", "⏰ Time management"] }
    ]
  },
  "AI & ML": {
    accent: "#c97aff",
    gradient: "linear-gradient(135deg,#0d0018 0%,#1e0040 40%,#480090 100%)",
    bg: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    questions: [
      { q: "What did you learn in AI/ML today?", opts: ["🤖 New model/paper", "💻 Coded a project", "📹 Tutorial/course", "💬 Discussed with peers", "😴 Rest day"] },
      { q: "What's your current focus area?", opts: ["🧠 Deep Learning", "🗣️ NLP/LLMs", "👁️ Computer Vision", "🎮 Reinforcement Learning", "📊 Data Science"] },
      { q: "How's your skill level?", opts: ["🌱 Beginner", "📚 Intermediate", "💪 Advanced", "🏆 Expert", "🚀 Researcher"] }
    ]
  },
  "Wellness": {
    accent: "#6affb4",
    gradient: "linear-gradient(135deg,#001a0d 0%,#004020 40%,#007040 100%)",
    bg: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
    questions: [
      { q: "How did you take care of yourself today?", opts: ["🧘 Meditated", "🌿 Ate mindfully", "😴 Got good sleep", "🚶 Took a walk", "📓 Journaled"] },
      { q: "What's your wellness focus?", opts: ["🧠 Mental health", "💪 Physical health", "😌 Stress relief", "🌙 Better sleep", "🌱 Healthy habits"] },
      { q: "Mood check — how are you really?", opts: ["😄 Thriving", "🙂 Good", "😐 Neutral", "😔 Low", "🤯 Overwhelmed"] }
    ]
  }
};

// Fallback theme for interests without specific config
function getTheme(interest) {
  return INTEREST_THEMES[interest] || {
    accent: "#7c6aff",
    gradient: "linear-gradient(135deg,#0a0020 0%,#1a0060 40%,#3b10b0 100%)",
    bg: null,
    questions: [
      { q: `How engaged are you with ${interest} today?`, opts: ["🔥 Very engaged", "👍 A bit", "😐 Not much", "💤 Off day"] },
      { q: `What's your goal for ${interest} this week?`, opts: ["📚 Learn something", "💡 Create something", "🤝 Connect with others", "🏆 Reach a milestone"] },
      { q: `How's your progress in ${interest}?`, opts: ["🚀 Growing fast", "📈 Steady", "😐 Plateau", "🌱 Just starting"] }
    ]
  };
}

// ─── INTEREST-SPECIFIC EVENTS ─────────────
function getEventsForInterest(interest) {
  const all = generateEvents([interest]);
  // Return events matching this interest; fall back to top 3 generic ones
  const matched = all.filter(e =>
    e.category.toLowerCase().includes(interest.toLowerCase()) ||
    interest.toLowerCase().includes(e.type)
  );
  return matched.length ? matched : all.slice(0, 3);
}

// ─── INTEREST-SPECIFIC DAILY CHECK-IN ────
function getTodayCheckinKey(interest) {
  return `checkin_interest_${interest.replace(/\s+/g,"_")}_${getTodayKey()}`;
}

function getInterestStreak(interest) {
  const base = `checkin_interest_${interest.replace(/\s+/g,"_")}`;
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const key = base + "_" + checkDate.toISOString().slice(0, 10);
    if (S.get(key)) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
    else break;
  }
  return streak;
}

function getInterestTotalCheckins(interest) {
  const base = `checkin_interest_${interest.replace(/\s+/g,"_")}`;
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (key.startsWith("pulseai_" + base)) count++;
  }
  return count;
}

function getInterest7DayActivity(interest) {
  const base = `checkin_interest_${interest.replace(/\s+/g,"_")}`;
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = base + "_" + d.toISOString().slice(0, 10);
    result.push({ label: d.toLocaleDateString("en-IN", { weekday: "short" }), done: !!S.get(key) });
  }
  return result;
}

// ─── NEWS FOR INTEREST ───────────────────
async function fetchInterestNews(interest) {
  const prompt = `You are a news curator. Generate 4 short, realistic news briefs specifically about "${interest}" relevant to someone in Bengaluru, India. Today is ${new Date().toDateString()}.

Return ONLY a valid JSON array, no markdown, no backticks:
[{"headline":"Headline here","summary":"2-3 sentence summary.","source":"Source Name","time":"X hours ago"}]`;
  try {
    const raw = await callClaude(
      "You are a JSON-only news generator. Return raw JSON only, no markdown, no extra text.",
      prompt
    );
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return [
      { headline: `Latest in ${interest}: New trends this week`, summary: `The ${interest} community is buzzing with new developments and exciting opportunities in Bengaluru.`, source: "PulseAI Brief", time: "1 hour ago" },
      { headline: `${interest} spotlight: Rising stars and events`, summary: `Local enthusiasts are gathering to share insights and push boundaries in ${interest}.`, source: "PulseAI Brief", time: "3 hours ago" }
    ];
  }
}

// ─── RENDER INTEREST PAGE ────────────────
let ipChart = null; // track chart instance

async function openInterestPage(interest) {
  const theme = getTheme(interest);
  const opt = QUIZ.flatMap(q => q.options).find(o => o.label === interest);
  const icon = opt?.icon || "✦";

  // ── Apply theme ──
  document.documentElement.style.setProperty("--ip-accent", theme.accent);

  const hero = document.getElementById("ipHero");
  if (theme.bg) {
    hero.style.backgroundImage = `url("${theme.bg}")`;
    hero.style.backgroundSize = "cover";
    hero.style.backgroundPosition = "center";
  } else {
    hero.style.backgroundImage = theme.gradient;
  }

  document.getElementById("ipHeroIcon").textContent = icon;
  document.getElementById("ipHeroTitle").textContent = interest;
  document.getElementById("ipHeroSub").textContent = `Your personal ${interest} hub`;

  // ── Stats ──
  document.getElementById("ipStreakNum").textContent = getInterestStreak(interest);
  document.getElementById("ipCheckinNum").textContent = getInterestTotalCheckins(interest);
  document.getElementById("ipEventsNum").textContent = getEventsForInterest(interest).length;

  // ── Daily Check-in ──
  renderIpDailyQuestion(interest, theme);

  // ── 7-day chart ──
  renderIpChart(interest, theme);

  // ── Events ──
  renderIpEvents(interest, theme);

  // ── News (async) ──
  document.getElementById("ipNewsList").innerHTML = `<div class="ip-news-loading">✦ Fetching ${interest} news…</div>`;

  // Show the page
  showPage("interest");

  // Back button
  document.getElementById("ipBack").onclick = () => {
    showPage("app");
    // Reset CSS var
    document.documentElement.style.removeProperty("--ip-accent");
  };

  // Fetch news in background
  const articles = await fetchInterestNews(interest);
  renderIpNews(articles, theme);
}

function renderIpDailyQuestion(interest, theme) {
  const theme_data = getTheme(interest);
  const todayKey = getTodayCheckinKey(interest);
  const savedAnswer = S.get(todayKey);

  // Rotate question by day of week
  const qData = theme_data.questions[new Date().getDay() % theme_data.questions.length];

  document.getElementById("ipDailyQ").textContent = qData.q;
  const optsDiv = document.getElementById("ipDailyOpts");
  optsDiv.innerHTML = "";

  if (savedAnswer) {
    optsDiv.innerHTML = `<div class="ip-answered">✅ Answered: <strong>${savedAnswer}</strong> — See you tomorrow!</div>`;
    return;
  }

  qData.opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "ip-daily-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      S.set(todayKey, opt);
      // Refresh streak display
      document.getElementById("ipStreakNum").textContent = getInterestStreak(interest);
      document.getElementById("ipCheckinNum").textContent = getInterestTotalCheckins(interest);
      renderIpDailyQuestion(interest, theme);
    });
    optsDiv.appendChild(btn);
  });
}

function renderIpChart(interest, theme) {
  const activity = getInterest7DayActivity(interest);
  const labels = activity.map(a => a.label);
  const data = activity.map(a => a.done ? 1 : 0);

  if (ipChart) { ipChart.destroy(); ipChart = null; }

  const ctx = document.getElementById("ipChart");
  ipChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Check-in",
        data,
        backgroundColor: data.map(v => v
          ? theme.accent + "cc"
          : "rgba(255,255,255,0.04)"
        ),
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          max: 1, min: 0,
          ticks: { stepSize: 1, color: "rgba(240,240,248,0.35)" },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
        x: {
          ticks: { color: "rgba(240,240,248,0.4)" },
          grid: { display: false }
        }
      }
    }
  });
}

function renderIpEvents(interest, theme) {
  const events = getEventsForInterest(interest);
  const grid = document.getElementById("ipEventsGrid");
  if (!events.length) {
    grid.innerHTML = `<div class="ip-no-events">No events found near you for this interest yet.</div>`;
    return;
  }
  grid.innerHTML = events.map(e => `
    <div class="ip-event-card">
      <div class="ip-event-emoji">${e.icon}</div>
      <div class="ip-event-title">${e.title}</div>
      <div class="ip-event-meta">
        <span>📅 ${e.date}</span>
        <span>📍 ${e.location}</span>
      </div>
      <div class="ip-event-dist" style="color:${theme.accent}">◉ ${e.dist} away</div>
    </div>`
  ).join("");
}

function renderIpNews(articles, theme) {
  document.getElementById("ipNewsList").innerHTML = articles.map(a => `
    <div class="ip-news-item">
      <div class="ip-news-headline">${a.headline}</div>
      <div class="ip-news-summary">${a.summary}</div>
      <div class="ip-news-meta">📰 ${a.source} · ${a.time}</div>
    </div>`
  ).join("");
}

// ─── PATCH: Make interest tags clickable ─
// This replaces the renderInterestTags function in the original app.js
// Just overwrites it — place this AFTER the original function in the file
function renderInterestTags() {
  const container = document.getElementById("interestTags");
  if (!container) return;
  container.innerHTML = state.interests.length
    ? state.interests.map(i => {
        const opt = QUIZ.flatMap(q => q.options).find(o => o.label === i);
        return `<div class="interest-tag" data-interest="${i}" title="Click to explore ${i}">
          <span class="tag-icon">${opt?.icon || "✦"}</span>${i}
        </div>`;
      }).join("")
    : `<span style='color:var(--text-muted);font-size:0.85rem'>No interests selected yet.</span>`;

  // Attach click handlers
  container.querySelectorAll(".interest-tag[data-interest]").forEach(tag => {
    tag.addEventListener("click", () => {
      openInterestPage(tag.dataset.interest);
    });
  });
}
const calendar = document.getElementById("calendar");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

// key for storage
const key = `visits-${year}-${month}`;

// get stored visits
let visits = JSON.parse(localStorage.getItem(key)) || [];

// mark today as visited
const todayDate = today.getDate();
if (!visits.includes(todayDate)) {
  visits.push(todayDate);
  localStorage.setItem(key, JSON.stringify(visits));
}

// total days in month
const daysInMonth = new Date(year, month + 1, 0).getDate();

// create calendar
for (let i = 1; i <= daysInMonth; i++) {
  const div = document.createElement("div");
  div.classList.add("day");
  div.innerText = i;

  if (visits.includes(i)) {
    div.classList.add("visited");
  }

  calendar.appendChild(div);
}
