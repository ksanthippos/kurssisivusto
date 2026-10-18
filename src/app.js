const state = {
  courses: [],
  activeGrade: "9",
  activeCourse: null,
  activeCourseData: null,
  activeLessonNumber: 1
};

// DOM-elementit
const courseSelect = document.querySelector("#course-select");
const lessonNav = document.querySelector("#lesson-nav");
const breadcrumbs = document.querySelector("#breadcrumbs");
const lessonBadge = document.querySelector("#lesson-badge");
const lessonHeading = document.querySelector("#lesson-heading");
const lessonSummaryBox = document.querySelector("#lesson-summary-box");
const lessonBody = document.querySelector("#lesson-body");
const lessonEmbedSection = document.querySelector("#lesson-embed-section");
const embedTitle = document.querySelector("#embed-title");
const embedWrapper = document.querySelector("#embed-wrapper");
const lessonTasksSection = document.querySelector("#lesson-tasks-section");
const taskCardsGrid = document.querySelector("#task-cards-grid");
const prevLessonBtn = document.querySelector("#prev-lesson-btn");
const nextLessonBtn = document.querySelector("#next-lesson-btn");
const navTabs = document.querySelectorAll(".nav-tab");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-navigation");

async function init() {
  try {
    const res = await fetch("src/data/courses.json");
    if (!res.ok) throw new Error("Kurssiluettelon lataaminen epäonnistui.");
    state.courses = await res.json();

    setupEventListeners();
    parseRoute();
  } catch (err) {
    console.error(err);
    lessonHeading.textContent = "Virhe tietojen lataamisessa";
    lessonBody.innerHTML = "<p>Kurssiluettelon lataus epäonnistui. Varmista että tiedostot ovat saatavilla.</p>";
  }
}

function setupEventListeners() {
  // Luokka-astevälilehdet
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const grade = tab.dataset.grade;
      setGrade(grade);
    });
  });

  // Kurssin valinta alasvetovalikosta
  courseSelect.addEventListener("change", () => {
    const code = courseSelect.value;
    if (code) {
      navigateTo(code, 1);
    }
  });

  // Edellinen / seuraava tunti
  prevLessonBtn.addEventListener("click", () => {
    if (state.activeLessonNumber > 1) {
      navigateTo(state.activeCourse.code, state.activeLessonNumber - 1);
    }
  });

  nextLessonBtn.addEventListener("click", () => {
    const max = state.activeCourseData?.lessons?.length || 1;
    if (state.activeLessonNumber < max) {
      navigateTo(state.activeCourse.code, state.activeLessonNumber + 1);
    }
  });

  // Mobiilivalikko
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("is-open");
    });
  }

  // Kuunnellaan selaimen takaisin/eteenpäin -painikkeita (hashchange)
  window.addEventListener("hashchange", parseRoute);
}

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) {
    // Oletusaloitus: 9. lk ja FY_91
    setGrade("9", "FY_91", 1);
    return;
  }

  const parts = hash.split("/");
  const courseCode = parts[0];
  const lessonNum = parseInt(parts[1], 10) || 1;

  const foundCourse = state.courses.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
  if (foundCourse) {
    state.activeGrade = foundCourse.grade;
    updateGradeTabsUI();
    populateCourseSelect(foundCourse.grade, foundCourse.code);
    loadCourse(foundCourse.code, lessonNum);
  } else {
    setGrade("9", "FY_91", 1);
  }
}

function navigateTo(courseCode, lessonNumber) {
  window.location.hash = `#/${courseCode}/${lessonNumber}`;
}

function setGrade(grade, preferredCourseCode = null, lessonNumber = 1) {
  state.activeGrade = grade;
  updateGradeTabsUI();

  const filtered = state.courses.filter((c) => c.grade === grade);
  const targetCode = preferredCourseCode || (filtered.length ? filtered[0].code : null);

  populateCourseSelect(grade, targetCode);

  if (targetCode) {
    navigateTo(targetCode, lessonNumber);
  }
}

function updateGradeTabsUI() {
  navTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.grade === state.activeGrade);
  });
  if (mainNav) mainNav.classList.remove("is-open");
}

function populateCourseSelect(grade, selectedCode) {
  courseSelect.innerHTML = "";
  const filtered = state.courses.filter((c) => c.grade === grade);

  filtered.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = `${c.code}: ${c.title}`;
    if (c.code === selectedCode) {
      opt.selected = true;
    }
    courseSelect.appendChild(opt);
  });
}

async function loadCourse(courseCode, lessonNumber) {
  state.activeCourse = state.courses.find((c) => c.code === courseCode) || null;
  state.activeLessonNumber = lessonNumber;

  lessonHeading.textContent = "Ladataan oppituntia…";
  lessonBody.innerHTML = "";

  try {
    // Yritetään ladata kurssin oma rikas oppimateriaali
    let res = await fetch(`src/data/courses/${courseCode.toLowerCase()}.json`);
    
    // Jos omaa rikastettua tiedostoa ei ole vielä luotu, käytetään kurssiportaalin perusdataa
    if (!res.ok) {
      res = await fetch(`../kurssi-portaali/src/data/${courseCode.toLowerCase()}.json`);
    }

    if (!res.ok) {
      throw new Error(`Kurssin ${courseCode} materiaaleja ei löydetty.`);
    }

    state.activeCourseData = await res.json();
    renderLessonNav();
    renderActiveLesson();
  } catch (err) {
    console.error(err);
    lessonHeading.textContent = `${courseCode}: Materiaalia valmistellaan`;
    lessonBody.innerHTML = `<p>Tämän kurssin oppimateriaalit ovat parhaillaan työn alla.</p>`;
    lessonEmbedSection.hidden = true;
    lessonTasksSection.hidden = true;
  }
}

function renderLessonNav() {
  lessonNav.innerHTML = "";
  const lessons = state.activeCourseData?.lessons || [];

  lessons.forEach((l) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `lesson-nav-btn ${l.lesson === state.activeLessonNumber ? "active" : ""}`;
    
    btn.innerHTML = `
      <span class="num">#${l.lesson}</span>
      <span class="title">${escapeHtml(l.title || l.topic || `Tunti ${l.lesson}`)}</span>
    `;

    btn.addEventListener("click", () => {
      navigateTo(state.activeCourse.code, l.lesson);
    });

    lessonNav.appendChild(btn);
  });
}

function renderActiveLesson() {
  const lessons = state.activeCourseData?.lessons || [];
  const current = lessons.find((l) => l.lesson === state.activeLessonNumber) || lessons[0];

  if (!current) {
    lessonHeading.textContent = "Oppituntia ei löytynyt";
    return;
  }

  state.activeLessonNumber = current.lesson;

  // Leivänmurut
  const subjectName = state.activeCourse?.subject === "fysiikka" ? "Fysiikka" : "Matematiikka";
  breadcrumbs.textContent = `${state.activeGrade}. luokka › ${subjectName} › ${state.activeCourse.code}`;

  // Otsikko ja tiivistelmä
  lessonBadge.textContent = `Oppitunti #${current.lesson}`;
  lessonHeading.textContent = current.title || current.topic || `Oppitunti ${current.lesson}`;
  
  if (current.summary || current.content) {
    lessonSummaryBox.hidden = false;
    lessonSummaryBox.textContent = current.summary || current.content;
  } else {
    lessonSummaryBox.hidden = true;
  }

  // Teoriaosuus
  if (current.theory) {
    lessonBody.innerHTML = current.theory;
  } else if (current.content) {
    lessonBody.innerHTML = `<p>${escapeHtml(current.content)}</p>`;
  } else {
    lessonBody.innerHTML = "<p>Oppitunnin teoriamateriaali lisätään pian.</p>";
  }

  // KaTeX kaavojen automaattinen renderöinti
  renderKaTeX(lessonBody);

  // Simulaatio / Video
  if (current.simulation?.url) {
    lessonEmbedSection.hidden = false;
    embedTitle.textContent = current.simulation.title || "Interaktiivinen simulaatio";
    embedWrapper.innerHTML = `
      <iframe 
        src="${current.simulation.url}" 
        title="${escapeHtml(current.simulation.title || "Simulaatio")}"
        allowfullscreen 
        loading="lazy"
      ></iframe>
    `;
  } else {
    lessonEmbedSection.hidden = true;
    embedWrapper.innerHTML = "";
  }

  // Tehtävät
  renderTasks(current.tasks);

  // Edellinen / Seuraava -painikkeiden tilat
  prevLessonBtn.disabled = current.lesson <= 1;
  nextLessonBtn.disabled = current.lesson >= lessons.length;

  // Vieritys ylös
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTasks(tasks) {
  if (!tasks || typeof tasks !== "object") {
    lessonTasksSection.hidden = true;
    return;
  }

  const taskDefs = [
    { key: "research", label: "Tutkimus", className: "research" },
    { key: "theory", label: "Työkirja", className: "theory" },
    { key: "warmup", label: "Lämmittely", className: "warmup" },
    { key: "blue", label: "Siniset", className: "blue" },
    { key: "red", label: "Punaiset", className: "red" }
  ];

  const rows = taskDefs
    .filter((def) => tasks[def.key] && tasks[def.key].trim() !== "")
    .map(
      (def) => `
        <div class="task-card-row">
          <span class="task-badge ${def.className}">${def.label}</span>
          <span class="task-desc">${escapeHtml(tasks[def.key])}</span>
        </div>
      `
    )
    .join("");

  if (rows) {
    taskCardsGrid.innerHTML = rows;
    lessonTasksSection.hidden = false;
  } else {
    lessonTasksSection.hidden = true;
  }
}

function renderKaTeX(container) {
  if (typeof renderMathInElement === "function") {
    renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Käynnistetään sovellus
init();
