// Tila ja mallit
const state = {
  courses: [],
  books: [],
  revisions: [],
  info: null,
  favorites: [], // Kurssikoodit, esim. ["FY_91", "MA_72"], max 3
  defaultView: "home", // "home" tai kurssikoodi esim. "FY_91"
  activeView: "home", // "home" | "lesson" | "kirjat" | "kertaus" | "arviointi"
  activeGrade: "7",
  activeCourse: null,
  activeCourseData: null,
  activeLessonNumber: 1,
  activeBooksFilter: "all",
  activeRevisionFilter: "all"
};

// DOM-elementit
const courseSelect = document.querySelector("#course-select");
const lessonNav = document.querySelector("#lesson-nav");
const breadcrumbs = document.querySelector("#breadcrumbs");
const lessonBadge = document.querySelector("#lesson-badge");
const favoriteToggleBtn = document.querySelector("#favorite-toggle-btn");
const starIcon = document.querySelector("#star-icon");
const starLabel = document.querySelector("#star-label");
const lessonHeading = document.querySelector("#lesson-heading");
const lessonSummaryBox = document.querySelector("#lesson-summary-box");
const lessonBody = document.querySelector("#lesson-body");
const lessonEmbedSection = document.querySelector("#lesson-embed-section");
const embedTitle = document.querySelector("#embed-title");
const embedTag = document.querySelector("#embed-tag");
const embedExternalLink = document.querySelector("#embed-external-link");
const embedWrapper = document.querySelector("#embed-wrapper");
const lessonDeepDiveSection = document.querySelector("#lesson-deep-dive-section");
const deepDiveCard = document.querySelector("#deep-dive-card");
const deepDiveHeading = document.querySelector("#deep-dive-heading");
const deepDiveBody = document.querySelector("#deep-dive-body");
const lessonTasksSection = document.querySelector("#lesson-tasks-section");
const taskCardsGrid = document.querySelector("#task-cards-grid");
const lessonContextLinks = document.querySelector("#lesson-context-links");
const prevLessonBtn = document.querySelector("#prev-lesson-btn");
const nextLessonBtn = document.querySelector("#next-lesson-btn");
const navTabs = document.querySelectorAll(".nav-tab");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-navigation");
const toast = document.querySelector("#toast");

// Sivupalkin ohjainalueet
const sidebarLessonControls = document.querySelector("#sidebar-lesson-controls");
const sidebarBooksControls = document.querySelector("#sidebar-books-controls");
const sidebarRevisionControls = document.querySelector("#sidebar-revision-controls");
const sidebarFavoritesList = document.querySelector("#sidebar-favorites-list");
const sidebarFavCount = document.querySelector("#sidebar-fav-count");
const booksQuickNav = document.querySelector("#books-quick-nav");
const revisionQuickNav = document.querySelector("#revision-quick-nav");
const booksFilterPills = document.querySelectorAll("#books-filter-pills .filter-pill");
const revisionFilterPills = document.querySelectorAll("#revision-filter-pills .filter-pill");

// Päänäkymä-paneelit
const viewHome = document.querySelector("#view-home");
const viewLesson = document.querySelector("#view-lesson");
const viewBooks = document.querySelector("#view-books");
const viewRevision = document.querySelector("#view-revision");
const viewArviointi = document.querySelector("#view-arviointi");

// Kotinäkymän elementit
const homeFavoritesGrid = document.querySelector("#home-favorites-grid");
const favoritesCounter = document.querySelector("#favorites-counter");
const defaultSettingOptions = document.querySelector("#default-setting-options");
const homeCoursesGradesGrid = document.querySelector("#home-courses-grades-grid");

// Kirjanäkymän elementit
const booksGrid = document.querySelector("#books-grid");
const booksPdfViewer = document.querySelector("#books-pdf-viewer");
const booksViewerTitle = document.querySelector("#books-viewer-title");
const booksViewerExternalLink = document.querySelector("#books-viewer-external-link");
const booksViewerCloseBtn = document.querySelector("#books-viewer-close-btn");
const booksPdfFrame = document.querySelector("#books-pdf-frame");

// Kertausnäkymän elementit
const revisionCardsList = document.querySelector("#revision-cards-list");
const revisionPdfViewer = document.querySelector("#revision-pdf-viewer");
const revisionViewerTitle = document.querySelector("#revision-viewer-title");
const revisionViewerExternalLink = document.querySelector("#revision-viewer-external-link");
const revisionViewerCloseBtn = document.querySelector("#revision-viewer-close-btn");
const revisionPdfFrame = document.querySelector("#revision-pdf-frame");

// Info-näkymän elementit
const infoSectionsContainer = document.querySelector("#info-sections-container");

// Alustus
async function init() {
  try {
    loadPreferences();

    // Ladataan rinnakkain perusdata
    const [coursesRes, booksRes, revisionsRes, infoRes] = await Promise.all([
      fetch("src/data/courses.json"),
      fetch("src/data/books.json"),
      fetch("src/data/revisions.json"),
      fetch("src/data/info.json")
    ]);

    if (coursesRes.ok) state.courses = await coursesRes.json();
    if (booksRes.ok) state.books = await booksRes.json();
    if (revisionsRes.ok) state.revisions = await revisionsRes.json();
    if (infoRes.ok) state.info = await infoRes.json();

    setupEventListeners();
    renderSidebarFavorites();
    parseRoute();
  } catch (err) {
    console.error("Alustusvirhe:", err);
    if (lessonHeading) lessonHeading.textContent = "Virhe aineiston lataamisessa";
    if (lessonBody) lessonBody.innerHTML = "<p>Tietojen lataus epäonnistui. Varmista että selaimella on pääsy tiedostoihin.</p>";
  }
}

// Tapahtumankuuntelijat
function setupEventListeners() {
  // Yläpalkin navigaatiopainikkeet
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const navType = tab.dataset.nav;
      if (navType === "grade") {
        const grade = tab.dataset.grade;
        setGrade(grade);
      } else if (navType === "view") {
        const targetView = tab.dataset.view;
        window.location.hash = `#/${targetView}`;
      }
    });
  });

  // Suosikkitähden klikkaus oppituntinäkymässä
  if (favoriteToggleBtn) {
    favoriteToggleBtn.addEventListener("click", () => {
      if (state.activeCourse) {
        toggleFavorite(state.activeCourse.code);
      }
    });
  }

  // Kurssin valinta alasvetovalikosta
  if (courseSelect) {
    courseSelect.addEventListener("change", () => {
      const code = courseSelect.value;
      if (code) navigateTo(code, 1);
    });
  }

  // Edellinen / seuraava tunti
  if (prevLessonBtn) {
    prevLessonBtn.addEventListener("click", () => {
      if (state.activeLessonNumber > 1 && state.activeCourse) {
        navigateTo(state.activeCourse.code, state.activeLessonNumber - 1);
      }
    });
  }

  if (nextLessonBtn) {
    nextLessonBtn.addEventListener("click", () => {
      const max = state.activeCourseData?.lessons?.length || 1;
      if (state.activeLessonNumber < max && state.activeCourse) {
        navigateTo(state.activeCourse.code, state.activeLessonNumber + 1);
      }
    });
  }

  // Lukutilojen sulkemispainikkeet
  if (booksViewerCloseBtn) {
    booksViewerCloseBtn.addEventListener("click", closeBookViewer);
  }
  if (revisionViewerCloseBtn) {
    revisionViewerCloseBtn.addEventListener("click", closeRevisionViewer);
  }

  // Sivupalkin suodatinpainikkeet
  booksFilterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      booksFilterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeBooksFilter = pill.dataset.filter;
      renderBooks();
    });
  });

  revisionFilterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      revisionFilterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeRevisionFilter = pill.dataset.filter;
      renderRevisions();
    });
  });

  // Mobiilivalikon avaus
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("is-open");
    });
  }

  // Reititys hashchange-tapahtumalla
  window.addEventListener("hashchange", parseRoute);
}

// Reititys
function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");

  // Suljetaan mobiilivalikko jos auki
  if (mainNav) mainNav.classList.remove("is-open");

  if (!hash) {
    // Jos käyttäjä on valinnut oletukseksi suosikkikurssin, siirrytään suoraan siihen
    if (state.defaultView && state.defaultView !== "home" && state.favorites.includes(state.defaultView)) {
      const found = state.courses.find((c) => c.code.toLowerCase() === state.defaultView.toLowerCase());
      if (found) {
        navigateTo(found.code, 1);
        return;
      }
    }
    switchView("home");
    return;
  }

  const parts = hash.split("/");
  const firstPart = parts[0].toLowerCase();

  if (firstPart === "koti" || firstPart === "home") {
    switchView("home");
  } else if (firstPart === "kirjat" || firstPart === "avoin-matematiikka") {
    switchView("kirjat");
    const bookId = parts[1];
    if (bookId) {
      const foundBook = state.books.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
      if (foundBook) openBookViewer(foundBook);
    }
  } else if (firstPart === "kertaus" || firstPart === "kertaustehtavat") {
    switchView("kertaus");
    const targetCourse = parts[1];
    if (targetCourse) {
      // Vieritetään kyseiseen kurssiin
      setTimeout(() => {
        const card = document.querySelector(`#rev-card-${targetCourse.toUpperCase()}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  } else if (firstPart === "arviointi" || firstPart === "info") {
    switchView("arviointi");
  } else {
    // Kurssioppitunti: esim. #/MA_71/1 tai #/FY_91/3
    const courseCode = parts[0];
    const lessonNum = parseInt(parts[1], 10) || 1;

    const foundCourse = state.courses.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
    if (foundCourse) {
      switchView("lesson");
      state.activeGrade = foundCourse.grade;
      updateNavTabsUI();
      populateCourseSelect(foundCourse.grade, foundCourse.code);
      loadCourse(foundCourse.code, lessonNum);
    } else {
      switchView("home");
    }
  }
}

// Näkymän vaihto
function switchView(viewName) {
  state.activeView = viewName;
  updateNavTabsUI();

  // Piilotetaan / näytetään näkymäpaneelit
  if (viewHome) viewHome.hidden = viewName !== "home";
  if (viewLesson) viewLesson.hidden = viewName !== "lesson";
  if (viewBooks) viewBooks.hidden = viewName !== "kirjat";
  if (viewRevision) viewRevision.hidden = viewName !== "kertaus";
  if (viewArviointi) viewArviointi.hidden = viewName !== "arviointi";

  // Sivupalkin vastaavat kontrollit
  if (sidebarLessonControls) sidebarLessonControls.hidden = viewName !== "lesson";
  if (sidebarBooksControls) sidebarBooksControls.hidden = viewName !== "kirjat";
  if (sidebarRevisionControls) sidebarRevisionControls.hidden = viewName !== "kertaus";

  if (viewName === "home") {
    renderHome();
  } else if (viewName === "kirjat") {
    renderBooks();
  } else if (viewName === "kertaus") {
    renderRevisions();
  } else if (viewName === "arviointi") {
    renderInfo();
  }
}

function updateNavTabsUI() {
  navTabs.forEach((tab) => {
    const navType = tab.dataset.nav;
    if (navType === "grade") {
      tab.classList.toggle("active", state.activeView === "lesson" && tab.dataset.grade === state.activeGrade);
    } else if (navType === "view") {
      tab.classList.toggle("active", state.activeView === tab.dataset.view);
    }
  });
}

function navigateTo(courseCode, lessonNumber = 1) {
  window.location.hash = `#/${courseCode}/${lessonNumber}`;
}

function setGrade(grade, preferredCourseCode = null, lessonNumber = 1) {
  state.activeGrade = grade;
  const filtered = state.courses.filter((c) => c.grade === grade);
  const targetCode = preferredCourseCode || (filtered.length ? filtered[0].code : null);

  if (targetCode) {
    navigateTo(targetCode, lessonNumber);
  }
}

function populateCourseSelect(grade, selectedCode) {
  if (!courseSelect) return;
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

// --------------------------------------------------------------------------
// SUOSIKIT JA ASETUKSET (LOCALSTORAGE)
// --------------------------------------------------------------------------

function loadPreferences() {
  try {
    const rawFavs = localStorage.getItem("rauh_favorites");
    if (rawFavs) {
      const parsed = JSON.parse(rawFavs);
      if (Array.isArray(parsed)) {
        state.favorites = parsed.slice(0, 3);
      }
    }
  } catch (err) {
    console.warn("Virhe suosikkien latauksessa:", err);
  }

  try {
    const rawDef = localStorage.getItem("rauh_default_view");
    if (rawDef) {
      state.defaultView = rawDef;
    }
  } catch (err) {
    console.warn("Virhe oletusnäkymän latauksessa:", err);
  }
}

function savePreferences() {
  try {
    localStorage.setItem("rauh_favorites", JSON.stringify(state.favorites));
    localStorage.setItem("rauh_default_view", state.defaultView);
  } catch (err) {
    console.warn("Virhe tallennuksessa:", err);
  }
  renderSidebarFavorites();
  updateFavoriteToggleBtn();
}

function toggleFavorite(courseCode) {
  const code = courseCode.toUpperCase();
  const idx = state.favorites.indexOf(code);

  if (idx !== -1) {
    state.favorites.splice(idx, 1);
    if (state.defaultView === code) {
      state.defaultView = "home";
    }
    savePreferences();
    if (state.activeView === "home") renderHome();
    showToast(`Poistettu suosikeista: ${code}`);
  } else {
    if (state.favorites.length >= 3) {
      showToast("⚠️ Enintään 3 suosikkikurssia! Poista jokin aiemmista ensin.");
      return;
    }
    state.favorites.push(code);
    savePreferences();
    if (state.activeView === "home") renderHome();
    showToast(`⭐ Lisätty suosikkeihin: ${code}!`);
  }
}

function setDefaultView(viewKey) {
  state.defaultView = viewKey;
  savePreferences();
  if (state.activeView === "home") renderDefaultSettingUI();
  const label = viewKey === "home" ? "Kotinäkymä (oletus)" : `Kurssi ${viewKey}`;
  showToast(`🚀 Aloitusnäkymäksi tallennettu: ${label}`);
}

let toastTimeout = null;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => {
      toast.hidden = true;
    }, 250);
  }, 2600);
}

function updateFavoriteToggleBtn() {
  if (!favoriteToggleBtn || !starIcon || !starLabel) return;
  if (!state.activeCourse) {
    favoriteToggleBtn.hidden = true;
    return;
  }
  favoriteToggleBtn.hidden = false;
  const isFav = state.favorites.includes(state.activeCourse.code);

  favoriteToggleBtn.classList.toggle("is-favorite", isFav);
  favoriteToggleBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
  starIcon.textContent = isFav ? "★" : "☆";
  starLabel.textContent = isFav ? "Suosikeissa" : "Lisää suosikkeihin";
  favoriteToggleBtn.title = isFav ? "Poista suosikeista" : "Lisää suosikkeihin";
}

function renderSidebarFavorites() {
  if (sidebarFavCount) {
    sidebarFavCount.textContent = `${state.favorites.length} / 3`;
  }
  if (!sidebarFavoritesList) return;

  if (state.favorites.length === 0) {
    sidebarFavoritesList.innerHTML = `
      <p class="sidebar-fav-empty">Ei suosikkeja vielä. Lisää kurssi tähdellä (☆)!</p>
    `;
    return;
  }

  sidebarFavoritesList.innerHTML = state.favorites
    .map((code) => {
      const course = state.courses.find((c) => c.code === code);
      const title = course ? course.title : code;
      const isActive = state.activeView === "lesson" && state.activeCourse?.code === code;
      return `
        <a href="#/${code}/1" class="sidebar-fav-pill ${isActive ? "active" : ""}">
          <span class="fav-pill-star">★</span>
          <span class="fav-pill-code">${code}</span>
          <span class="fav-pill-title">${escapeHtml(title)}</span>
        </a>
      `;
    })
    .join("");
}

// --------------------------------------------------------------------------
// 0. KOTINÄKYMÄN LOGIIKKA
// --------------------------------------------------------------------------

function renderHome() {
  renderHomeFavorites();
  renderDefaultSettingUI();
  renderHomeCoursesList();
  renderSidebarFavorites();
}

function renderHomeFavorites() {
  if (favoritesCounter) {
    favoritesCounter.textContent = `${state.favorites.length} / 3 valittu`;
  }
  if (!homeFavoritesGrid) return;

  if (state.favorites.length === 0) {
    homeFavoritesGrid.innerHTML = `
      <div class="favorites-empty">
        <span class="empty-star">⭐</span>
        <p>
          Et ole vielä valinnut suosikkikursseja. Voit lisätä eniten käyttämäsi kurssit (max 3) suosikkeihin alla olevasta kurssilistasta tai kurssisivun tähdestä (☆)!
        </p>
      </div>
    `;
    return;
  }

  homeFavoritesGrid.innerHTML = state.favorites
    .map((code) => {
      const course = state.courses.find((c) => c.code === code);
      const title = course ? course.title : code;
      const grade = course ? `${course.grade}. luokka` : "";
      const subject = course?.subject ? course.subject.toUpperCase() : "";

      return `
        <div class="home-fav-card">
          <div class="home-fav-card-header">
            <span class="home-fav-badge">${grade} · ${subject}</span>
            <span style="color: #eab308; font-size: 1.1rem;">★</span>
          </div>
          <div class="home-fav-card-code">${code}</div>
          <div class="home-fav-card-title">${escapeHtml(title)}</div>
          <div class="home-fav-card-actions">
            <a href="#/${code}/1" class="fav-card-open-btn">Avaa kurssi →</a>
            <button type="button" class="fav-card-remove-btn" data-remove="${code}" title="Poista suosikeista">
              Poista
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  homeFavoritesGrid.querySelectorAll(".fav-card-remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleFavorite(btn.dataset.remove);
    });
  });
}

function renderDefaultSettingUI() {
  if (!defaultSettingOptions) return;

  const options = [{ key: "home", label: "🏠 Kotinäkymä (oletus)" }];

  state.favorites.forEach((code) => {
    const course = state.courses.find((c) => c.code === code);
    const title = course ? course.title : code;
    options.push({ key: code, label: `⭐ ${code}: ${title}` });
  });

  if (state.defaultView !== "home" && !state.favorites.includes(state.defaultView)) {
    state.defaultView = "home";
    savePreferences();
  }

  defaultSettingOptions.innerHTML = options
    .map(
      (opt) => `
      <button 
        type="button" 
        class="setting-option-btn ${state.defaultView === opt.key ? "active" : ""}" 
        data-set-default="${opt.key}"
      >
        <span>${state.defaultView === opt.key ? "✓" : "○"}</span>
        <span>${escapeHtml(opt.label)}</span>
      </button>
    `
    )
    .join("");

  defaultSettingOptions.querySelectorAll(".setting-option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setDefaultView(btn.dataset.setDefault);
    });
  });
}

function renderHomeCoursesList() {
  if (!homeCoursesGradesGrid || !state.courses) return;

  const grades = [
    { id: "7", label: "7. luokka" },
    { id: "8", label: "8. luokka" },
    { id: "9", label: "9. luokka" },
    { id: "valinnainen", label: "Valinnaiskurssit" }
  ];

  homeCoursesGradesGrid.innerHTML = grades
    .map((g) => {
      const coursesInGrade = state.courses.filter((c) => c.grade === g.id);
      return `
        <div class="home-grade-column">
          <div class="home-grade-title">
            <span>${g.label}</span>
            <span style="font-size: 0.75rem; color: #64748b; font-weight: normal;">${coursesInGrade.length} kurssia</span>
          </div>
          <div class="home-courses-list">
            ${coursesInGrade
              .map((c) => {
                const isFav = state.favorites.includes(c.code);
                return `
                <div class="home-course-item">
                  <a href="#/${c.code}/1" class="home-course-link">
                    <span class="home-course-code-badge">${c.code}</span>
                    <span>${escapeHtml(c.title)}</span>
                  </a>
                  <button 
                    type="button" 
                    class="home-item-star-btn ${isFav ? "is-favorite" : ""}" 
                    data-toggle-fav="${c.code}" 
                    title="${isFav ? "Poista suosikeista" : "Lisää suosikkeihin"}"
                    aria-label="${isFav ? "Poista suosikeista" : "Lisää suosikkeihin"}"
                  >
                    ${isFav ? "★" : "☆"}
                  </button>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");

  homeCoursesGradesGrid.querySelectorAll(".home-item-star-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.toggleFav);
    });
  });
}

// --------------------------------------------------------------------------
// 1. OPPITUNTILOGIIKKA
// --------------------------------------------------------------------------

async function loadCourse(courseCode, lessonNumber) {
  state.activeCourse = state.courses.find((c) => c.code === courseCode) || null;
  state.activeLessonNumber = lessonNumber;

  if (lessonHeading) lessonHeading.textContent = "Ladataan oppituntia…";
  if (lessonBody) lessonBody.innerHTML = "";

  try {
    let res = await fetch(`src/data/courses/${courseCode.toLowerCase()}.json`);
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
    console.warn(err);
    if (lessonHeading) lessonHeading.textContent = `${courseCode}: Oppimateriaali työn alla`;
    if (lessonBody) {
      lessonBody.innerHTML = `
        <p>Tämän kurssin oppituntikohtainen teoriasisältö päivitetään pian.</p>
        <p>Voit sillä välin selata kurssiin liittyviä oppikirjoja tai kertaustehtäviä.</p>
      `;
    }
    if (lessonEmbedSection) lessonEmbedSection.hidden = true;
    if (lessonDeepDiveSection) lessonDeepDiveSection.hidden = true;
    if (lessonTasksSection) lessonTasksSection.hidden = true;
    renderLessonContextLinks();
  }
}

function renderLessonNav() {
  if (!lessonNav) return;
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
    if (lessonHeading) lessonHeading.textContent = "Oppituntia ei löytynyt";
    return;
  }

  state.activeLessonNumber = current.lesson;

  // Leivänmurut
  if (breadcrumbs) {
    const subjectName = state.activeCourse?.subject === "fysiikka" ? "Fysiikka" : "Matematiikka";
    breadcrumbs.textContent = `${state.activeGrade}. luokka › ${subjectName} › ${state.activeCourse.code}`;
  }

  // Otsikko ja yhteenveto
  if (lessonBadge) lessonBadge.textContent = `Oppitunti #${current.lesson}`;
  if (lessonHeading) lessonHeading.textContent = current.title || current.topic || `Oppitunti ${current.lesson}`;

  if (lessonSummaryBox) {
    if (current.summary || current.content) {
      lessonSummaryBox.hidden = false;
      lessonSummaryBox.textContent = current.summary || current.content;
    } else {
      lessonSummaryBox.hidden = true;
    }
  }

  // Teoria
  if (lessonBody) {
    if (current.theory) {
      lessonBody.innerHTML = current.theory;
    } else if (current.content) {
      lessonBody.innerHTML = `<p>${escapeHtml(current.content)}</p>`;
    } else {
      lessonBody.innerHTML = "<p>Oppitunnin teoriamateriaali lisätään pian.</p>";
    }
    renderKaTeX(lessonBody);
  }

  // Simulaatio
  if (lessonEmbedSection) {
    if (current.simulation?.url) {
      lessonEmbedSection.hidden = false;
      const simUrl = current.simulation.url;
      const isGeogebra = simUrl.includes("geogebra");
      const isPhet = simUrl.includes("phet");
      const simType = isGeogebra ? "GeoGebra" : isPhet ? "PhET / HTML5" : "Interaktiivinen";
      const simIcon = isGeogebra ? "📐" : isPhet ? "🔬" : "⚡";
      const simTitle = current.simulation.title || `${simType}-sovellus`;

      if (embedTitle) embedTitle.textContent = simTitle;
      if (embedExternalLink) {
        embedExternalLink.href = simUrl;
      }
      if (embedTag) {
        embedTag.textContent = simType;
      }
      if (embedWrapper) {
        // Luodaan siisti käynnistyskortti: iframe ladataan vasta kun käyttäjä klikkaa käynnistyspainiketta.
        // Tämä estää GeoGebran ja muiden ulkoisten sivujen automaattisen focus-hypyn
        // ja pitää näkymän vakaasti oppitunnin otsikon ja teorian kohdalla.
        embedWrapper.innerHTML = `
          <div class="sim-launcher-card" id="sim-launcher-card">
            <span class="sim-launcher-icon">${simIcon}</span>
            <h4 class="sim-launcher-title">${escapeHtml(simTitle)}</h4>
            <p class="sim-launcher-desc">Interaktiivinen ${simType}-sovellus oppitunnin tueksi. Käynnistä sovellus tähän näkymään tai avaa koko ruutuun.</p>
            <div class="sim-launcher-actions">
              <button type="button" class="sim-launch-btn" id="btn-launch-sim">
                <span>▶</span> Käynnistä simulaatio
              </button>
              <a href="${escapeHtml(simUrl)}" target="_blank" rel="noopener" class="sim-launch-ext">
                Avaa koko ruudussa ↗
              </a>
            </div>
          </div>
        `;

        const launchBtn = embedWrapper.querySelector("#btn-launch-sim");
        if (launchBtn) {
          launchBtn.addEventListener("click", () => {
            embedWrapper.innerHTML = `
              <iframe 
                src="${simUrl}" 
                title="${escapeHtml(simTitle)}"
                allowfullscreen 
                loading="lazy"
              ></iframe>
            `;
          });
        }
      }
    } else {
      lessonEmbedSection.hidden = true;
      if (embedWrapper) embedWrapper.innerHTML = "";
    }
  }

  // Syventävä osio (avattava kortti)
  if (lessonDeepDiveSection) {
    if (current.deepDive && current.deepDive.content) {
      lessonDeepDiveSection.hidden = false;
      if (deepDiveHeading) {
        deepDiveHeading.innerHTML = current.deepDive.title || "Syvennä osaamistasi";
      }
      if (deepDiveBody) {
        deepDiveBody.innerHTML = current.deepDive.content;
      }
      if (deepDiveCard) {
        renderKaTeX(deepDiveCard);
        deepDiveCard.open = false; // Oletuksena suljettu, jotta perusnäkymä säilyy tiiviinä
      }
    } else {
      lessonDeepDiveSection.hidden = true;
      if (deepDiveBody) deepDiveBody.innerHTML = "";
    }
  }

  // Tehtävät
  renderTasks(current.tasks);

  // Kontekstilinkit oppikirjaan ja kertaustehtäviin
  renderLessonContextLinks();
  updateFavoriteToggleBtn();

  // Edellinen / Seuraava -painikkeet
  if (prevLessonBtn) prevLessonBtn.disabled = current.lesson <= 1;
  // Vieritys oppitunnin alkuun (huomioiden kiinnitetty yläpalkki)
  const contentTarget = document.querySelector("#main-content");
  if (contentTarget) {
    contentTarget.scrollIntoView({ behavior: "instant", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function renderTasks(tasks) {
  if (!lessonTasksSection || !taskCardsGrid) return;

  if (!tasks || typeof tasks !== "object") {
    lessonTasksSection.hidden = true;
    return;
  }

  const taskDefs = [
    { key: "research", label: "Tutkimus", className: "research" },
    { key: "theory", label: "Työkirja", className: "theory" },
    { key: "warmup", label: "Yhteiset", className: "warmup" },
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

function renderLessonContextLinks() {
  if (!lessonContextLinks || !state.activeCourse) return;

  const currentCode = state.activeCourse.code;
  const relatedBook = state.books.find((b) => b.courses && b.courses.includes(currentCode));
  const relatedRevision = state.revisions.find((r) => r.code === currentCode);

  let html = `<span class="context-links-label">Tämän kurssin aineistot:</span>`;

  if (relatedBook) {
    html += `
      <a href="#/kirjat/${relatedBook.id}" class="context-pill-link">
        📚 Avaa ${relatedBook.part}: ${escapeHtml(relatedBook.title)}
      </a>
    `;
  }

  if (relatedRevision) {
    const setsCount = relatedRevision.sets?.length || 0;
    const label = setsCount > 0 ? `📝 Kertaustehtävät & mallit (${setsCount} kpl)` : `📝 Kertausmuistilista`;
    html += `
      <a href="#/kertaus/${relatedRevision.code}" class="context-pill-link">
        ${label}
      </a>
    `;
  }

  html += `
    <a href="#/arviointi" class="context-pill-link">
      ℹ️ Arviointiperusteet
    </a>
  `;

  lessonContextLinks.innerHTML = html;
}

// --------------------------------------------------------------------------
// 2. AVOIN MATEMATIIKKA -KIRJANÄKYMÄ
// --------------------------------------------------------------------------

function renderBooks() {
  if (!booksGrid) return;

  const filter = state.activeBooksFilter;
  const filtered = filter === "all" ? state.books : state.books.filter((b) => b.grade === filter);

  // Sivupalkin pikalista
  if (booksQuickNav) {
    booksQuickNav.innerHTML = state.books
      .map(
        (b) => `
        <button type="button" class="lesson-nav-btn ${b.grade === filter ? "active" : ""}" data-book-id="${b.id}">
          <span class="num">${b.grade}. lk</span>
          <span class="title">${escapeHtml(b.title)}</span>
        </button>
      `
      )
      .join("");

    booksQuickNav.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const book = state.books.find((b) => b.id === btn.dataset.bookId);
        if (book) openBookViewer(book);
      });
    });
  }

  // Kirjakortit
  booksGrid.innerHTML = filtered
    .map(
      (b) => `
      <div class="book-card" id="book-card-${b.id}">
        <div class="book-card-header">
          <span class="book-grade-badge grade-${b.grade}">${b.grade}. luokka</span>
          <span class="book-pages">${b.pages ? `~${b.pages} sivua` : "PDF"}</span>
        </div>
        <div class="book-part">${escapeHtml(b.part)}</div>
        <h3 class="book-title">${escapeHtml(b.title)}</h3>
        <p class="book-description">${escapeHtml(b.description)}</p>
        
        <div class="book-tags">
          ${(b.courses || []).map((c) => `<span class="book-course-tag">Kurssi ${c}</span>`).join("")}
          <span class="book-course-tag">CC BY 3.0</span>
        </div>

        <div class="book-actions">
          <button type="button" class="book-read-btn" data-book-id="${b.id}">
            Lue selaimessa 📖
          </button>
          <a href="${encodeURI(b.file)}" target="_blank" rel="noopener noreferrer" class="book-download-link" title="Avaa PDF">
            Lataa ↗
          </a>
        </div>
      </div>
    `
    )
    .join("");

  // Tapahtumat "Lue selaimessa" -painikkeille
  booksGrid.querySelectorAll(".book-read-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const book = state.books.find((b) => b.id === btn.dataset.bookId);
      if (book) openBookViewer(book);
    });
  });
}

function openBookViewer(book) {
  if (!booksPdfViewer || !booksPdfFrame) return;

  booksViewerTitle.textContent = `${book.grade}. lk ${book.part}: ${book.title}`;
  booksViewerExternalLink.href = encodeURI(book.file);
  booksPdfFrame.src = encodeURI(book.file);
  booksPdfViewer.hidden = false;

  booksPdfViewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeBookViewer() {
  if (!booksPdfViewer || !booksPdfFrame) return;
  booksPdfViewer.hidden = true;
  booksPdfFrame.src = "";
}

// --------------------------------------------------------------------------
// 3. KERTAUSTEHTÄVÄNÄKYMÄ
// --------------------------------------------------------------------------

function renderRevisions() {
  if (!revisionCardsList) return;

  const filter = state.activeRevisionFilter;
  const filtered = filter === "all" ? state.revisions : state.revisions.filter((r) => r.grade === filter);

  // Sivupalkin kurssiluettelo
  if (revisionQuickNav) {
    revisionQuickNav.innerHTML = state.revisions
      .map(
        (r) => `
        <button type="button" class="lesson-nav-btn" data-course="${r.code}">
          <span class="num">${r.code}</span>
          <span class="title">${escapeHtml(r.title)}</span>
        </button>
      `
      )
      .join("");

    revisionQuickNav.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = document.querySelector(`#rev-card-${btn.dataset.course}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // Kertauskortit
  revisionCardsList.innerHTML = filtered
    .map((r) => {
      const remindersHtml =
        r.reminders && r.reminders.length
          ? `
          <div class="reminder-box">
            <h4>💡 Muistilista kokeeseen:</h4>
            <ul>
              ${r.reminders.map((rem) => `<li>${escapeHtml(rem)}</li>`).join("")}
            </ul>
          </div>
        `
          : "";

      const setsHtml =
        r.sets && r.sets.length
          ? `
          <div class="revision-sets-grid">
            ${r.sets
              .map(
                (s) => `
                <div class="revision-set-box">
                  <h4 class="revision-set-title">${escapeHtml(s.title)}</h4>
                  <p class="revision-set-desc">${escapeHtml(s.description || "")}</p>
                  <div class="revision-set-btns">
                    <button type="button" class="rev-btn rev-btn-tasks" data-title="${r.code}: ${escapeHtml(s.title)}" data-pdf="${encodeURI(s.taskPdf)}">
                      📝 Tehtävät (PDF)
                    </button>
                    ${
                      s.solutionPdf
                        ? `
                      <button type="button" class="rev-btn rev-btn-solutions" data-title="${r.code}: Malliratkaisut" data-pdf="${encodeURI(s.solutionPdf)}">
                        ✅ Ratkaisut (PDF)
                      </button>
                    `
                        : ""
                    }
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        `
          : `
          <p class="revision-empty-note">
            Kertaustehtävien ja malliratkaisujen PDF-tiedostoja valmistellaan kurssille ${r.code}. Kertaa yllä olevat muistisäännöt!
          </p>
        `;

      return `
        <div class="revision-card" id="rev-card-${r.code}">
          <div class="revision-card-header">
            <div>
              <span class="revision-course-badge">${r.grade}. luokka · ${r.subject}</span>
              <h3 class="revision-course-title">${r.code}: ${escapeHtml(r.title)}</h3>
            </div>
            <a href="#/${r.code}/1" class="context-pill-link">
              Siirry kurssin oppitunteihin →
            </a>
          </div>

          ${remindersHtml}
          ${setsHtml}
        </div>
      `;
    })
    .join("");

  // Tapahtumat kertaustehtävien lukunapeille
  revisionCardsList.querySelectorAll(".rev-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openRevisionViewer(btn.dataset.title, btn.dataset.pdf);
    });
  });
}

function openRevisionViewer(title, pdfUrl) {
  if (!revisionPdfViewer || !revisionPdfFrame) return;

  revisionViewerTitle.textContent = title;
  revisionViewerExternalLink.href = pdfUrl;
  revisionPdfFrame.src = pdfUrl;
  revisionPdfViewer.hidden = false;

  revisionPdfViewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeRevisionViewer() {
  if (!revisionPdfViewer || !revisionPdfFrame) return;
  revisionPdfViewer.hidden = true;
  revisionPdfFrame.src = "";
}

// --------------------------------------------------------------------------
// 4. ARVIOINTI- JA INFONÄKYMÄ
// --------------------------------------------------------------------------

function renderInfo() {
  if (!infoSectionsContainer || !state.info) return;

  infoSectionsContainer.innerHTML = (state.info.sections || [])
    .map(
      (sec) => `
      <div class="info-card" id="info-${sec.id}">
        <div class="info-card-header">
          <h3 class="info-card-heading">${escapeHtml(sec.heading)}</h3>
          ${sec.badge ? `<span class="info-badge">${escapeHtml(sec.badge)}</span>` : ""}
        </div>
        <ul class="info-list">
          ${(sec.points || []).map((pt) => `<li>${escapeHtml(pt)}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");
}

// Apufunktiot
function renderKaTeX(container) {
  if (typeof renderMathInElement === "function" && container) {
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

// Sivun alkuun -painike
const backToTopBtn = document.querySelector("#back-to-top");
if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("is-visible", window.scrollY > 400);
  });
}

// Estetään ulkoisten upotusten (kuten GeoGebra) ei-toivottu automaattinen focus-vieritys
let isUserScrolling = false;
let userInteractionTimeout = null;
const registerUserInteraction = () => {
  isUserScrolling = true;
  clearTimeout(userInteractionTimeout);
  userInteractionTimeout = setTimeout(() => {
    isUserScrolling = false;
  }, 1200);
};

["wheel", "touchmove", "keydown", "mousedown", "pointerdown"].forEach((ev) => {
  window.addEventListener(ev, registerUserInteraction, { passive: true, capture: true });
});

window.addEventListener("scroll", () => {
  if (!isUserScrolling && document.activeElement && document.activeElement.tagName === "IFRAME") {
    // Jos iframe varasti fokuksen ja selain yritti vierittää sivua automaattisesti
    // ilman käyttäjän omaa kosketusta/rullausta, palautetaan näkymä heti ylös.
    const contentTarget = document.querySelector("#main-content");
    if (contentTarget) {
      contentTarget.scrollIntoView({ behavior: "instant", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
});

// Käynnistetään sovellus
init();
