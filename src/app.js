// Tila ja mallit
const state = {
  courses: [],
  books: [],
  revisions: [],
  info: null,
  favorites: [], // Esim. ["MA_81", "kertaus", "kirjat"]
  defaultView: "home", // "home" | "kirjat" | "kertaus" | "arviointi" | kurssikoodi esim. "MA_81"
  favoritesCollapsed: false,
  activeView: "home", // "home" | "lesson" | "kirjat" | "kertaus" | "arviointi"
  activeGrade: "7",
  activeCourse: null,
  activeCourseData: null,
  activeLessonNumber: 1,
  activeBooksFilter: "all",
  activeRevisionFilter: "all",
  theme: "system", // "system" | "light" | "dark"
  autoDateLesson: false, // boolean
  lessonScope: "extended" // "compact" | "extended"
};

// DOM-elementit
const courseSelect = document.querySelector("#course-select");
const lessonNav = document.querySelector("#lesson-nav");
const breadcrumbs = document.querySelector("#breadcrumbs");
const lessonBadge = document.querySelector("#lesson-badge");
const lessonScopeBar = document.querySelector("#lesson-scope-bar");
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
const sidebarFavHeading = document.querySelector("#sidebar-fav-heading");
const sidebarFavArrow = document.querySelector("#sidebar-fav-arrow");
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

// Yläpalkin ja asetusten elementit
const headerSettingsBtn = document.querySelector("#header-settings-btn");
const settingsPopover = document.querySelector("#settings-popover");
const settingsPopoverCloseBtn = document.querySelector("#settings-popover-close-btn");
const btnSavePopover = document.querySelector("#btn-save-popover");
const settingsDefaultOptions = document.querySelector("#settings-default-options");
const settingsFavoritesList = document.querySelector("#settings-favorites-list");
const themeSelectorGroup = document.querySelector("#theme-selector-group");
const settingAutoDateLesson = document.querySelector("#setting-auto-date-lesson");
const scopeSelectorGroup = document.querySelector("#scope-selector-group");

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

// Tuntitehtävien PDF-lukijan elementit
const lessonTaskPdfViewer = document.querySelector("#lesson-task-pdf-viewer");
const lessonTaskViewerTag = document.querySelector("#lesson-task-viewer-tag");
const lessonTaskViewerTitle = document.querySelector("#lesson-task-viewer-title");
const lessonTaskViewerExternalLink = document.querySelector("#lesson-task-viewer-external-link");
const lessonTaskViewerCloseBtn = document.querySelector("#lesson-task-viewer-close-btn");
const lessonTaskPdfFrame = document.querySelector("#lesson-task-pdf-frame");

// Info-näkymän elementit
const infoSectionsContainer = document.querySelector("#info-sections-container");

// Lukuvuoden ja versionumeron automaattinen päivitys
function getSchoolYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based: 0 = tammi, 7 = elo
  return month >= 7 ? `${year}–${year + 1}` : `${year - 1}–${year}`;
}

function updateFooterInfo() {
  const schoolYearEl = document.getElementById("footer-school-year");
  const versionEl = document.getElementById("footer-version");
  const schoolYear = getSchoolYear();
  const version = (typeof window !== "undefined" && window.APP_VERSION) ? window.APP_VERSION : "0.11";

  if (schoolYearEl) {
    schoolYearEl.textContent = schoolYear;
  }
  if (versionEl) {
    versionEl.textContent = `(${version})`;
  }
}

// Alustus
async function init() {
  try {
    loadPreferences();
    updateFooterInfo();

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
        if (targetView === "home" || targetView === "koti") {
          window.location.hash = "#/koti";
        } else {
          window.location.hash = `#/${targetView}`;
        }
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

  // Suosikkitähdet muissa osionäkymissä (kirjat, kertaus, arviointi)
  document.querySelectorAll("[data-toggle-view-fav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.toggleViewFav;
      if (key) {
        toggleFavorite(key);
      }
    });
  });

  // Sivupalkin suosikkien kokoon taitto
  if (sidebarFavHeading) {
    const handleCollapseToggle = () => {
      state.favoritesCollapsed = !state.favoritesCollapsed;
      try {
        localStorage.setItem("rauh_fav_collapsed", state.favoritesCollapsed ? "true" : "false");
      } catch (err) {}
      applyFavoritesCollapseState();
    };

    sidebarFavHeading.addEventListener("click", handleCollapseToggle);
    sidebarFavHeading.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCollapseToggle();
      }
    });
  }

  // Sivuston asetukset (yläpalkin rataspainike ja leijuva popover)
  if (headerSettingsBtn && settingsPopover) {
    headerSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSettingsPopover();
    });
  }

  if (settingsPopover) {
    settingsPopover.addEventListener("click", (e) => {
      // Estetään valikon sisäisten klikkausten kupliminen dokumentille
      e.stopPropagation();
    });
  }

  if (settingsPopoverCloseBtn) {
    settingsPopoverCloseBtn.addEventListener("click", () => {
      closeSettingsPopover();
    });
  }

  if (btnSavePopover) {
    btnSavePopover.addEventListener("click", () => {
      closeSettingsPopover();
      showToast("✓ Asetukset tallennettu!");
    });
  }

  // Teeman valintapainikkeet popoverissa
  if (themeSelectorGroup) {
    themeSelectorGroup.querySelectorAll(".theme-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.themeChoice;
        if (choice) setTheme(choice);
      });
    });
  }

  // Päivämääräperusteinen tuntiohjaus -valintaruutu
  if (settingAutoDateLesson) {
    settingAutoDateLesson.addEventListener("change", () => {
      state.autoDateLesson = settingAutoDateLesson.checked;
      try {
        localStorage.setItem("rauh_auto_date_lesson", state.autoDateLesson ? "true" : "false");
      } catch (err) {}
      showToast(
        state.autoDateLesson
          ? "📅 Päivämääräohjaus aktivoitu (käytössä Kurssiportaali-integraation valmistuttua)"
          : "Päivämääräohjaus kytketty pois"
      );
    });
  }

  // Oppituntien laajuus -valitsin (Asetusvalikossa)
  if (scopeSelectorGroup) {
    scopeSelectorGroup.querySelectorAll(".scope-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scope = btn.dataset.scope;
        if (scope) setLessonScope(scope);
      });
    });
  }

  // Oppitunnin otsikkorivin laajuuspillerit
  if (lessonScopeBar) {
    lessonScopeBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".scope-pill-btn");
      if (!btn || !btn.dataset.scope) return;
      setLessonScope(btn.dataset.scope);
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
  if (lessonTaskViewerCloseBtn) {
    lessonTaskViewerCloseBtn.addEventListener("click", closeLessonTaskViewer);
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

  // Mobiilivalikon avaus ja sulku hampurilaisesta
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Klikkaus dokumentin ulkopuolelle sulkee mobiilivalikon tai leijuvan asetusvalikon
  document.addEventListener("click", (e) => {
    const path = e.composedPath ? e.composedPath() : [];

    // 1. Mobiilivalikon sulkeminen kun klikataan ohi
    if (mainNav && mainNav.classList.contains("is-open")) {
      const isInsideNav = mainNav.contains(e.target) || path.includes(mainNav);
      const isInsideToggle = menuToggle.contains(e.target) || path.includes(menuToggle);
      if (!isInsideNav && !isInsideToggle) {
        closeMobileMenu();
      }
    }

    // 2. Leijuvan asetusvalikon sulkeminen kun klikataan ohi
    if (settingsPopover && !settingsPopover.hidden) {
      const isInsidePopover = settingsPopover.contains(e.target) || path.includes(settingsPopover);
      const isInsideGear = headerSettingsBtn.contains(e.target) || path.includes(headerSettingsBtn);
      if (!isInsidePopover && !isInsideGear) {
        closeSettingsPopover();
      }
    }
  });

  // Sulkeminen Escape-näppäimellä
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
      closeSettingsPopover();
    }
  });

  // Kuunnellaan järjestelmän teeman vaihtumista reaaliajassa
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (state.theme === "system") {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    });
  }

  // Reititys hashchange- ja popstate-tapahtumilla
  window.addEventListener("hashchange", parseRoute);
  window.addEventListener("popstate", parseRoute);
}

// Lipuke, jolla tunnistetaan sivuston ensiavaus (uusi välilehti, kirjanmerkki tai sivun päivitys)
let isInitialLoad = true;

// Reititys
function parseRoute() {
  const rawHash = window.location.hash.replace(/^#\/?/, "");
  const hash = rawHash.toLowerCase();

  // Suljetaan mobiilivalikko ja asetukset siirtymissä
  closeMobileMenu();
  closeSettingsPopover();

  const isHomeRoute = !hash || hash === "koti" || hash === "home";

  if (isInitialLoad) {
    isInitialLoad = false;
    // Kun sivusto avataan kirjanmerkistä, osoiteriviltä tai perusosoitteella:
    // Jos saavutaan aloitussivulle ja käyttäjä on asettanut oletusaloitussivuksi suosikin:
    if (isHomeRoute) {
      if (state.defaultView && state.defaultView !== "home") {
        const meta = getFavoriteMeta(state.defaultView);
        if (meta && meta.hash) {
          window.location.replace(meta.hash);
          return;
        }
      }
      switchView("home");
      return;
    }
  }

  if (isHomeRoute) {
    switchView("home");
    return;
  }

  const parts = rawHash.split("/");
  const firstPart = parts[0].toLowerCase();

  if (firstPart === "kirjat" || firstPart === "avoin-matematiikka") {
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
      const rev = state.revisions.find((r) => r.code.toUpperCase() === targetCourse.toUpperCase());
      if (rev && state.activeRevisionFilter !== "all" && state.activeRevisionFilter !== rev.grade) {
        state.activeRevisionFilter = "all";
        renderRevisions();
      }
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
    // Siistitään osoitepalkki kotinäkymässä: poistetaan #/home tai #/koti,
    // jotta käyttäjän selaimeen mahdollisesti tallentama kirjanmerkki osoittaa puhtaaseen perusosoitteeseen!
    if (window.location.hash && (window.location.hash === "#/home" || window.location.hash === "#/koti" || window.location.hash === "#/")) {
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (err) {}
    }
  } else if (viewName === "kirjat") {
    renderBooks();
  } else if (viewName === "kertaus") {
    renderRevisions();
  } else if (viewName === "arviointi") {
    renderInfo();
  }

  renderSidebarFavorites();
  updateFavoriteToggleBtn();
}

function updateNavTabsUI() {
  navTabs.forEach((tab) => {
    const navType = tab.dataset.nav;
    if (navType === "grade") {
      tab.classList.toggle("active", state.activeView === "lesson" && tab.dataset.grade === state.activeGrade);
    } else if (navType === "view") {
      const isHome = state.activeView === "home" && (tab.dataset.view === "home" || tab.dataset.view === "koti");
      tab.classList.toggle("active", isHome || state.activeView === tab.dataset.view);
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

function getFavoriteMeta(key) {
  if (!key) return null;
  const lower = String(key).toLowerCase();

  if (lower === "home" || lower === "koti") {
    return {
      key: "home",
      type: "section",
      title: "Kotinäkymä",
      label: "🏠 Kotinäkymä (oletus)",
      hash: "#/koti",
      icon: "🏠"
    };
  }
  if (lower === "kirjat" || lower === "avoin-matematiikka") {
    return {
      key: "kirjat",
      type: "section",
      title: "Avoin matematiikka -kirjat",
      label: "📚 Avoin matematiikka -kirjat",
      hash: "#/kirjat",
      icon: "📚"
    };
  }
  if (lower === "kertaus" || lower === "kertaustehtavat") {
    return {
      key: "kertaus",
      type: "section",
      title: "Kertaustehtävät & mallit",
      label: "📝 Kertaustehtävät & mallit",
      hash: "#/kertaus",
      icon: "📝"
    };
  }
  if (lower === "arviointi" || lower === "info") {
    return {
      key: "arviointi",
      type: "section",
      title: "Arviointiperusteet & info",
      label: "ℹ️ Arviointiperusteet & info",
      hash: "#/arviointi",
      icon: "ℹ️"
    };
  }

  // Kurssikohde
  const course = (state.courses || []).find((c) => c.code.toUpperCase() === String(key).toUpperCase());
  const code = course ? course.code : String(key).toUpperCase();
  const title = course ? course.title : code;
  const isPhysics = course?.subject === "fysiikka";
  const icon = isPhysics ? "⚡" : "📐";

  return {
    key: code,
    type: "course",
    title: title,
    label: `${icon} ${code}: ${title}`,
    hash: `#/${code}/1`,
    icon: icon
  };
}

function applyFavoritesCollapseState() {
  if (sidebarFavoritesList) {
    sidebarFavoritesList.hidden = state.favoritesCollapsed;
  }
  if (sidebarFavArrow) {
    sidebarFavArrow.textContent = state.favoritesCollapsed ? "▶" : "▼";
  }
  if (sidebarFavHeading) {
    sidebarFavHeading.setAttribute("aria-expanded", state.favoritesCollapsed ? "false" : "true");
  }
}

function loadPreferences() {
  try {
    const rawFavs = localStorage.getItem("rauh_favorites");
    if (rawFavs) {
      const parsed = JSON.parse(rawFavs);
      if (Array.isArray(parsed)) {
        state.favorites = parsed;
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

  try {
    state.favoritesCollapsed = localStorage.getItem("rauh_fav_collapsed") === "true";
  } catch (err) {
    console.warn("Virhe suosikkien taiton latauksessa:", err);
  }

  try {
    state.theme = localStorage.getItem("rauh_theme") || "system";
  } catch (err) {}

  try {
    state.autoDateLesson = localStorage.getItem("rauh_auto_date_lesson") === "true";
  } catch (err) {}

  try {
    const savedScope = localStorage.getItem("rauh_lesson_scope");
    if (savedScope === "compact") {
      state.lessonScope = "compact";
    } else {
      state.lessonScope = "extended";
    }
  } catch (err) {}

  applyTheme(state.theme, false);
}

function savePreferences() {
  try {
    localStorage.setItem("rauh_favorites", JSON.stringify(state.favorites));
    localStorage.setItem("rauh_default_view", state.defaultView);
    localStorage.setItem("rauh_fav_collapsed", state.favoritesCollapsed ? "true" : "false");
  } catch (err) {
    console.warn("Virhe tallennuksessa:", err);
  }
  renderSidebarFavorites();
  updateFavoriteToggleBtn();
  if (settingsPopover && !settingsPopover.hidden) {
    renderSettingsPopover();
  }
}

function setTheme(theme) {
  state.theme = theme;
  try {
    localStorage.setItem("rauh_theme", theme);
  } catch (err) {}
  applyTheme(theme, true);
}

function applyTheme(theme, showNotice = false) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    // "system"
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }
  updateThemeSelectorButtons();
  if (showNotice) {
    const labels = {
      system: "Järjestelmän asetus",
      light: "Vaalea tila",
      dark: "Tumma tila"
    };
    showToast(`🌓 Teemaksi valittu: ${labels[theme] || theme}`);
  }
}

function updateThemeSelectorButtons() {
  if (!themeSelectorGroup) return;
  themeSelectorGroup.querySelectorAll(".theme-opt-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeChoice === state.theme);
  });
}

function setLessonScope(scope) {
  const cleanScope = scope === "compact" ? "compact" : "extended";
  state.lessonScope = cleanScope;
  try {
    localStorage.setItem("rauh_lesson_scope", cleanScope);
  } catch (err) {}
  updateScopeSelectorButtons();

  // Jos ollaan oppitunnilla, päivitetään näkymä heti uudella laajuudella
  if (state.activeView === "lesson") {
    renderActiveLesson();
  }

  const labels = {
    compact: "Tiivistetty (vain ydinteoria)",
    extended: "Laaja (koko oppimateriaali ja kuvat)"
  };
  showToast(`📖 Oppituntien laajuus: ${labels[cleanScope] || cleanScope}`);
}

function updateScopeSelectorButtons() {
  if (scopeSelectorGroup) {
    scopeSelectorGroup.querySelectorAll(".scope-opt-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scope === state.lessonScope);
    });
  }
  if (lessonScopeBar) {
    lessonScopeBar.querySelectorAll(".scope-pill-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scope === state.lessonScope);
    });
  }
}

function toggleMobileMenu(forceState) {
  if (!mainNav || !menuToggle) return;
  const willOpen = typeof forceState === "boolean" ? forceState : !mainNav.classList.contains("is-open");
  mainNav.classList.toggle("is-open", willOpen);
  menuToggle.classList.toggle("is-active", willOpen);
  menuToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
  if (willOpen) {
    closeSettingsPopover();
  }
}

function closeMobileMenu() {
  toggleMobileMenu(false);
}

function openSettingsPopover() {
  if (!settingsPopover) return;
  closeMobileMenu();
  settingsPopover.hidden = false;
  if (headerSettingsBtn) {
    headerSettingsBtn.classList.add("is-active");
    headerSettingsBtn.setAttribute("aria-expanded", "true");
  }
  renderSettingsPopover();
}

function closeSettingsPopover() {
  if (!settingsPopover) return;
  settingsPopover.hidden = true;
  if (headerSettingsBtn) {
    headerSettingsBtn.classList.remove("is-active");
    headerSettingsBtn.setAttribute("aria-expanded", "false");
  }
}

function toggleSettingsPopover() {
  if (!settingsPopover) return;
  if (settingsPopover.hidden) {
    openSettingsPopover();
  } else {
    closeSettingsPopover();
  }
}

function toggleFavorite(rawKey) {
  if (!rawKey) return;
  const isSection = ["kirjat", "kertaus", "arviointi"].includes(String(rawKey).toLowerCase());
  const key = isSection ? rawKey.toLowerCase() : rawKey.toUpperCase();

  const idx = state.favorites.indexOf(key);
  const meta = getFavoriteMeta(key);

  if (idx !== -1) {
    state.favorites.splice(idx, 1);
    if (state.defaultView === key) {
      state.defaultView = "home";
    }
    savePreferences();
    showToast(`Poistettu suosikeista: ${meta?.title || key}`);
  } else {
    state.favorites.push(key);
    savePreferences();
    showToast(`⭐ Lisätty suosikkeihin: ${meta?.title || key}!`);
  }
}

function moveFavorite(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= state.favorites.length) return;

  const item = state.favorites.splice(index, 1)[0];
  state.favorites.splice(targetIndex, 0, item);
  savePreferences();
}

function setDefaultView(viewKey) {
  state.defaultView = viewKey;
  savePreferences();
  const meta = getFavoriteMeta(viewKey);
  showToast(`🚀 Aloitusnäkymäksi tallennettu: ${meta?.label || viewKey}`);
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
  // 1. Oppituntinäkymän tähtipainike
  if (favoriteToggleBtn && starIcon && starLabel) {
    if (!state.activeCourse || state.activeView !== "lesson") {
      favoriteToggleBtn.hidden = true;
    } else {
      favoriteToggleBtn.hidden = false;
      const isFav = state.favorites.includes(state.activeCourse.code);
      favoriteToggleBtn.classList.toggle("is-favorite", isFav);
      favoriteToggleBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
      starIcon.textContent = isFav ? "★" : "☆";
      starLabel.textContent = isFav ? "Suosikeissa" : "Lisää suosikkeihin";
      favoriteToggleBtn.title = isFav ? "Poista suosikeista" : "Lisää suosikkeihin";
    }
  }

  // 2. Muiden osioiden (kirjat, kertaus, arviointi) tähtipainikkeet
  document.querySelectorAll("[data-toggle-view-fav]").forEach((btn) => {
    const key = btn.dataset.toggleViewFav;
    const isFav = state.favorites.includes(key);
    btn.classList.toggle("is-favorite", isFav);
    btn.setAttribute("aria-pressed", isFav ? "true" : "false");

    const icon = btn.querySelector(".star-icon");
    const label = btn.querySelector(".star-label");
    if (icon) icon.textContent = isFav ? "★" : "☆";
    if (label) label.textContent = isFav ? "Suosikeissa" : "Lisää suosikkeihin";
    btn.title = isFav ? "Poista suosikeista" : "Lisää suosikkeihin";
  });
}

function renderSidebarFavorites() {
  applyFavoritesCollapseState();
  if (!sidebarFavoritesList) return;

  if (state.favorites.length === 0) {
    sidebarFavoritesList.innerHTML = `
      <p class="sidebar-fav-empty">Ei suosikkeja vielä. Lisää kohteita tähdellä (☆) tai asetuksista!</p>
    `;
    return;
  }

  sidebarFavoritesList.innerHTML = state.favorites
    .map((key) => {
      const meta = getFavoriteMeta(key);
      if (!meta) return "";

      const isActive =
        meta.type === "course"
          ? state.activeView === "lesson" && state.activeCourse?.code.toUpperCase() === key.toUpperCase()
          : state.activeView === meta.key;

      return `
        <a href="${meta.hash}" class="sidebar-fav-pill ${isActive ? "active" : ""}">
          <span class="fav-pill-icon">${meta.icon}</span>
          <span class="fav-pill-code">${escapeHtml(meta.key)}</span>
          <span class="fav-pill-title">${escapeHtml(meta.title)}</span>
        </a>
      `;
    })
    .join("");
}

// --------------------------------------------------------------------------
// 0. KOTINÄKYMÄN LOGIIKKA JA ASETUKSET
// --------------------------------------------------------------------------

function renderHome() {
  renderSidebarFavorites();
  updateFavoriteToggleBtn();
}

function renderSettingsPopover() {
  if (!settingsPopover) return;

  // 1. Aloitusnäkymävaihtoehdot (#settings-default-options)
  if (settingsDefaultOptions) {
    const options = [{ key: "home", label: "🏠 Kotinäkymä (oletus)" }];

    state.favorites.forEach((key) => {
      const meta = getFavoriteMeta(key);
      if (meta) {
        options.push({
          key: meta.key,
          label: meta.label
        });
      }
    });

    if (state.defaultView !== "home" && !state.favorites.includes(state.defaultView)) {
      state.defaultView = "home";
      savePreferences();
    }

    settingsDefaultOptions.innerHTML = options
      .map(
        (opt) => `
        <button
          type="button"
          class="default-view-option-btn ${state.defaultView === opt.key ? "active" : ""}"
          data-set-default="${escapeHtml(opt.key)}"
        >
          <span class="option-check">${state.defaultView === opt.key ? "✓" : "○"}</span>
          <span class="option-label">${escapeHtml(opt.label)}</span>
        </button>
      `
      )
      .join("");

    settingsDefaultOptions.querySelectorAll(".default-view-option-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        setDefaultView(btn.dataset.setDefault);
      });
    });
  }

  // 2. Suosikkilistan järjestely & poisto (#settings-favorites-list)
  if (settingsFavoritesList) {
    if (state.favorites.length === 0) {
      settingsFavoritesList.innerHTML = `
        <p class="settings-fav-empty">
          Ei suosikkeja vielä. Voit lisätä kohteita tähdellä (☆) kurssien tai aineistojen sivulla.
        </p>
      `;
    } else {
      settingsFavoritesList.innerHTML = state.favorites
        .map((key, i) => {
          const meta = getFavoriteMeta(key);
          const isFirst = i === 0;
          const isLast = i === state.favorites.length - 1;

          return `
            <div class="settings-fav-item" data-fav-key="${escapeHtml(key)}">
              <div class="settings-fav-drag-info">
                <span class="settings-fav-badge">${meta.icon} ${escapeHtml(meta.key)}</span>
                <span class="settings-fav-title">${escapeHtml(meta.title)}</span>
              </div>
              <div class="settings-fav-actions">
                <button
                  type="button"
                  class="settings-action-btn btn-move-up"
                  data-index="${i}"
                  title="Siirrä ylemmäs"
                  aria-label="Siirrä ylemmäs"
                  ${isFirst ? "disabled" : ""}
                >▲</button>
                <button
                  type="button"
                  class="settings-action-btn btn-move-down"
                  data-index="${i}"
                  title="Siirrä alemmas"
                  aria-label="Siirrä alemmas"
                  ${isLast ? "disabled" : ""}
                >▼</button>
                <button
                  type="button"
                  class="settings-action-btn btn-remove-fav"
                  data-key="${escapeHtml(key)}"
                  title="Poista suosikeista"
                  aria-label="Poista suosikeista"
                >✕</button>
              </div>
            </div>
          `;
        })
        .join("");

      settingsFavoritesList.querySelectorAll(".btn-move-up").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          moveFavorite(idx, -1);
        });
      });

      settingsFavoritesList.querySelectorAll(".btn-move-down").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          moveFavorite(idx, 1);
        });
      });

      settingsFavoritesList.querySelectorAll(".btn-remove-fav").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavorite(btn.dataset.key);
        });
      });
    }
  }

  // 3. Teemapainikkeiden tila
  updateThemeSelectorButtons();

  // 4. Päivämääräohjaus -valintaruutu
  if (settingAutoDateLesson) {
    settingAutoDateLesson.checked = !!state.autoDateLesson;
  }

  // 5. Oppituntien laajuus -valitsimet
  updateScopeSelectorButtons();
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

  // Teoria (Oppituntien laajuus: compact vs extended)
  if (lessonBody) {
    if (state.lessonScope === "compact") {
      // 1. Tiivistetty (vain ydinteoria)
      if (current.theory) {
        lessonBody.innerHTML = current.theory;
      } else if (current.content) {
        lessonBody.innerHTML = `<p>${escapeHtml(current.content)}</p>`;
      } else {
        lessonBody.innerHTML = "<p>Oppitunnin teoriamateriaali lisätään pian.</p>";
      }
    } else {
      // 2. Laaja (opettajan kirjoittama koko PDF-sisältö ja kuvat, tai fallback tiivistettyyn)
      if (current.extendedTheory) {
        lessonBody.innerHTML = current.extendedTheory;
      } else if (current.theory) {
        lessonBody.innerHTML = current.theory;
      } else if (current.content) {
        lessonBody.innerHTML = `<p>${escapeHtml(current.content)}</p>`;
      } else {
        lessonBody.innerHTML = "<p>Oppitunnin teoriamateriaali lisätään pian.</p>";
      }
    }
    renderKaTeX(lessonBody);
  }

  // Päivitetään laajuuspainikkeiden valinta aktiiviseksi
  updateScopeSelectorButtons();

  // Simulaatio
  if (lessonEmbedSection) {
    if (current.simulation?.url) {
      lessonEmbedSection.hidden = false;
      const simUrl = formatSimulationUrl(current.simulation.url);
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
                allow="fullscreen; autoplay; encrypted-media"
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
  closeLessonTaskViewer();
  renderTasks(current.tasks, current.taskSheets || current.taskSheet);

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

function renderTasks(tasks, taskSheets) {
  if (!lessonTasksSection || !taskCardsGrid) return;

  const hasTasks = tasks && typeof tasks === "object";
  const normalizedSheets = Array.isArray(taskSheets)
    ? taskSheets
    : taskSheets
    ? [taskSheets]
    : [];

  const taskDefs = [
    { key: "research", label: "Tutkimus", className: "research" },
    { key: "theory", label: "Työkirja", className: "theory" },
    { key: "warmup", label: "Yhteiset", className: "warmup" },
    { key: "blue", label: "Siniset", className: "blue" },
    { key: "red", label: "Punaiset", className: "red" }
  ];

  let rows = "";
  if (hasTasks) {
    rows = taskDefs
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
  }

  let sheetsHtml = "";
  if (normalizedSheets.length > 0) {
    sheetsHtml = `
      <div class="lesson-task-sheets-container">
        ${normalizedSheets
          .map(
            (sheet) => `
              <div class="task-sheet-box">
                <div class="task-sheet-info">
                  <div class="task-sheet-badge-group">
                    <span class="task-badge task-sheet-badge">${escapeHtml(sheet.badge || "Tehtävät")}</span>
                    <h4 class="task-sheet-title">${escapeHtml(sheet.title)}</h4>
                  </div>
                  ${sheet.description ? `<p class="task-sheet-desc">${escapeHtml(sheet.description)}</p>` : ""}
                </div>
                <div class="task-sheet-btns">
                  <button type="button" class="rev-btn rev-btn-tasks task-sheet-open-btn" data-url="${escapeHtml(sheet.pdf)}" data-title="${escapeHtml(sheet.title)}">
                    Avaa tehtävänanto (PDF) 📄
                  </button>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  if (rows || sheetsHtml) {
    taskCardsGrid.innerHTML = rows + sheetsHtml;
    lessonTasksSection.hidden = false;

    taskCardsGrid.querySelectorAll(".task-sheet-open-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLessonTaskViewer(btn.dataset.title, btn.dataset.url);
      });
    });
  } else {
    lessonTasksSection.hidden = true;
  }
}

function openLessonTaskViewer(title, pdfUrl) {
  if (!lessonTaskPdfViewer || !lessonTaskPdfFrame) return;

  if (lessonTaskViewerTitle) lessonTaskViewerTitle.textContent = title;
  if (lessonTaskViewerExternalLink) lessonTaskViewerExternalLink.href = pdfUrl;
  lessonTaskPdfFrame.src = pdfUrl;
  lessonTaskPdfViewer.hidden = false;

  lessonTaskPdfViewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeLessonTaskViewer() {
  if (!lessonTaskPdfViewer) return;
  lessonTaskPdfViewer.hidden = true;
  if (lessonTaskPdfFrame) lessonTaskPdfFrame.src = "";
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

  if (booksFilterPills) {
    booksFilterPills.forEach((p) => p.classList.toggle("active", p.dataset.filter === filter));
  }

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

  if (revisionFilterPills) {
    revisionFilterPills.forEach((p) => p.classList.toggle("active", p.dataset.filter === filter));
  }

  // Sivupalkin kurssiluettelo
  if (revisionQuickNav) {
    revisionQuickNav.innerHTML = state.revisions
      .map(
        (r) => `
        <button type="button" class="lesson-nav-btn ${r.grade === filter ? "active" : ""}" data-course="${r.code}">
          <span class="num">${r.code}</span>
          <span class="title">${escapeHtml(r.title)}</span>
        </button>
      `
      )
      .join("");

    revisionQuickNav.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        let card = document.querySelector(`#rev-card-${btn.dataset.course}`);
        if (!card) {
          const rev = state.revisions.find((r) => r.code === btn.dataset.course);
          if (rev) {
            state.activeRevisionFilter = rev.grade || "all";
            renderRevisions();
            card = document.querySelector(`#rev-card-${btn.dataset.course}`);
          }
        }
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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
function formatSimulationUrl(rawUrl) {
  if (!rawUrl) return "";
  let url = String(rawUrl).trim();

  // PhET: varmistetaan suora HTML5-upotusosoite (estää X-Frame-Options -eston ja parantaa mobiilitoimivuutta)
  if (url.includes("phet.colorado.edu")) {
    if (url.includes("/sims/html/") || url.includes("/sims/cheerpj/")) {
      return url;
    }
    const cleanUrl = url.split("?")[0].split("#")[0].replace(/\/+$/, "");
    const parts = cleanUrl.split("/");
    let slug = parts[parts.length - 1];

    if (slug === "expression-evaluator") {
      slug = "expression-exchange";
    } else if (slug === "nuclear-fission") {
      return "https://phet.colorado.edu/sims/cheerpj/nuclear-physics/latest/nuclear-physics.html?simulation=nuclear-fission";
    }

    return `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_all.html?locale=fi`;
  }

  return url;
}

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
