// Tila ja mallit
const state = {
  courses: [],
  books: [],
  revisions: [],
  info: null,
  timetable: null,
  schedules: null,
  activeScheduleGroup: null,
  _courseDataMap: {},
  favorites: [], // Esim. ["MA_81", "kertaus", "kirjat"]
  defaultView: "home", // "home" | "kirjat" | "kertaus" | "arviointi" | kurssikoodi esim. "MA_81"
  defaultScheduleGroup: null, // Käyttäjän valitsema ensisijainen opetusryhmä ryhmänäkymässä
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
  lessonScope: "extended", // "compact" | "extended"
  homeConfig: {
    blocks: [
      { id: "welcome", title: "Tervetuloteksti", enabled: true },
      { id: "weekInfo", title: "Viikon infokortti", enabled: true }
    ]
  },
  homeWeekOffset: 0,
  scienceFacts: null,
  mobileNavOrder: ["lukujarjestys", "ryhmat", "favorites", "settings"],
  settingsAccordionMode: "closed", // "closed" | "last" | "all"
  settingsLastOpenCards: []
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
const viewLukujarjestys = document.querySelector("#view-lukujarjestys");
const viewAikataulu = document.querySelector("#view-aikataulu");
const viewSubstitute = document.querySelector("#view-substitute");
const viewInstructions = document.querySelector("#view-instructions");

// Uudet lukujärjestys- ja aikatauluohjaimet
const scheduleContent = document.querySelector("#schedule-content");
const aikatauluGroupPills = document.querySelector("#aikataulu-group-pills");
const aikatauluLessonsList = document.querySelector("#aikataulu-lessons-list");
const sidebarAikatauluControls = document.querySelector("#sidebar-aikataulu-controls");
const sidebarAikatauluGroupPills = document.querySelector("#sidebar-aikataulu-group-pills");
const substituteContent = document.querySelector("#substitute-content");
const instructionsContent = document.querySelector("#instructions-content");
const instructionsForm = document.querySelector("#instructions-form");
const instructionsStart = document.querySelector("#instructions-start");
const instructionsEnd = document.querySelector("#instructions-end");
const generatedInstructions = document.querySelector("#generated-instructions");
const btnBackFromSubstitute = document.querySelector("#btn-back-from-substitute");
const btnBackFromInstructions = document.querySelector("#btn-back-from-instructions");
const btnOpenSubstituteGuide = document.querySelector("#btn-open-substitute-guide");
const btnOpenSubstituteInstructions = document.querySelector("#btn-open-substitute-instructions");

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
  const copyrightYearEl = document.getElementById("footer-copyright-year");
  const versionEl = document.getElementById("footer-version");
  const now = new Date();
  const schoolYear = getSchoolYear(now);
  const version = (typeof window !== "undefined" && window.APP_VERSION) ? window.APP_VERSION : "0.11";

  if (copyrightYearEl) {
    copyrightYearEl.textContent = now.getFullYear();
  }
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
    const [coursesRes, booksRes, revisionsRes, infoRes, timetableRes, schedulesRes, factsRes] = await Promise.all([
      fetch("src/data/courses.json"),
      fetch("src/data/books.json"),
      fetch("src/data/revisions.json"),
      fetch("src/data/info.json"),
      fetch("src/data/lukujarjestys.json"),
      fetch("src/data/schedules.json"),
      fetch("src/data/science_facts.json")
    ]);

    if (coursesRes.ok) state.courses = await coursesRes.json();
    if (booksRes.ok) state.books = await booksRes.json();
    if (revisionsRes.ok) state.revisions = await revisionsRes.json();
    if (infoRes.ok) state.info = await infoRes.json();
    if (timetableRes && timetableRes.ok) state.timetable = await timetableRes.json();
    if (schedulesRes && schedulesRes.ok) state.schedules = await schedulesRes.json();
    if (factsRes && factsRes.ok) state.scienceFacts = await factsRes.json();

    setupEventListeners();
    renderMobileNavCourseLists();
    renderMobileNavBooksList();
    renderMobileNavRevisionsList();
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
    tab.addEventListener("click", (e) => {
      const navType = tab.dataset.nav;
      if (navType === "grade") {
        e.preventDefault();
        e.stopPropagation();
        const grade = tab.dataset.grade;
        toggleNavDropdown(grade);
        return;
      } else if (navType === "dropdown") {
        e.preventDefault();
        e.stopPropagation();
        const drop = tab.dataset.dropdown;
        toggleNavDropdown(drop);
        return;
      } else if (navType === "view") {
        closeAllGradeCourses();
        closeMobileMenu();
        const targetView = tab.dataset.view;
        if (targetView === "home" || targetView === "koti") {
          window.location.hash = "#/koti";
        } else {
          window.location.hash = `#/${targetView}`;
        }
      }
    });
  });

  // Kirjojen ja kertaustehtävien suodatus- ja alasvetovalinnat alustetaan renderMobileNavBooksList() ja renderMobileNavRevisionsList() kautta

  // Arviointitiedotteen osioihin hyppääminen ylävalikosta
  document.querySelectorAll("[data-action='info-scroll']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sec = btn.dataset.section;
      closeAllGradeCourses();
      closeMobileMenu();
      if (sec === "all") {
        if (state.activeView === "arviointi") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.location.hash = "#/arviointi";
        }
      } else {
        if (state.activeView === "arviointi") {
          const el = document.querySelector(`#info-${sec}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.hash = `#/arviointi/${sec}`;
        }
      }
      updateNavTabsUI();
    });
  });

  // Mobiilivalikon asetusrivi
  const navBtnMobileSettings = document.querySelector("#nav-btn-mobile-settings");
  if (navBtnMobileSettings) {
    navBtnMobileSettings.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
      openSettingsPopover();
    });
  }

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

  // Aikataulunäkymän opetusryhmän suosikkitähti
  const favBtnCurrentGroup = document.querySelector("#fav-btn-current-group");
  if (favBtnCurrentGroup) {
    favBtnCurrentGroup.addEventListener("click", () => {
      if (!state.activeScheduleGroup) return;
      toggleFavorite(state.activeScheduleGroup);
      updateCurrentGroupFavoriteButton();
    });
  }

  // Päivämääräperusteinen tuntiohjaus -valintaruutu
  if (settingAutoDateLesson) {
    settingAutoDateLesson.addEventListener("change", () => {
      state.autoDateLesson = settingAutoDateLesson.checked;
      try {
        localStorage.setItem("rauh_auto_date_lesson", state.autoDateLesson ? "true" : "false");
      } catch (err) {}
      const badge = document.querySelector("#summary-badge-dates");
      if (badge) {
        badge.textContent = state.autoDateLesson ? "📅 Päällä" : "Poissa käytöstä";
      }
      showToast(
        state.autoDateLesson
          ? "📅 Päivämääräohjaus aktivoitu: kurssille siirryttäessä avataan kuluvan päivän oppitunti"
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
      if (code) {
        if (state.autoDateLesson) {
          const autoInfo = getAutoLessonForCourse(code);
          if (autoInfo && autoInfo.lesson) {
            navigateTo(code, autoInfo.lesson);
            const dateStr = autoInfo.date ? ` (${formatDisplayDate(autoInfo.date)})` : "";
            showToast(`📅 Päivämääräohjaus: ryhmän ${autoInfo.groupCode} oppitunti #${autoInfo.lesson}${dateStr}`);
            return;
          }
        }
        navigateTo(code, 1);
      }
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

  // Sijais- ja opettajatoimintojen painikkeet
  if (btnOpenSubstituteGuide) {
    btnOpenSubstituteGuide.addEventListener("click", () => {
      closeSettingsPopover();
      window.location.hash = "#/sijaiselle";
    });
  }
  if (btnOpenSubstituteInstructions) {
    btnOpenSubstituteInstructions.addEventListener("click", () => {
      closeSettingsPopover();
      window.location.hash = "#/sijaisohjeet";
    });
  }
  if (btnBackFromSubstitute) {
    btnBackFromSubstitute.addEventListener("click", () => {
      window.location.hash = "#/koti";
    });
  }
  if (btnBackFromInstructions) {
    btnBackFromInstructions.addEventListener("click", () => {
      window.location.hash = "#/koti";
    });
  }
  if (instructionsForm) {
    instructionsForm.addEventListener("submit", handleInstructionsSubmit);
  }

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
      const isInsideGear = headerSettingsBtn && (headerSettingsBtn.contains(e.target) || path.includes(headerSettingsBtn));
      const isOpener = Boolean(
        e.target &&
        e.target.closest &&
        e.target.closest(
          "#header-settings-btn, #nav-btn-mobile-settings, [data-mobile-nav='settings'], #btn-open-settings-from-sheet"
        )
      );
      if (!isInsidePopover && !isInsideGear && !isOpener) {
        closeSettingsPopover();
      }
    }

    // 2b. Leijuvan suosikkivalikon sulkeminen kun klikataan ohi
    const favSheet = document.querySelector("#mobile-favorites-sheet");
    if (favSheet && !favSheet.hidden) {
      const isInsideFav = favSheet.contains(e.target) || path.includes(favSheet);
      const isFavOpener = Boolean(
        e.target &&
        e.target.closest &&
        e.target.closest("[data-mobile-nav='favorites']")
      );
      if (!isInsideFav && !isFavOpener) {
        closeMobileFavoritesSheet();
      }
    }

    // 3. Luokkatasojen alasvetovalikoiden sulkeminen kun klikataan muualle
    if (!e.target || !e.target.closest || !e.target.closest(".nav-grade-group")) {
      closeAllGradeCourses();
    }
  });

  // Sulkeminen Escape-näppäimellä
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllGradeCourses();
      closeMobileMenu();
      closeSettingsPopover();
      closeMobileFavoritesSheet();
    }
  });

  // Mobiilin suosikkipaneelin tapahtumat
  const sheetCloseBtn = document.querySelector("#mobile-sheet-close-btn");
  if (sheetCloseBtn) {
    sheetCloseBtn.addEventListener("click", closeMobileFavoritesSheet);
  }
  const favSheetModal = document.querySelector("#mobile-favorites-sheet");
  if (favSheetModal) {
    favSheetModal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Alustetaan asetusaccordionin tila ja mobiilipalkki
  initSettingsAccordionTracking();
  renderSettingsAccordionModeBtns();
  renderMobileBottomBar();

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
  closeMobileFavoritesSheet();
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
    const bookId = parts[1];
    if (bookId && ["7", "8", "9", "all"].includes(bookId.toLowerCase())) {
      state.activeBooksFilter = bookId.toLowerCase();
    }
    switchView("kirjat");
    if (bookId && !["7", "8", "9", "all"].includes(bookId.toLowerCase())) {
      const foundBook = state.books.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
      if (foundBook) openBookViewer(foundBook);
    }
  } else if (firstPart === "kertaus" || firstPart === "kertaustehtavat") {
    const targetCourse = parts[1];
    if (targetCourse && ["7", "8", "9", "all"].includes(targetCourse.toLowerCase())) {
      state.activeRevisionFilter = targetCourse.toLowerCase();
    }
    switchView("kertaus");
    if (targetCourse && !["7", "8", "9", "all"].includes(targetCourse.toLowerCase())) {
      const rev = state.revisions.find((r) => r.code.toUpperCase() === targetCourse.toUpperCase());
      if (rev && state.activeRevisionFilter !== "all" && state.activeRevisionFilter !== rev.grade) {
        state.activeRevisionFilter = "all";
        renderRevisions();
      }
      // Vieritetään kyseiseen kurssiin
      setTimeout(() => {
        const card = document.querySelector(`#rev-card-${targetCourse.toUpperCase()}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "start" });
          highlightCard(card);
        }
      }, 100);
    }
  } else if (firstPart === "arviointi" || firstPart === "info") {
    switchView("arviointi");
    const secId = parts[1];
    if (secId && secId !== "all") {
      setTimeout(() => {
        const el = document.querySelector(`#info-${secId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  } else if (firstPart === "lukujarjestys") {
    switchView("lukujarjestys");
  } else if (firstPart === "aikataulu" || firstPart === "ryhmat" || firstPart === "portaali") {
    if (parts[1]) {
      state.activeScheduleGroup = parts[1];
    } else {
      const allGroups = getAllScheduleGroups();
      const favGroups = allGroups.filter((g) => state.favorites.includes(g.groupCode));
      if (favGroups.length > 0) {
        const pref = favGroups.find((g) => g.groupCode === state.defaultScheduleGroup);
        state.activeScheduleGroup = pref ? pref.groupCode : favGroups[0].groupCode;
      } else {
        state.activeScheduleGroup = null;
      }
    }
    switchView("aikataulu");
  } else if (firstPart === "sijaiselle" || firstPart === "substitute") {
    switchView("sijaiselle");
  } else if (firstPart === "sijaisohjeet" || firstPart === "instructions") {
    switchView("sijaisohjeet");
  } else {
    // Kurssioppitunti: esim. #/MA_71 tai #/MA_71/1 tai #/FY_91/3
    const courseCode = parts[0];
    let lessonNum = parts[1] ? parseInt(parts[1], 10) : null;

    const foundCourse = state.courses.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
    if (foundCourse) {
      if (!lessonNum) {
        if (state.autoDateLesson) {
          const autoInfo = getAutoLessonForCourse(foundCourse.code);
          if (autoInfo && autoInfo.lesson) {
            lessonNum = autoInfo.lesson;
            const dateStr = autoInfo.date ? ` (${formatDisplayDate(autoInfo.date)})` : "";
            showToast(`📅 Päivämääräohjaus: ryhmän ${autoInfo.groupCode} oppitunti #${lessonNum}${dateStr}`);
          } else {
            lessonNum = 1;
          }
        } else {
          lessonNum = 1;
        }
      }

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
  if (viewLukujarjestys) viewLukujarjestys.hidden = viewName !== "lukujarjestys";
  if (viewAikataulu) viewAikataulu.hidden = viewName !== "aikataulu";
  if (viewSubstitute) viewSubstitute.hidden = viewName !== "sijaiselle";
  if (viewInstructions) viewInstructions.hidden = viewName !== "sijaisohjeet";

  // Sivupalkin vastaavat kontrollit
  if (sidebarLessonControls) sidebarLessonControls.hidden = viewName !== "lesson";
  if (sidebarBooksControls) sidebarBooksControls.hidden = viewName !== "kirjat";
  if (sidebarRevisionControls) sidebarRevisionControls.hidden = viewName !== "kertaus";
  if (sidebarAikatauluControls) sidebarAikatauluControls.hidden = viewName !== "aikataulu";

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
  } else if (viewName === "lukujarjestys") {
    renderTimetable();
  } else if (viewName === "aikataulu") {
    renderAikataulu();
  } else if (viewName === "sijaiselle") {
    renderSubstituteGuide();
  } else if (viewName === "sijaisohjeet") {
    initInstructionsForm();
  }

  renderSidebarFavorites();
  updateFavoriteToggleBtn();
  updateMobileBottomBarActive();
}

function updateNavTabsUI() {
  navTabs.forEach((tab) => {
    const navType = tab.dataset.nav;
    if (navType === "grade") {
      tab.classList.toggle("active", state.activeView === "lesson" && tab.dataset.grade === state.activeGrade);
    } else if (navType === "dropdown") {
      tab.classList.toggle("active", state.activeView === tab.dataset.dropdown);
    } else if (navType === "view") {
      const isHome = state.activeView === "home" && (tab.dataset.view === "home" || tab.dataset.view === "koti");
      tab.classList.toggle("active", isHome || state.activeView === tab.dataset.view);
    }
  });
  renderMobileNavCourseLists();
  renderMobileNavBooksList();
  renderMobileNavRevisionsList();
  updateMobileNavDropdownActiveStates();
}

function updateMobileNavDropdownActiveStates() {
  // Kirjat
  document.querySelectorAll("[data-action='book-filter']").forEach((btn) => {
    const f = btn.dataset.filter;
    const isActive = state.activeView === "kirjat" && state.activeBooksFilter === f;
    btn.classList.toggle("active", isActive);
  });
  document.querySelectorAll("[data-books-grade-btn]").forEach((btn) => {
    const g = btn.dataset.booksGradeBtn;
    const isActive = state.activeView === "kirjat" && state.activeBooksFilter === g;
    btn.classList.toggle("active", isActive);
  });
  document.querySelectorAll("[data-book-id]").forEach((btn) => {
    const bId = btn.dataset.bookId;
    const isBookActive = state.activeView === "kirjat" && window.location.hash.toLowerCase().includes(bId.toLowerCase());
    btn.classList.toggle("active", isBookActive);
  });

  // Kertaus
  document.querySelectorAll("[data-action='revision-filter']").forEach((btn) => {
    const f = btn.dataset.filter;
    const isActive = state.activeView === "kertaus" && state.activeRevisionFilter === f;
    btn.classList.toggle("active", isActive);
  });
  document.querySelectorAll("[data-revisions-grade-btn]").forEach((btn) => {
    const g = btn.dataset.revisionsGradeBtn;
    const isActive = state.activeView === "kertaus" && state.activeRevisionFilter === g;
    btn.classList.toggle("active", isActive);
  });
  document.querySelectorAll("[data-revision-code]").forEach((btn) => {
    const code = btn.dataset.revisionCode;
    const isRevActive = state.activeView === "kertaus" && window.location.hash.toUpperCase().includes(code.toUpperCase());
    btn.classList.toggle("active", isRevActive);
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

function isGroupKey(key) {
  if (!key || typeof key !== "string") return false;
  return key.includes(".") && /^[A-Z0-9_]+\.[0-9]+$/i.test(key);
}

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
  if (lower === "lukujarjestys") {
    return {
      key: "lukujarjestys",
      type: "section",
      title: "Lukujärjestys (RAUH)",
      label: "📅 Lukujärjestys (RAUH)",
      hash: "#/lukujarjestys",
      icon: "📅"
    };
  }
  if (lower === "aikataulu" || lower === "ryhmat") {
    return {
      key: "aikataulu",
      type: "section",
      title: "Ryhmät",
      label: "👥 Ryhmät",
      hash: "#/aikataulu",
      icon: "👥"
    };
  }

  // Ryhmäkohde (esim. "FY_71.3", "MA_72.1")
  if (isGroupKey(key)) {
    const [cCode] = String(key).split(".");
    const course = (state.courses || []).find((c) => c.code.toUpperCase() === cCode.toUpperCase());
    const courseTitle = course ? course.title : cCode;
    return {
      key: String(key).toUpperCase(),
      type: "group",
      title: `Ryhmä ${key} (${courseTitle})`,
      label: `👥 Ryhmä ${key}: ${courseTitle}`,
      hash: `#/aikataulu/${encodeURIComponent(key)}`,
      icon: "👥",
      courseCode: cCode.toUpperCase()
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
    hash: `#/${code}`,
    icon: icon
  };
}

function applyFavoritesCollapseState() {
  const section = document.querySelector("#sidebar-favorites-section");
  if (section) {
    section.classList.toggle("is-collapsed", state.favoritesCollapsed);
  }
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
        // Suodatetaan pois lukujärjestys ja ryhmät yleisnäkyminä, koska ne on poistettu suosikeista
        state.favorites = parsed.filter(
          (k) => k !== "lukujarjestys" && k !== "aikataulu" && k !== "ryhmat"
        );
      }
    }
  } catch (err) {
    console.warn("Virhe suosikkien latauksessa:", err);
  }

  try {
    const rawDef = localStorage.getItem("rauh_default_view");
    if (rawDef) {
      if (rawDef === "lukujarjestys" || rawDef === "aikataulu" || rawDef === "ryhmat") {
        state.defaultView = "home";
      } else {
        state.defaultView = rawDef;
      }
    }
  } catch (err) {
    console.warn("Virhe oletusnäkymän latauksessa:", err);
  }

  try {
    state.defaultScheduleGroup = localStorage.getItem("rauh_default_schedule_group") || null;
  } catch (err) {}

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

  try {
    const rawHome = localStorage.getItem("rauh_home_config");
    if (rawHome) {
      const parsed = JSON.parse(rawHome);
      if (parsed && Array.isArray(parsed.blocks)) {
        const allowedIds = ["welcome", "weekInfo"];
        const validBlocks = parsed.blocks.filter((b) => allowedIds.includes(b.id));

        allowedIds.forEach((id) => {
          if (!validBlocks.some((b) => b.id === id)) {
            validBlocks.push({
              id,
              title: id === "welcome" ? "Tervetuloteksti" : "Viikon infokortti",
              enabled: true
            });
          }
        });

        state.homeConfig = {
          blocks: validBlocks
        };
      }
    }
  } catch (err) {
    console.warn("Virhe kotinäkymän asetusten latauksessa:", err);
  }

  try {
    const rawMobileNav = localStorage.getItem("rauh_mobile_nav_order");
    if (rawMobileNav) {
      const parsed = JSON.parse(rawMobileNav);
      const validKeys = ["lukujarjestys", "ryhmat", "favorites", "settings"];
      if (Array.isArray(parsed) && parsed.length === 4 && validKeys.every((k) => parsed.includes(k))) {
        state.mobileNavOrder = parsed;
      }
    }
  } catch (err) {}

  try {
    const rawAccMode = localStorage.getItem("rauh_settings_accordion_mode");
    if (rawAccMode && ["closed", "last", "all"].includes(rawAccMode)) {
      state.settingsAccordionMode = rawAccMode;
    }
  } catch (err) {}

  try {
    const rawLastOpen = localStorage.getItem("rauh_settings_last_open");
    if (rawLastOpen) {
      const parsed = JSON.parse(rawLastOpen);
      if (Array.isArray(parsed)) {
        state.settingsLastOpenCards = parsed;
      }
    }
  } catch (err) {}

  applyTheme(state.theme, false);
}

function savePreferences() {
  try {
    localStorage.setItem("rauh_favorites", JSON.stringify(state.favorites));
    localStorage.setItem("rauh_default_view", state.defaultView);
    localStorage.setItem("rauh_fav_collapsed", state.favoritesCollapsed ? "true" : "false");
    localStorage.setItem("rauh_home_config", JSON.stringify(state.homeConfig));
    localStorage.setItem("rauh_mobile_nav_order", JSON.stringify(state.mobileNavOrder));
    localStorage.setItem("rauh_settings_accordion_mode", state.settingsAccordionMode);
    if (state.defaultScheduleGroup) {
      localStorage.setItem("rauh_default_schedule_group", state.defaultScheduleGroup);
    } else {
      localStorage.removeItem("rauh_default_schedule_group");
    }
  } catch (err) {
    console.warn("Virhe tallennuksessa:", err);
  }
  renderSidebarFavorites();
  updateFavoriteToggleBtn();
  renderMobileBottomBar();
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
  const icon = cleanScope === "compact" ? "🎯" : "📖";
  showToast(`${icon} Oppituntien laajuus: ${labels[cleanScope] || cleanScope}`);
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
    // Jos käyttäjä on jo kurssioppitunnilla, avataan kyseisen luokkatason kurssit valmiiksi esille
    if (state.activeView === "lesson" && state.activeGrade) {
      openMobileGradeCourses(state.activeGrade);
    }
  } else {
    // Suljetaan harmonikat kun valikko suljetaan
    closeAllGradeCourses();
  }
}

function closeAllGradeCourses() {
  document.querySelectorAll(".nav-grade-group").forEach((g) => g.classList.remove("is-expanded"));
  document.querySelectorAll(".nav-grade-courses").forEach((c) => {
    c.hidden = true;
  });
  document.querySelectorAll(".nav-course-lessons-dropdown").forEach((d) => {
    d.hidden = true;
  });
  document.querySelectorAll(".nav-course-btn").forEach((b) => {
    b.classList.remove("is-expanded");
    b.setAttribute("aria-expanded", "false");
  });
}

function openMobileGradeCourses(grade) {
  document.querySelectorAll(".nav-grade-group").forEach((g) => {
    const isThis = g.dataset.gradeGroup === grade;
    g.classList.toggle("is-expanded", isThis);
  });
  document.querySelectorAll(".nav-grade-courses").forEach((c) => {
    const isThis = c.id === `nav-grade-courses-${grade}`;
    c.hidden = !isThis;
    if (isThis && state.activeCourse && state.activeCourse.grade === grade) {
      toggleCourseLessons(state.activeCourse.code, c, true);
    }
  });
}

function toggleNavDropdown(key) {
  const group = document.querySelector(
    `.nav-grade-group[data-grade-group="${key}"], .nav-grade-group[data-dropdown-group="${key}"]`
  );
  const menu = document.querySelector(`#nav-grade-courses-${key}, #nav-dropdown-${key}`);
  if (!group || !menu) return;

  const isCurrentlyOpen = !menu.hidden;
  closeAllGradeCourses();
  if (!isCurrentlyOpen) {
    group.classList.add("is-expanded");
    menu.hidden = false;
    if (state.activeCourse && state.activeCourse.grade === key) {
      toggleCourseLessons(state.activeCourse.code, menu, true);
    }
    if (key === "kirjat" && state.activeBooksFilter && state.activeBooksFilter !== "all") {
      toggleBooksGrade(state.activeBooksFilter, menu, true);
    }
    if (key === "kertaus" && state.activeRevisionFilter && state.activeRevisionFilter !== "all") {
      toggleRevisionsGrade(state.activeRevisionFilter, menu, true);
    }
  }
}

function toggleMobileGradeCourses(grade) {
  toggleNavDropdown(grade);
}

async function toggleCourseLessons(courseCode, container, forceOpen = false) {
  const code = courseCode.toUpperCase();
  const dropdown = container.querySelector(`#nav-lessons-${code.toLowerCase()}`);
  const btn = container.querySelector(`.nav-course-btn[data-course-code="${code}"]`);
  if (!dropdown || !btn) return;

  const willOpen = forceOpen ? true : dropdown.hidden;

  // Suljetaan muut saman tason kurssien tuntilistat
  container.querySelectorAll(".nav-course-lessons-dropdown").forEach((d) => {
    if (d !== dropdown) d.hidden = true;
  });
  container.querySelectorAll(".nav-course-btn").forEach((b) => {
    if (b !== btn) {
      b.classList.remove("is-expanded");
      b.setAttribute("aria-expanded", "false");
    }
  });

  if (!willOpen) {
    dropdown.hidden = true;
    btn.classList.remove("is-expanded");
    btn.setAttribute("aria-expanded", "false");
    return;
  }

  btn.classList.add("is-expanded");
  btn.setAttribute("aria-expanded", "true");
  dropdown.hidden = false;

  if (!dropdown.dataset.loaded) {
    dropdown.innerHTML = '<div class="nav-lessons-loading">Ladataan oppitunteja…</div>';
    try {
      const courseData = await getCourseData(code);
      const lessons = courseData.lessons || [];
      if (!lessons.length) {
        dropdown.innerHTML = '<div class="nav-lessons-empty">Ei oppitunteja saatavilla.</div>';
        return;
      }

      const activeCourseCode = state.activeCourse ? state.activeCourse.code : null;
      const isThisCourseActive = activeCourseCode && activeCourseCode.toUpperCase() === code;

      dropdown.innerHTML = `
        <div class="nav-lessons-list">
          <button type="button" class="nav-lesson-item-btn nav-course-top-btn" data-course-code="${escapeHtml(code)}" data-lesson-num="1" title="Siirry kurssin alkuun">
            <span class="nav-lesson-num">🚀</span>
            <span class="nav-lesson-title">Siirry kurssin alkuun (#1)</span>
          </button>
          ${lessons
            .map((l) => {
              const isLessonActive = isThisCourseActive && state.activeLessonNumber === l.lesson;
              const lessonTitle = l.title || l.topic || `Oppitunti ${l.lesson}`;
              return `
                <button
                  type="button"
                  class="nav-lesson-item-btn ${isLessonActive ? "active" : ""}"
                  data-course-code="${escapeHtml(code)}"
                  data-lesson-num="${l.lesson}"
                  title="Oppitunti #${l.lesson}: ${escapeHtml(lessonTitle)}"
                >
                  <span class="nav-lesson-num">#${l.lesson}</span>
                  <span class="nav-lesson-title">${escapeHtml(lessonTitle)}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      `;
      dropdown.dataset.loaded = "true";

      dropdown.querySelectorAll(".nav-lesson-item-btn").forEach((lBtn) => {
        lBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const lNum = parseInt(lBtn.dataset.lessonNum, 10) || 1;
          closeAllGradeCourses();
          closeMobileMenu();
          navigateTo(code, lNum);
        });
      });
    } catch (err) {
      console.error("Virhe oppituntien latauksessa:", err);
      dropdown.innerHTML = '<div class="nav-lessons-empty">Oppituntien lataus epäonnistui.</div>';
    }
  } else {
    const activeCourseCode = state.activeCourse ? state.activeCourse.code : null;
    const isThisCourseActive = activeCourseCode && activeCourseCode.toUpperCase() === code;
    dropdown.querySelectorAll(".nav-lesson-item-btn").forEach((lBtn) => {
      const lNum = parseInt(lBtn.dataset.lessonNum, 10);
      const isLessonActive = isThisCourseActive && state.activeLessonNumber === lNum;
      lBtn.classList.toggle("active", isLessonActive);
    });
  }
}

function renderMobileNavCourseLists() {
  if (!state.courses || !state.courses.length) return;

  const grades = ["7", "8", "9", "valinnainen"];

  grades.forEach((grade) => {
    const container = document.querySelector(`#nav-grade-courses-${grade}`);
    if (!container) return;

    const filtered = state.courses.filter((c) => c.grade === grade);
    const activeCourseCode = state.activeCourse ? state.activeCourse.code : null;

    container.innerHTML = filtered
      .map((c) => {
        const isActive = activeCourseCode && activeCourseCode.toUpperCase() === c.code.toUpperCase();
        const icon = c.subject === "fysiikka" ? "⚡" : "📐";
        const gradeClass =
          grade === "7"
            ? "grade-7"
            : grade === "8"
            ? "grade-8"
            : grade === "9"
            ? "grade-9"
            : "grade-other";

        return `
          <div class="nav-course-item" data-course-code="${escapeHtml(c.code)}">
            <button
              type="button"
              class="nav-course-btn ${isActive ? "active" : ""}"
              data-course-code="${escapeHtml(c.code)}"
              aria-expanded="false"
              title="${escapeHtml(c.title)} - avaa oppituntilista"
            >
              <span class="nav-course-badge ${gradeClass}">${icon} ${escapeHtml(c.code)}</span>
              <span class="nav-course-title">${escapeHtml(c.title)}</span>
              <span class="nav-course-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="nav-course-lessons-dropdown" id="nav-lessons-${escapeHtml(c.code.toLowerCase())}" hidden></div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".nav-course-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = btn.dataset.courseCode;
        if (!code) return;

        const isMobile = window.innerWidth <= 768;
        const isChevron = !!e.target.closest(".nav-course-chevron");

        if (isMobile || isChevron) {
          await toggleCourseLessons(code, container);
        } else {
          closeAllGradeCourses();
          closeMobileMenu();
          navigateTo(code, 1);
        }
      });
    });
  });
}

function toggleBooksGrade(grade, container, forceOpen = false) {
  const dropdown = container.querySelector(`#nav-books-grade-${grade}`);
  const btn = container.querySelector(`.nav-course-btn[data-books-grade-btn="${grade}"]`);
  if (!dropdown || !btn) return;

  const willOpen = forceOpen ? true : dropdown.hidden;

  container.querySelectorAll(".nav-books-dropdown").forEach((d) => {
    if (d !== dropdown) d.hidden = true;
  });
  container.querySelectorAll("[data-books-grade-btn]").forEach((b) => {
    if (b !== btn) {
      b.classList.remove("is-expanded");
      b.setAttribute("aria-expanded", "false");
    }
  });

  if (!willOpen) {
    dropdown.hidden = true;
    btn.classList.remove("is-expanded");
    btn.setAttribute("aria-expanded", "false");
    return;
  }

  btn.classList.add("is-expanded");
  btn.setAttribute("aria-expanded", "true");
  dropdown.hidden = false;
}

function renderMobileNavBooksList() {
  const container = document.querySelector("#nav-dropdown-kirjat");
  if (!container || !state.books || !state.books.length) return;

  const grades = ["7", "8", "9"];
  const isKirjatActive = state.activeView === "kirjat";
  const activeFilter = state.activeBooksFilter || "all";

  let html = `
    <button type="button" class="nav-course-btn ${isKirjatActive && activeFilter === "all" ? "active" : ""}" data-action="book-filter" data-filter="all">
      <span class="nav-course-badge grade-other">📚 Kaikki</span>
      <span class="nav-course-title">Kaikki oppikirjat (7–9 lk)</span>
      <span class="nav-course-arrow" aria-hidden="true">→</span>
    </button>
  `;

  grades.forEach((grade) => {
    const gradeBooks = state.books.filter((b) => b.grade === grade);
    const gradeClass = grade === "7" ? "grade-7" : grade === "8" ? "grade-8" : "grade-9";
    const gradeIcon = grade === "7" ? "🟢" : grade === "8" ? "🔵" : "🟣";
    const isGradeActive = isKirjatActive && activeFilter === grade;

    html += `
      <div class="nav-course-item" data-books-grade="${grade}">
        <button
          type="button"
          class="nav-course-btn ${isGradeActive ? "active" : ""}"
          data-books-grade-btn="${grade}"
          aria-expanded="false"
          title="${grade}. luokan kirjat - avaa kirjalista"
        >
          <span class="nav-course-badge ${gradeClass}">${gradeIcon} ${grade}. lk</span>
          <span class="nav-course-title">${grade}. luokan kirjat (${gradeBooks.length})</span>
          <span class="nav-course-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="nav-course-lessons-dropdown nav-books-dropdown" id="nav-books-grade-${grade}" hidden>
          <div class="nav-lessons-list">
            <button
              type="button"
              class="nav-lesson-item-btn nav-course-top-btn ${isGradeActive ? "active" : ""}"
              data-action="book-filter"
              data-filter="${grade}"
              title="Näytä kaikki ${grade}. lk kirjat"
            >
              <span class="nav-lesson-num">📚</span>
              <span class="nav-lesson-title">Näytä kaikki ${grade}. lk kirjat</span>
            </button>
            ${gradeBooks
              .map((b) => {
                const isBookActive = isKirjatActive && window.location.hash.toLowerCase().includes(b.id.toLowerCase());
                return `
                  <button
                    type="button"
                    class="nav-lesson-item-btn ${isBookActive ? "active" : ""}"
                    data-book-id="${escapeHtml(b.id)}"
                    title="${escapeHtml(b.grade + '. lk ' + b.part + ': ' + b.title)}"
                  >
                    <span class="nav-lesson-num">${escapeHtml(b.part || b.grade + '. lk')}</span>
                    <span class="nav-lesson-title">${escapeHtml(b.title)}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Tapahtumat "Kaikki" ja luokkatason suodatinpainikkeille
  container.querySelectorAll("[data-action='book-filter']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filter = btn.dataset.filter || "all";
      state.activeBooksFilter = filter;
      closeAllGradeCourses();
      closeMobileMenu();
      if (state.activeView === "kirjat") {
        renderBooks();
      } else {
        window.location.hash = "#/kirjat";
      }
      updateNavTabsUI();
    });
  });

  // Tapahtumat luokkatasojen haitaripainikkeille
  container.querySelectorAll("[data-books-grade-btn]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const grade = btn.dataset.booksGradeBtn;
      if (!grade) return;

      const isMobile = window.innerWidth <= 768;
      const isChevron = !!e.target.closest(".nav-course-chevron");

      if (isMobile || isChevron) {
        toggleBooksGrade(grade, container);
      } else {
        state.activeBooksFilter = grade;
        closeAllGradeCourses();
        closeMobileMenu();
        if (state.activeView === "kirjat") {
          renderBooks();
        } else {
          window.location.hash = "#/kirjat";
        }
        updateNavTabsUI();
      }
    });
  });

  // Tapahtumat yksittäisten kirjojen painikkeille
  container.querySelectorAll("[data-book-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const bookId = btn.dataset.bookId;
      if (!bookId) return;

      const book = state.books.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
      closeAllGradeCourses();
      closeMobileMenu();

      if (book) {
        state.activeBooksFilter = book.grade;
        if (window.location.hash === `#/kirjat/${book.id}`) {
          switchView("kirjat");
          openBookViewer(book);
        } else {
          window.location.hash = `#/kirjat/${book.id}`;
        }
      }
    });
  });
}

function toggleRevisionsGrade(grade, container, forceOpen = false) {
  const dropdown = container.querySelector(`#nav-revisions-grade-${grade}`);
  const btn = container.querySelector(`.nav-course-btn[data-revisions-grade-btn="${grade}"]`);
  if (!dropdown || !btn) return;

  const willOpen = forceOpen ? true : dropdown.hidden;

  container.querySelectorAll(".nav-revisions-dropdown").forEach((d) => {
    if (d !== dropdown) d.hidden = true;
  });
  container.querySelectorAll("[data-revisions-grade-btn]").forEach((b) => {
    if (b !== btn) {
      b.classList.remove("is-expanded");
      b.setAttribute("aria-expanded", "false");
    }
  });

  if (!willOpen) {
    dropdown.hidden = true;
    btn.classList.remove("is-expanded");
    btn.setAttribute("aria-expanded", "false");
    return;
  }

  btn.classList.add("is-expanded");
  btn.setAttribute("aria-expanded", "true");
  dropdown.hidden = false;
}

function renderMobileNavRevisionsList() {
  const container = document.querySelector("#nav-dropdown-kertaus");
  if (!container || !state.revisions || !state.revisions.length) return;

  const grades = ["7", "8", "9"];
  const isKertausActive = state.activeView === "kertaus";
  const activeFilter = state.activeRevisionFilter || "all";

  let html = `
    <button type="button" class="nav-course-btn ${isKertausActive && activeFilter === "all" ? "active" : ""}" data-action="revision-filter" data-filter="all">
      <span class="nav-course-badge grade-other">📝 Kaikki</span>
      <span class="nav-course-title">Kaikki kertaustehtävät</span>
      <span class="nav-course-arrow" aria-hidden="true">→</span>
    </button>
  `;

  grades.forEach((grade) => {
    const gradeRevisions = state.revisions.filter((r) => r.grade === grade);
    const gradeClass = grade === "7" ? "grade-7" : grade === "8" ? "grade-8" : "grade-9";
    const gradeIcon = grade === "7" ? "🟢" : grade === "8" ? "🔵" : "🟣";
    const isGradeActive = isKertausActive && activeFilter === grade;

    html += `
      <div class="nav-course-item" data-revisions-grade="${grade}">
        <button
          type="button"
          class="nav-course-btn ${isGradeActive ? "active" : ""}"
          data-revisions-grade-btn="${grade}"
          aria-expanded="false"
          title="${grade}. luokan kertaustehtävät - avaa kurssiluettelo"
        >
          <span class="nav-course-badge ${gradeClass}">${gradeIcon} ${grade}. lk</span>
          <span class="nav-course-title">${grade}. luokan kertaustehtävät (${gradeRevisions.length})</span>
          <span class="nav-course-chevron" aria-hidden="true">▾</span>
        </button>
        <div class="nav-course-lessons-dropdown nav-revisions-dropdown" id="nav-revisions-grade-${grade}" hidden>
          <div class="nav-lessons-list">
            <button
              type="button"
              class="nav-lesson-item-btn nav-course-top-btn ${isGradeActive ? "active" : ""}"
              data-action="revision-filter"
              data-filter="${grade}"
              title="Näytä kaikki ${grade}. lk kertaustehtävät"
            >
              <span class="nav-lesson-num">📝</span>
              <span class="nav-lesson-title">Näytä kaikki ${grade}. lk kertaustehtävät</span>
            </button>
            ${gradeRevisions
              .map((r) => {
                const icon = r.subject === "fysiikka" ? "⚡" : "📐";
                const isRevActive = isKertausActive && window.location.hash.toUpperCase().includes(r.code.toUpperCase());
                return `
                  <button
                    type="button"
                    class="nav-lesson-item-btn ${isRevActive ? "active" : ""}"
                    data-revision-code="${escapeHtml(r.code)}"
                    title="${escapeHtml(r.code + ': ' + r.title)}"
                  >
                    <span class="nav-lesson-num">${icon} ${escapeHtml(r.code)}</span>
                    <span class="nav-lesson-title">${escapeHtml(r.title)}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Tapahtumat "Kaikki" ja luokkatason suodatinpainikkeille
  container.querySelectorAll("[data-action='revision-filter']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filter = btn.dataset.filter || "all";
      state.activeRevisionFilter = filter;
      closeAllGradeCourses();
      closeMobileMenu();
      if (state.activeView === "kertaus") {
        renderRevisions();
      } else {
        window.location.hash = "#/kertaus";
      }
      updateNavTabsUI();
    });
  });

  // Tapahtumat luokkatasojen haitaripainikkeille
  container.querySelectorAll("[data-revisions-grade-btn]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const grade = btn.dataset.revisionsGradeBtn;
      if (!grade) return;

      const isMobile = window.innerWidth <= 768;
      const isChevron = !!e.target.closest(".nav-course-chevron");

      if (isMobile || isChevron) {
        toggleRevisionsGrade(grade, container);
      } else {
        state.activeRevisionFilter = grade;
        closeAllGradeCourses();
        closeMobileMenu();
        if (state.activeView === "kertaus") {
          renderRevisions();
        } else {
          window.location.hash = "#/kertaus";
        }
        updateNavTabsUI();
      }
    });
  });

  // Tapahtumat yksittäisten kurssien kertaustehtäväpainikkeille
  container.querySelectorAll("[data-revision-code]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const code = btn.dataset.revisionCode;
      if (!code) return;

      closeAllGradeCourses();
      closeMobileMenu();

      const rev = state.revisions.find((r) => r.code.toUpperCase() === code.toUpperCase());
      if (rev) {
        state.activeRevisionFilter = "all";
        if (window.location.hash === `#/kertaus/${rev.code}`) {
          switchView("kertaus");
          setTimeout(() => {
            const card = document.querySelector(`#rev-card-${rev.code.toUpperCase()}`);
            if (card) {
              card.scrollIntoView({ behavior: "smooth", block: "start" });
              highlightCard(card);
            }
          }, 80);
        } else {
          window.location.hash = `#/kertaus/${rev.code}`;
        }
      }
    });
  });
}

function highlightCard(element) {
  if (!element) return;
  element.classList.remove("card-highlight");
  void element.offsetWidth;
  element.classList.add("card-highlight");
  setTimeout(() => {
    element.classList.remove("card-highlight");
  }, 2200);
}

function closeMobileMenu() {
  toggleMobileMenu(false);
}

function openSettingsPopover() {
  if (!settingsPopover) return;
  closeMobileMenu();
  closeMobileFavoritesSheet();
  settingsPopover.hidden = false;
  if (headerSettingsBtn) {
    headerSettingsBtn.classList.add("is-active");
    headerSettingsBtn.setAttribute("aria-expanded", "true");
  }
  applySettingsAccordionMode();
  updateMobileBottomBarActive();
  renderSettingsPopover();

  // Ohjataan näkymä ja vieritys heti asetuksiin
  settingsPopover.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });

  requestAnimationFrame(() => {
    try {
      settingsPopover.scrollIntoView({ behavior: "smooth", block: "nearest" });
      settingsPopover.focus({ preventScroll: true });
    } catch (e) {}
  });
}

function closeSettingsPopover() {
  if (!settingsPopover) return;
  settingsPopover.hidden = true;
  if (headerSettingsBtn) {
    headerSettingsBtn.classList.remove("is-active");
    headerSettingsBtn.setAttribute("aria-expanded", "false");
  }
  updateMobileBottomBarActive();
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
  const lower = String(rawKey).toLowerCase();
  // Lukujärjestys ja Ryhmät yleisnäkyminä eivät ole enää suosikeissa
  if (lower === "lukujarjestys" || lower === "aikataulu" || lower === "ryhmat") return;

  const isSection = ["kirjat", "kertaus", "arviointi"].includes(lower);
  const key = isSection ? lower : rawKey.toUpperCase();

  const idx = state.favorites.indexOf(key);
  const meta = getFavoriteMeta(key);

  if (idx !== -1) {
    state.favorites.splice(idx, 1);
    if (state.defaultView === key) {
      state.defaultView = "home";
    }
    if (state.defaultScheduleGroup === key) {
      state.defaultScheduleGroup = null;
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

  // 3. Ryhmäsuosikkitähti aikataulunäkymässä
  updateCurrentGroupFavoriteButton();
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
          : meta.type === "group"
          ? state.activeView === "aikataulu" && state.activeScheduleGroup?.toUpperCase() === key.toUpperCase()
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

function getWeatherDescription(code) {
  if (code === 0) return "Selkeää";
  if (code === 1) return "Enimmäkseen selkeää";
  if (code === 2) return "Puolipilvistä";
  if (code === 3) return "Pilvistä";
  if (code === 45 || code === 48) return "Sumua";
  if (code >= 51 && code <= 55) return "Tihkusadetta";
  if (code >= 56 && code <= 57) return "Jäätävää tihkusadetta";
  if (code >= 61 && code <= 65) return "Vesisadetta";
  if (code >= 66 && code <= 67) return "Jäätävää sadetta";
  if (code >= 71 && code <= 77) return "Lumisadetta";
  if (code >= 80 && code <= 82) return "Sadekuuroja";
  if (code >= 85 && code <= 86) return "Lumikuuroja";
  if (code >= 95) return "Ukkoskuuroja";
  return "Vaihtelevaa";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "🌨️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 85 && code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

async function fetchPasilaWeather() {
  try {
    const cached = sessionStorage.getItem("rauh_pasila_weather");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.199&longitude=24.934&current_weather=true", {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const cur = json.current_weather;
    if (!cur) return null;

    const data = {
      temp: Math.round(cur.temperature),
      code: cur.weathercode,
      desc: getWeatherDescription(cur.weathercode),
      icon: getWeatherIcon(cur.weathercode)
    };

    try {
      sessionStorage.setItem("rauh_pasila_weather", JSON.stringify({ timestamp: Date.now(), data }));
    } catch (e) {}

    return data;
  } catch (err) {
    console.warn("Säätilan lataus epäonnistui:", err);
    return null;
  }
}

async function loadAndRenderPasilaWeather() {
  const weatherEl = document.querySelector("#home-week-weather");
  if (!weatherEl) return;

  const weather = await fetchPasilaWeather();
  if (!weather) {
    weatherEl.innerHTML = "";
    return;
  }

  weatherEl.innerHTML = `
    <div class="home-weather-pill" title="Pasilan peruskoulu, Helsinki · Tämän päivän sää">
      <span class="weather-icon" aria-hidden="true">${weather.icon}</span>
      <span class="weather-temp">${weather.temp > 0 ? "+" : ""}${weather.temp}&nbsp;°C</span>
      <span class="weather-desc">${escapeHtml(weather.desc)}</span>
    </div>
  `;
}

function getHomeWeekData(offset = 0) {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset * 7);

  const weekNum = getWeekNumber(targetDate);
  const monday = getMonday(targetDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startIso = formatDate(monday);
  const endIso = formatDate(sunday);

  const groups = getAllScheduleGroups();
  const rawExams = [];
  const rawExceptions = [];

  groups.forEach((g) => {
    const exs = g.schedule?.exceptions || [];
    exs.forEach((ex) => {
      if (ex.date >= startIso && ex.date <= endIso) {
        const isExam = /koe/i.test(ex.type) || /koe/i.test(ex.description);
        const item = {
          groupCode: g.groupCode,
          courseCode: g.courseCode,
          date: ex.date,
          type: ex.type,
          description: ex.description
        };
        if (isExam) {
          rawExams.push(item);
        } else {
          rawExceptions.push(item);
        }
      }
    });
  });

  const groupEvents = (list) => {
    const map = new Map();
    list.forEach((item) => {
      const key = `${item.date}__${item.type}`;
      if (!map.has(key)) {
        map.set(key, {
          date: item.date,
          type: item.type,
          description: item.description,
          groups: [item.groupCode]
        });
      } else {
        const existing = map.get(key);
        if (!existing.groups.includes(item.groupCode)) {
          existing.groups.push(item.groupCode);
        }
      }
    });
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  const exams = groupEvents(rawExams);
  const exceptions = groupEvents(rawExceptions);

  let nextExam = null;
  if (exams.length === 0) {
    const todayIso = formatDate(now);
    const searchFrom = todayIso > endIso ? todayIso : endIso;
    const futureExams = [];
    groups.forEach((g) => {
      (g.schedule?.exceptions || []).forEach((ex) => {
        if (ex.date > searchFrom && (/koe/i.test(ex.type) || /koe/i.test(ex.description))) {
          futureExams.push({ groupCode: g.groupCode, date: ex.date, type: ex.type });
        }
      });
    });
    futureExams.sort((a, b) => a.date.localeCompare(b.date));
    if (futureExams.length > 0) {
      nextExam = futureExams[0];
    }
  }

  let fact = null;
  if (state.scienceFacts && state.scienceFacts[String(weekNum)]) {
    fact = state.scienceFacts[String(weekNum)];
  } else {
    fact = {
      title: "Tiedefakta",
      text: "Matematiikka ja fysiikka rakentuvat uteliaisuuden, kokeellisten havaintojen ja loogisen päättelyn varaan.",
      url: "https://fi.wikipedia.org/wiki/Luonnontiede",
      linkText: "Lue lisää tieteestä (Wikipedia)"
    };
  }

  return {
    now,
    targetDate,
    weekNum,
    monday,
    sunday,
    startIso,
    endIso,
    exams,
    exceptions,
    nextExam,
    fact
  };
}

function renderHomeWeekInfoCardHtml() {
  const weekData = getHomeWeekData(state.homeWeekOffset);
  const isCurrentWeek = state.homeWeekOffset === 0;
  const now = weekData.now;

  const headerDateStr = isCurrentWeek
    ? `${weekdayNames[now.getDay()]} ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`
    : `Viikko ${weekData.weekNum} · ${formatDateRange(weekData.startIso, weekData.endIso)}`;

  let examsHtml = "";
  if (weekData.exams.length > 0) {
    examsHtml = `
      <ul class="home-week-event-list">
        ${weekData.exams
          .map((item) => `
            <li class="home-week-event-item exam-item">
              <div class="home-week-event-top">
                <span class="home-week-groups-badge">${escapeHtml(item.groups.join(", "))}</span>
                <span class="home-week-event-date">${formatDisplayDate(item.date)}</span>
              </div>
              <div class="home-week-event-desc">
                <strong>${escapeHtml(item.type.replace(/\*/g, "").trim())}</strong>${item.description ? `: ${escapeHtml(item.description)}` : ""}
              </div>
            </li>
          `)
          .join("")}
      </ul>
    `;
  } else {
    examsHtml = `
      <div class="home-week-empty-notice">
        <p class="home-week-empty-main">Ei kokeita tällä viikolla 👍</p>
        ${
          weekData.nextExam
            ? `<p class="home-week-empty-sub">Seuraava tiedossa oleva koe: <strong>${escapeHtml(weekData.nextExam.groupCode)}</strong> (${formatDisplayDate(weekData.nextExam.date)})</p>`
            : ""
        }
      </div>
    `;
  }

  let exceptionsHtml = "";
  if (weekData.exceptions.length > 0) {
    exceptionsHtml = `
      <ul class="home-week-event-list">
        ${weekData.exceptions
          .map((item) => `
            <li class="home-week-event-item">
              <div class="home-week-event-top">
                <span class="home-week-groups-badge">${escapeHtml(item.groups.join(", "))}</span>
                <span class="home-week-event-date">${formatDisplayDate(item.date)}</span>
              </div>
              <div class="home-week-event-desc">
                <strong>${escapeHtml(item.type)}</strong>${item.description ? `: ${escapeHtml(item.description)}` : ""}
              </div>
            </li>
          `)
          .join("")}
      </ul>
    `;
  } else {
    exceptionsHtml = `
      <div class="home-week-empty-notice">
        <p class="home-week-empty-main">Normaali kouluviikko ✨</p>
        <p class="home-week-empty-sub">Ei poikkeusohjelmaa ryhmillä tällä viikolla.</p>
      </div>
    `;
  }

  return `
    <section class="home-week-card" id="home-block-weekInfo">
      <div class="home-week-header">
        <div class="home-week-date-group">
          <div class="home-week-badge-line">
            <span class="home-week-badge">📅 VIIKKO ${weekData.weekNum}</span>
            <span class="home-week-range">${formatDateRange(weekData.startIso, weekData.endIso)}</span>
          </div>
          <h3 class="home-week-day-title">${escapeHtml(headerDateStr)}</h3>
        </div>
        <div class="home-week-weather" id="home-week-weather"></div>
      </div>

      <div class="home-week-grid">
        <div class="home-week-item-card">
          <div class="home-week-item-header">
            <span class="home-week-item-icon" aria-hidden="true">📝</span>
            <h4 class="home-week-item-title">Kokeet tällä viikolla</h4>
          </div>
          <div class="home-week-item-body">
            ${examsHtml}
          </div>
        </div>

        <div class="home-week-item-card">
          <div class="home-week-item-header">
            <span class="home-week-item-icon" aria-hidden="true">📌</span>
            <h4 class="home-week-item-title">Muu poikkeusohjelma</h4>
          </div>
          <div class="home-week-item-body">
            ${exceptionsHtml}
          </div>
        </div>
      </div>

      <div class="home-week-fact-card">
        <div class="home-week-fact-header">
          <span class="home-week-fact-icon" aria-hidden="true">💡</span>
          <span class="home-week-fact-tag">Tiedefakta · Viikko ${weekData.weekNum}</span>
        </div>
        <div class="home-week-fact-body">
          <p class="home-week-fact-p">
            ${escapeHtml(weekData.fact.text)}
            ${
              weekData.fact.url
                ? `<a href="${escapeHtml(weekData.fact.url)}" target="_blank" rel="noopener noreferrer" class="home-week-fact-link">${escapeHtml(weekData.fact.linkText || "Lue lisää")} ↗</a>`
                : ""
            }
          </p>
        </div>
      </div>

      <div class="home-week-nav-bar">
        <button type="button" class="home-week-nav-btn" id="home-week-prev-btn" title="Edellinen viikko">
          ← Edellinen viikko
        </button>
        <button type="button" class="home-week-nav-btn home-week-today-btn ${isCurrentWeek ? "active" : ""}" id="home-week-today-btn">
          ${isCurrentWeek ? "● Kuluva viikko" : "Palaa tähän viikkoon"}
        </button>
        <button type="button" class="home-week-nav-btn" id="home-week-next-btn" title="Seuraava viikko">
          Seuraava viikko →
        </button>
      </div>
    </section>
  `;
}

function setupHomeWeekCardEvents() {
  const prevBtn = document.querySelector("#home-week-prev-btn");
  const nextBtn = document.querySelector("#home-week-next-btn");
  const todayBtn = document.querySelector("#home-week-today-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      state.homeWeekOffset--;
      renderHome();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      state.homeWeekOffset++;
      renderHome();
    });
  }
  if (todayBtn) {
    todayBtn.addEventListener("click", () => {
      state.homeWeekOffset = 0;
      renderHome();
    });
  }
}

function renderHome() {
  renderSidebarFavorites();
  updateFavoriteToggleBtn();

  const container = document.querySelector("#home-blocks-container");
  if (!container) return;

  const enabledBlocks = (state.homeConfig.blocks || []).filter((b) => b.enabled);
  if (enabledBlocks.length === 0) {
    container.innerHTML = `
      <div class="empty home-empty-state">
        <p style="font-size: 1.05rem; margin-bottom: 6px;"><strong>Kaikki kotinäkymän osiot on piilotettu</strong></p>
        <p style="margin: 0;">Voit aktivoida osioita (Tervetuloteksti, Viikon infokortti) sivuston asetuksista yläpalkin ⚙️-valikosta.</p>
      </div>
    `;
    return;
  }

  let html = "";
  enabledBlocks.forEach((block) => {
    if (block.id === "welcome") {
      html += `
        <section class="home-welcome-card" id="home-block-welcome">
          <div class="home-welcome-top-row">
            <span class="home-welcome-badge">Pasilan peruskoulu · Rauhala</span>
          </div>
          <h2 class="home-welcome-title">Tervetuloa kurssisivustolle!</h2>
          <p class="home-welcome-tagline">Matematiikkaa ja fysiikkaa mitä parhaimmassa seurassa.</p>
          <div class="home-welcome-body">
            <p>
              Tämä on kurssisivusto, jolta löydät oppituntien ydinteoriat, syventävät fysiikan ja matematiikan teemat, interaktiiviset simulaatiot, Avoin matematiikka -oppikirjat sekä kokeiden kertaustehtävät malliratkaisuineen.
            </p>
          </div>
        </section>
      `;
    } else if (block.id === "weekInfo") {
      html += renderHomeWeekInfoCardHtml();
    }
  });

  container.innerHTML = html;

  if (enabledBlocks.some((b) => b.id === "weekInfo")) {
    setupHomeWeekCardEvents();
    loadAndRenderPasilaWeather();
  }
}

function renderSettingsHomeBlocks() {
  const container = document.querySelector("#settings-home-blocks-list");
  if (!container) return;

  const blockNames = {
    welcome: "🏠 Tervetuloteksti",
    weekInfo: "ℹ️ Viikon infokortti"
  };

  container.innerHTML = state.homeConfig.blocks
    .map((block, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === state.homeConfig.blocks.length - 1;
      const label = blockNames[block.id] || block.title || block.id;

      return `
        <div class="settings-home-block-item" data-block-id="${escapeHtml(block.id)}">
          <label class="settings-home-block-left">
            <input type="checkbox" class="settings-checkbox block-toggle" data-block-id="${escapeHtml(block.id)}" ${block.enabled ? "checked" : ""}>
            <span class="settings-home-block-label">${escapeHtml(label)}</span>
          </label>
          <div class="settings-reorder-btns">
            <button type="button" class="settings-reorder-btn btn-block-up" data-index="${idx}" ${isFirst ? "disabled" : ""} title="Siirrä ylemmäs">▲</button>
            <button type="button" class="settings-reorder-btn btn-block-down" data-index="${idx}" ${isLast ? "disabled" : ""} title="Siirrä alemmas">▼</button>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".block-toggle").forEach((chk) => {
    chk.addEventListener("change", () => {
      const bId = chk.dataset.blockId;
      const blk = state.homeConfig.blocks.find((b) => b.id === bId);
      if (blk) {
        blk.enabled = chk.checked;
        savePreferences();
        updateSettingsSummaryBadges();
        if (state.activeView === "home") renderHome();
      }
    });
  });

  container.querySelectorAll(".btn-block-up").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      if (idx > 0) {
        const item = state.homeConfig.blocks.splice(idx, 1)[0];
        state.homeConfig.blocks.splice(idx - 1, 0, item);
        savePreferences();
        renderSettingsHomeBlocks();
        if (state.activeView === "home") renderHome();
      }
    });
  });

  container.querySelectorAll(".btn-block-down").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      if (idx < state.homeConfig.blocks.length - 1) {
        const item = state.homeConfig.blocks.splice(idx, 1)[0];
        state.homeConfig.blocks.splice(idx + 1, 0, item);
        savePreferences();
        renderSettingsHomeBlocks();
        if (state.activeView === "home") renderHome();
      }
    });
  });
}

function updateSettingsSummaryBadges() {
  const badgeHome = document.querySelector("#summary-badge-home");
  if (badgeHome) {
    const enabledCount = (state.homeConfig.blocks || []).filter((b) => b.enabled).length;
    const defMeta = getFavoriteMeta(state.defaultView);
    if (state.defaultView !== "home" && defMeta) {
      badgeHome.textContent = `Aloitus: ${defMeta.title}`;
    } else {
      badgeHome.textContent = `Kotinäkymä (${enabledCount}/2 osiota)`;
    }
  }

  const badgeFavs = document.querySelector("#summary-badge-favs");
  if (badgeFavs) {
    badgeFavs.textContent = `${state.favorites.length} kpl tallennettu`;
  }

  const badgeTheme = document.querySelector("#summary-badge-theme");
  if (badgeTheme) {
    badgeTheme.textContent =
      state.theme === "system" ? "💻 Järjestelmä" : state.theme === "light" ? "☀️ Vaalea" : "🌙 Tumma";
  }

  const badgeDates = document.querySelector("#summary-badge-dates");
  if (badgeDates) {
    badgeDates.textContent = state.autoDateLesson ? "📅 Päällä" : "Poissa käytöstä";
  }

  const badgeMobile = document.querySelector("#summary-badge-mobile");
  if (badgeMobile) {
    badgeMobile.textContent = "Koti keskellä";
  }
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
        updateSettingsSummaryBadges();
      });
    });
  }

  // 1b. Kotinäkymän osioiden valinta & järjestys
  renderSettingsHomeBlocks();

  // 1c. Mobiilin alapalkin järjestely
  renderMobileNavSlotsList();

  // 1d. Asetuskorttien avaustila
  renderSettingsAccordionModeBtns();

  // 2. Suosikkien pikalisäysalasvetovalikko (#settings-quick-add-select & #btn-quick-add-fav)
  const quickAddSelect = document.querySelector("#settings-quick-add-select");
  const btnQuickAddFav = document.querySelector("#btn-quick-add-fav");

  if (quickAddSelect) {
    const groups = getAllScheduleGroups();
    const optGroups = [];

    if (groups.length > 0) {
      optGroups.push(`
        <optgroup label="👥 Opetusryhmät (2. jakso)">
          ${groups.map((g) => `<option value="${escapeHtml(g.groupCode)}">Ryhmä ${escapeHtml(g.groupCode)} (${escapeHtml(g.courseCode)})</option>`).join("")}
        </optgroup>
      `);
    }

    if (state.courses?.length > 0) {
      optGroups.push(`
        <optgroup label="📚 Kurssit">
          ${state.courses.map((c) => `<option value="${escapeHtml(c.code)}">${c.subject === "fysiikka" ? "⚡" : "📐"} ${escapeHtml(c.code)}: ${escapeHtml(c.title)}</option>`).join("")}
        </optgroup>
      `);
    }

    optGroups.push(`
      <optgroup label="📌 Osio-sivut">
        <option value="kirjat">📚 Avoin matematiikka -kirjat</option>
        <option value="kertaus">📝 Kertaustehtävät & mallit</option>
        <option value="arviointi">ℹ️ Arviointiperusteet & info</option>
      </optgroup>
    `);

    quickAddSelect.innerHTML = optGroups.join("");
  }

  if (btnQuickAddFav && !btnQuickAddFav._hasListener) {
    btnQuickAddFav._hasListener = true;
    btnQuickAddFav.addEventListener("click", () => {
      if (!quickAddSelect) return;
      const selectedKey = quickAddSelect.value;
      if (!selectedKey) return;

      if (state.favorites.includes(selectedKey)) {
        showToast("⚠️ Kohde on jo suosikeissasi!");
        return;
      }

      state.favorites.push(selectedKey);
      savePreferences();
      renderSettingsPopover();
      const meta = getFavoriteMeta(selectedKey);
      showToast(`⭐ Lisätty suosikkeihin: ${meta?.title || selectedKey}!`);
    });
  }

  // 2b. Suosikkilistan järjestely & poisto (#settings-favorites-list)
  if (settingsFavoritesList) {
    if (state.favorites.length === 0) {
      settingsFavoritesList.innerHTML = `
        <p class="settings-fav-empty">
          Ei suosikkeja vielä. Voit lisätä ryhmiä, kursseja tai sivuja yllä olevasta valikosta tai tähdellä (☆).
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

  // 2c. Oletusryhmä ryhmänäkymässä kun suosikkiryhmiä on useampia kuin 1
  const defaultGroupSection = document.querySelector("#settings-default-group-section");
  const defaultGroupOptions = document.querySelector("#settings-default-group-options");

  if (defaultGroupSection && defaultGroupOptions) {
    const allGroups = getAllScheduleGroups();
    const favGroups = allGroups.filter((g) => state.favorites.includes(g.groupCode));

    if (favGroups.length > 1) {
      defaultGroupSection.hidden = false;

      // Jos oletusryhmää ei ole vielä valittu tai se ei ole enää suosikeissa, oletetaan ensimmäinen suosikkiryhmä
      if (!state.defaultScheduleGroup || !favGroups.some((g) => g.groupCode === state.defaultScheduleGroup)) {
        state.defaultScheduleGroup = favGroups[0].groupCode;
      }

      defaultGroupOptions.innerHTML = favGroups
        .map((g) => {
          const isActive = state.defaultScheduleGroup === g.groupCode;
          return `
            <button
              type="button"
              class="default-view-option-btn ${isActive ? "active" : ""}"
              data-set-default-group="${escapeHtml(g.groupCode)}"
            >
              <span class="option-check">${isActive ? "✓" : "○"}</span>
              <span class="option-label">👥 Ryhmä ${escapeHtml(g.groupCode)} (${escapeHtml(g.courseCode)})</span>
            </button>
          `;
        })
        .join("");

      defaultGroupOptions.querySelectorAll(".default-view-option-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const gCode = btn.dataset.setDefaultGroup;
          if (gCode) {
            state.defaultScheduleGroup = gCode;
            savePreferences();
            showToast(`👥 Automaattisesti keskitettäväksi ryhmäksi valittu: ${gCode}`);
            renderSettingsPopover();
          }
        });
      });
    } else {
      defaultGroupSection.hidden = true;
      if (favGroups.length === 1) {
        state.defaultScheduleGroup = favGroups[0].groupCode;
      } else {
        state.defaultScheduleGroup = null;
      }
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

  // 6. Yhteenvetobadget korttien otsikoihin
  updateSettingsSummaryBadges();
}

// --------------------------------------------------------------------------
// ASETUSVALIKON JA MOBIILIN ALAPALKIN APUFUNKTIOT
// --------------------------------------------------------------------------

function renderSettingsAccordionModeBtns() {
  const bar = document.querySelector("#settings-accordion-mode-btns");
  if (!bar) return;

  bar.querySelectorAll(".accordion-mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === state.settingsAccordionMode);
    if (!btn._hasListener) {
      btn._hasListener = true;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode;
        state.settingsAccordionMode = mode;
        try {
          localStorage.setItem("rauh_settings_accordion_mode", mode);
        } catch (err) {}
        renderSettingsAccordionModeBtns();
        applySettingsAccordionMode();
      });
    }
  });
}

function applySettingsAccordionMode() {
  const cards = document.querySelectorAll(".settings-accordion-container > .settings-card");
  if (!cards.length) return;

  if (state.settingsAccordionMode === "all") {
    cards.forEach((card) => {
      card.open = true;
    });
  } else if (state.settingsAccordionMode === "last") {
    const lastOpen = state.settingsLastOpenCards || [];
    cards.forEach((card) => {
      card.open = lastOpen.includes(card.id);
    });
  } else {
    // "closed" on oletus
    cards.forEach((card) => {
      card.open = false;
    });
  }
}

function initSettingsAccordionTracking() {
  document.querySelectorAll(".settings-accordion-container > .settings-card").forEach((card) => {
    card.addEventListener("toggle", () => {
      const openIds = Array.from(document.querySelectorAll(".settings-accordion-container > .settings-card[open]")).map((c) => c.id);
      state.settingsLastOpenCards = openIds;
      try {
        localStorage.setItem("rauh_settings_last_open", JSON.stringify(openIds));
      } catch (err) {}
    });
  });
}

function renderMobileNavSlotsList() {
  const container = document.querySelector("#mobile-nav-slots-list");
  if (!container) return;

  const slotLabels = {
    lukujarjestys: { icon: "📅", label: "Lukujärjestys" },
    ryhmat: { icon: "👥", label: "Ryhmät" },
    favorites: { icon: "⭐", label: "Suosikit" },
    settings: { icon: "⚙️", label: "Asetukset" }
  };

  const order = state.mobileNavOrder || ["lukujarjestys", "ryhmat", "favorites", "settings"];

  const renderSlotRow = (key, index, slotLabel) => {
    const item = slotLabels[key] || { icon: "📌", label: key };
    const isFirst = index === 0;
    const isLast = index === 3;

    return `
      <div class="mobile-nav-slot-row" data-key="${escapeHtml(key)}">
        <div class="mobile-nav-slot-left">
          <span class="mobile-nav-slot-badge">${slotLabel}</span>
          <span class="mobile-nav-slot-title">${item.icon} ${escapeHtml(item.label)}</span>
        </div>
        <div class="mobile-nav-slot-actions">
          <button type="button" class="mobile-nav-reorder-btn btn-nav-up" data-index="${index}" ${isFirst ? "disabled" : ""} title="Siirrä ylemmäs" aria-label="Siirrä ylemmäs">▲</button>
          <button type="button" class="mobile-nav-reorder-btn btn-nav-down" data-index="${index}" ${isLast ? "disabled" : ""} title="Siirrä alemmas" aria-label="Siirrä alemmas">▼</button>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    ${renderSlotRow(order[0], 0, "Vasen 1")}
    ${renderSlotRow(order[1], 1, "Vasen 2")}
    <div class="mobile-nav-slot-row locked-center">
      <div class="mobile-nav-slot-left">
        <span class="mobile-nav-slot-badge">Keskellä</span>
        <span class="mobile-nav-slot-title">🏠 Koti (lukittu keskelle)</span>
      </div>
      <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">🔒 Kiinteä</div>
    </div>
    ${renderSlotRow(order[2], 2, "Oikea 1")}
    ${renderSlotRow(order[3], 3, "Oikea 2")}
  `;

  container.querySelectorAll(".btn-nav-up").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      if (idx > 0) {
        const item = state.mobileNavOrder.splice(idx, 1)[0];
        state.mobileNavOrder.splice(idx - 1, 0, item);
        savePreferences();
        renderMobileNavSlotsList();
        renderMobileBottomBar();
      }
    });
  });

  container.querySelectorAll(".btn-nav-down").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      if (idx < 3) {
        const item = state.mobileNavOrder.splice(idx, 1)[0];
        state.mobileNavOrder.splice(idx + 1, 0, item);
        savePreferences();
        renderMobileNavSlotsList();
        renderMobileBottomBar();
      }
    });
  });

  const btnReset = document.querySelector("#btn-reset-mobile-nav");
  if (btnReset && !btnReset._hasListener) {
    btnReset._hasListener = true;
    btnReset.addEventListener("click", (e) => {
      e.stopPropagation();
      state.mobileNavOrder = ["lukujarjestys", "ryhmat", "favorites", "settings"];
      savePreferences();
      renderMobileNavSlotsList();
      renderMobileBottomBar();
      showToast("Palautettu mobiilipalkin oletusjärjestys!");
    });
  }
}

function renderMobileBottomBar() {
  const bar = document.querySelector("#mobile-bottom-bar");
  if (!bar) return;

  const order = state.mobileNavOrder || ["lukujarjestys", "ryhmat", "favorites", "settings"];
  const leftKeys = order.slice(0, 2);
  const rightKeys = order.slice(2, 4);

  const isSheetOpen = Boolean(document.querySelector("#mobile-favorites-sheet") && !document.querySelector("#mobile-favorites-sheet").hidden);
  const isSettingsOpen = Boolean(settingsPopover && !settingsPopover.hidden);

  const getBtnHtml = (key) => {
    let icon = "📌";
    let label = key;
    let isActive = false;

    if (key === "lukujarjestys") {
      icon = "📅";
      label = "Lukujärjestys";
      isActive = state.activeView === "lukujarjestys" && !isSheetOpen && !isSettingsOpen;
    } else if (key === "ryhmat") {
      icon = "👥";
      label = "Ryhmät";
      isActive = state.activeView === "aikataulu" && !isSheetOpen && !isSettingsOpen;
    } else if (key === "favorites") {
      icon = "⭐";
      label = "Suosikit";
      isActive = isSheetOpen;
    } else if (key === "settings") {
      icon = "⚙️";
      label = "Asetukset";
      isActive = isSettingsOpen;
    }

    return `
      <button type="button" class="mobile-nav-btn ${isActive ? "active" : ""}" data-mobile-nav="${escapeHtml(key)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
        <span class="mobile-nav-icon">${icon}</span>
        <span class="mobile-nav-indicator" aria-hidden="true"></span>
      </button>
    `;
  };

  const isHomeActive = state.activeView === "home" && !isSheetOpen && !isSettingsOpen;

  const homeBtnHtml = `
    <button type="button" class="mobile-nav-btn mobile-nav-btn-home ${isHomeActive ? "active" : ""}" data-mobile-nav="koti" aria-label="Koti" title="Koti">
      <span class="mobile-nav-icon">🏠</span>
      <span class="mobile-nav-indicator" aria-hidden="true"></span>
    </button>
  `;

  bar.innerHTML = `
    ${leftKeys.map(getBtnHtml).join("")}
    ${homeBtnHtml}
    ${rightKeys.map(getBtnHtml).join("")}
  `;

  bar.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const action = btn.dataset.mobileNav;
      handleMobileNavAction(action);
    });
  });
}

function updateMobileBottomBarActive() {
  const bar = document.querySelector("#mobile-bottom-bar");
  if (!bar) return;

  const sheet = document.querySelector("#mobile-favorites-sheet");
  const isSheetOpen = sheet && !sheet.hidden;
  const isSettingsOpen = settingsPopover && !settingsPopover.hidden;

  bar.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
    const act = btn.dataset.mobileNav;
    let isActive = false;
    if (act === "koti") isActive = state.activeView === "home" && !isSheetOpen && !isSettingsOpen;
    else if (act === "lukujarjestys") isActive = state.activeView === "lukujarjestys" && !isSheetOpen && !isSettingsOpen;
    else if (act === "ryhmat") isActive = state.activeView === "aikataulu" && !isSheetOpen && !isSettingsOpen;
    else if (act === "favorites") isActive = isSheetOpen;
    else if (act === "settings") isActive = isSettingsOpen;

    btn.classList.toggle("active", isActive);
  });
}

function handleMobileNavAction(action) {
  if (action === "koti") {
    closeMobileFavoritesSheet();
    closeSettingsPopover();
    if (window.location.hash === "#/" || window.location.hash === "#/koti" || !window.location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = "#/";
    }
  } else if (action === "lukujarjestys") {
    closeMobileFavoritesSheet();
    closeSettingsPopover();
    if (window.location.hash === "#/lukujarjestys") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = "#/lukujarjestys";
    }
  } else if (action === "ryhmat") {
    closeMobileFavoritesSheet();
    closeSettingsPopover();
    if (window.location.hash === "#/ryhmat" || window.location.hash === "#/aikataulu") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = "#/ryhmat";
    }
  } else if (action === "favorites") {
    closeSettingsPopover();
    toggleMobileFavoritesSheet();
  } else if (action === "settings") {
    closeMobileFavoritesSheet();
    toggleSettingsPopover();
  }
}

function openMobileFavoritesSheet() {
  const sheet = document.querySelector("#mobile-favorites-sheet");
  if (!sheet) return;
  closeSettingsPopover();
  closeMobileMenu();
  sheet.hidden = false;
  sheet.setAttribute("aria-hidden", "false");
  renderMobileFavoritesSheet();
  updateMobileBottomBarActive();
  sheet.scrollTop = 0;
  requestAnimationFrame(() => {
    try {
      sheet.focus({ preventScroll: true });
    } catch (e) {}
  });
}

function closeMobileFavoritesSheet() {
  const sheet = document.querySelector("#mobile-favorites-sheet");
  if (!sheet) return;
  sheet.hidden = true;
  sheet.setAttribute("aria-hidden", "true");
  updateMobileBottomBarActive();
}

function toggleMobileFavoritesSheet() {
  const sheet = document.querySelector("#mobile-favorites-sheet");
  if (!sheet) return;
  if (sheet.hidden) {
    openMobileFavoritesSheet();
  } else {
    closeMobileFavoritesSheet();
  }
}

function renderMobileFavoritesSheet() {
  const body = document.querySelector("#mobile-sheet-body");
  if (!body) return;

  if (state.favorites.length > 0) {
    const favItemsHtml = state.favorites
      .map((key) => {
        const meta = getFavoriteMeta(key);
        if (!meta) return "";
        return `
          <a href="${meta.hash}" class="mobile-sheet-fav-row" data-fav-key="${escapeHtml(key)}">
            <div class="mobile-sheet-fav-left">
              <span class="mobile-sheet-fav-icon">${meta.icon}</span>
              <div class="mobile-sheet-fav-text">
                <span class="mobile-sheet-fav-title">${escapeHtml(meta.title)}</span>
                ${meta.key ? `<span class="mobile-sheet-fav-sub">${escapeHtml(meta.key)}</span>` : ""}
              </div>
            </div>
            <span class="mobile-sheet-fav-arrow" aria-hidden="true">→</span>
          </a>
        `;
      })
      .join("");

    body.innerHTML = `
      <div class="mobile-sheet-section">
        <div class="mobile-sheet-section-title">⭐ Omat suosikit (${state.favorites.length})</div>
        <div class="mobile-sheet-favs-list">
          ${favItemsHtml}
        </div>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="mobile-sheet-section" style="text-align: center; padding: 24px 12px;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">⭐</div>
        <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; color: var(--color-heading);">Ei vielä suosikkeja</h4>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0 0 16px 0; line-height: 1.45;">
          Voit lisätä opetusryhmiä, kursseja tai sivuja suosikkeihisi tähtipainikkeella (☆) tai asetusvalikosta.
        </p>
        <button type="button" class="rev-btn rev-btn-tasks" id="btn-open-settings-from-sheet" style="font-size: 0.84rem; padding: 8px 16px; margin: 0 auto;">
          ⚙️ Hallitse suosikkeja asetuksissa
        </button>
      </div>
    `;

    const btnOpenSettings = body.querySelector("#btn-open-settings-from-sheet");
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileFavoritesSheet();
        openSettingsPopover();
        const favCard = document.querySelector("#card-setting-favs");
        if (favCard) favCard.open = true;
      });
    }
  }

  body.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileFavoritesSheet();
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
  updateLessonPortalCheckButton();

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

function updateLessonPortalCheckButton() {
  const btn = document.querySelector("#lesson-portal-check-btn");
  if (!btn) return;
  const courseCode = state.activeCourse?.code;
  if (!courseCode) {
    btn.classList.add("disabled");
    btn.removeAttribute("href");
    return;
  }

  const courseSched = state.schedules?.[courseCode];
  const groupKeys = Object.keys(courseSched?.groups || {});

  if (!courseSched || groupKeys.length === 0) {
    btn.classList.add("disabled");
    btn.removeAttribute("href");
    btn.innerHTML = `👥 Kurssi ei opetuksessa 2. jaksossa`;
    btn.title = `Tälle kurssille (${courseCode}) ei ole aktiivista opetusryhmää 2. jaksossa.`;
    return;
  }

  // Tarkistetaan onko käyttäjällä jokin ryhmistä suosikeissa
  const favGroup = groupKeys.find((gk) => state.favorites.includes(gk));

  if (favGroup) {
    btn.classList.remove("disabled");
    btn.href = `#/aikataulu/${encodeURIComponent(favGroup)}`;
    btn.innerHTML = `Tarkista ryhmän <strong>${escapeHtml(favGroup)}</strong> aikataulu 👥 →`;
    btn.title = `Avaa suosikkiryhmäsi ${favGroup} aikataulu`;
  } else if (groupKeys.length === 1) {
    const onlyGroup = groupKeys[0];
    btn.classList.remove("disabled");
    btn.href = `#/aikataulu/${encodeURIComponent(onlyGroup)}`;
    btn.innerHTML = `Tarkista ryhmän <strong>${escapeHtml(onlyGroup)}</strong> aikataulu 👥 →`;
    btn.title = `Avaa ryhmän ${onlyGroup} aikataulu`;
  } else {
    // Useita ryhmiä eikä mikään suosikkina
    btn.classList.remove("disabled");
    btn.href = `#/aikataulu/${encodeURIComponent(groupKeys[0])}`;
    btn.innerHTML = `Tarkista ryhmäsi aikataulu (${groupKeys.join(" / ")}) 👥 →`;
    btn.title = `Kurssilla on useita ryhmiä (${groupKeys.join(", ")}). Voit lisätä oman ryhmäsi suosikiksi!`;
  }
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
          <span class="num grade-${b.grade}">${b.grade}. lk</span>
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
      <div class="book-card grade-${b.grade}" id="book-card-${b.id}">
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
          <span class="num grade-${r.grade}">${r.code}</span>
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
          highlightCard(card);
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
        <div class="revision-card grade-${r.grade}" id="rev-card-${r.code}">
          <div class="revision-card-header">
            <div>
              <span class="revision-course-badge grade-${r.grade}">${r.grade}. luokka · ${r.subject}</span>
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
  backToTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("is-visible", window.scrollY > 280);
  }, { passive: true });
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

// Käynnistetään sovellus poistettu tästä ja siirretty tiedoston loppuun


// ==========================================================================
// INTEGRAATIO: LUKUJÄRJESTYS, RYHMIEN AIKATAULUT JA SIJAISTOIMINNOT
// ==========================================================================

const weekdayNames = [
  "Sunnuntai",
  "Maanantai",
  "Tiistai",
  "Keskiviikko",
  "Torstai",
  "Perjantai",
  "Lauantai"
];

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

function formatDisplayDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return `${weekdayNames[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.`;
}

function formatShortDate(value) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  return `${date.getDate()}.${date.getMonth() + 1}.`;
}

function formatEmailDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return `${weekdayNames[date.getDay()]} ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

function formatDateRange(start, end) {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  return `${startDate.getDate()}.${startDate.getMonth() + 1}.–${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}`;
}

function getMonday(date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  const day = monday.getDay();
  const difference = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + difference);
  return monday;
}

function getTimetableReferenceDate() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return getMonday(today);
}

function getDateForWeekday(referenceMonday, weekdayKey) {
  const weekdayNumbers = {
    maanantai: 1,
    tiistai: 2,
    keskiviikko: 3,
    torstai: 4,
    perjantai: 5
  };
  const date = new Date(referenceMonday);
  date.setHours(12, 0, 0, 0);
  const weekdayNumber = weekdayNumbers[weekdayKey];
  if (!weekdayNumber) return date;
  date.setDate(date.getDate() + (weekdayNumber - 1));
  return date;
}

function minutesFromStart(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes - (8 * 60 + 30);
}

function minutesBetween(start, end) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return toMinutes(end) - toMinutes(start);
}

function getDatesBetween(start, end) {
  const dates = [];
  const current = new Date(`${start}T12:00:00`);
  const stop = new Date(`${end}T12:00:00`);
  while (current <= stop) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getLessonDate(lessonNumber, schedule) {
  if (!schedule || !schedule.startDate || !schedule.endDate || !Array.isArray(schedule.weekdays)) return null;
  const startDate = new Date(`${schedule.startDate}T12:00:00`);
  const endDate = new Date(`${schedule.endDate}T12:00:00`);
  let current = new Date(startDate);
  let lessonsFound = 0;

  while (current <= endDate) {
    const isoDate = formatDate(current);
    if (schedule.weekdays.includes(current.getDay())) {
      const isException = (schedule.exceptions || []).some((item) => item.date === isoDate);
      if (!isException) {
        lessonsFound++;
        if (lessonsFound === lessonNumber) {
          return isoDate;
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}

function getLessonNumberForDate(schedule, targetDate = new Date()) {
  if (!schedule || !schedule.startDate || !schedule.endDate || !Array.isArray(schedule.weekdays)) {
    return { lesson: 1, exact: false, date: null };
  }
  const startDate = new Date(`${schedule.startDate}T12:00:00`);
  const endDate = new Date(`${schedule.endDate}T12:00:00`);
  let current = new Date(startDate);
  let lessonsFound = 0;
  const lessons = [];

  while (current <= endDate) {
    const isoDate = formatDate(current);
    if (schedule.weekdays.includes(current.getDay())) {
      const isException = (schedule.exceptions || []).some((item) => item.date === isoDate);
      if (!isException) {
        lessonsFound++;
        lessons.push({ lesson: lessonsFound, date: isoDate });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  const targetIso = formatDate(targetDate);
  const exact = lessons.find((l) => l.date === targetIso);
  if (exact) {
    return { lesson: exact.lesson, exact: true, date: exact.date };
  }

  const upcoming = lessons.find((l) => l.date > targetIso);
  if (upcoming) {
    return { lesson: upcoming.lesson, exact: false, date: upcoming.date };
  }

  if (lessons.length > 0) {
    return { lesson: lessons[lessons.length - 1].lesson, exact: false, date: lessons[lessons.length - 1].date };
  }

  return { lesson: 1, exact: false, date: null };
}

function getAutoLessonForCourse(courseCode) {
  if (!courseCode || !state.schedules) return null;
  const upper = courseCode.toUpperCase();
  const courseSched = state.schedules[upper];
  if (!courseSched || !courseSched.groups) return null;

  const groupKeys = Object.keys(courseSched.groups);
  if (groupKeys.length === 0) return null;

  // 1. Suosikkiryhmä
  let targetGroup = groupKeys.find((gk) => state.favorites.includes(gk));

  // 2. Vain 1 ryhmä kurssilla
  if (!targetGroup && groupKeys.length === 1) {
    targetGroup = groupKeys[0];
  }

  // 3. Fallback
  if (!targetGroup) {
    targetGroup = groupKeys[0];
  }

  const groupSched = courseSched.groups[targetGroup];
  if (!groupSched) return null;

  const dateResult = getLessonNumberForDate(groupSched, new Date());
  return {
    groupCode: targetGroup,
    lesson: dateResult.lesson,
    date: dateResult.date,
    exact: dateResult.exact
  };
}

// Kurssidatan lataus välimuistilla
async function getCourseData(courseCode) {
  const code = courseCode.toUpperCase();
  if (state._courseDataMap[code]) {
    return state._courseDataMap[code];
  }
  const res = await fetch(`src/data/courses/${code.toLowerCase()}.json`);
  if (!res.ok) {
    throw new Error(`Kurssin ${code} lataaminen epäonnistui.`);
  }
  const data = await res.json();
  state._courseDataMap[code] = data;
  return data;
}

// --------------------------------------------------------------------------
// 1. LUKUJÄRJESTYS
// --------------------------------------------------------------------------

function renderTimetableGrid(container) {
  if (!container || !state.timetable) {
    if (container) container.innerHTML = '<div class="empty">Lukujärjestystä ei löytynyt.</div>';
    return;
  }

  const dayNames = {
    maanantai: "Maanantai",
    tiistai: "Tiistai",
    keskiviikko: "Keskiviikko",
    torstai: "Torstai",
    perjantai: "Perjantai"
  };

  const days = Object.entries(state.timetable.paivat || {});
  const referenceMonday = getTimetableReferenceDate();

  container.innerHTML = `
    <p class="schedule-period">
      ${escapeHtml(state.timetable.jakso)}. jakso ·
      vko ${getWeekNumber(referenceMonday)} ·
      ${formatShortDate(referenceMonday)}–${formatShortDate(
        getDateForWeekday(referenceMonday, "perjantai")
      )}
    </p>

    <div class="schedule-grid">
      ${days.map(([key, day]) => {
        const date = getDateForWeekday(referenceMonday, key);
        const isToday = formatDate(date) === formatDate(new Date());

        return `
          <article class="schedule-day ${isToday ? "is-today" : ""}">
            <header class="schedule-day-header">
              <h3>${dayNames[key] || escapeHtml(key)} ${formatShortDate(date)}${isToday ? " · Tänään" : ""}</h3>
            </header>

            <div class="schedule-events">
              <div class="schedule-timeline">
                ${(day.tapahtumat || []).map(renderScheduleEvent).join("")}
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderTimetable() {
  renderTimetableGrid(scheduleContent);
}

function getGradeClassFromGroup(code) {
  if (!code) return "";
  const match = code.match(/[A-Za-z]+_(\d)/) || code.match(/(\d)/);
  if (!match) return "";
  const d = match[1];
  if (d === "7") return "grade-7";
  if (d === "8") return "grade-8";
  if (d === "9") return "grade-9";
  return "grade-other";
}

function renderScheduleEvent(event) {
  const top = minutesFromStart(event.alku);
  const height = minutesBetween(event.alku, event.loppu);

  if (event.tyyppi === "valvonta") {
    const location = event.paikka || "Valvonta";
    return `
      <div class="schedule-event supervision" style="--event-top: ${top}px; --event-height: ${height}px;" title="Valvonta (${event.alku}–${event.loppu}): ${escapeHtml(location)}">
        <div class="schedule-event-content">
          <strong>${escapeHtml(location)}</strong>
        </div>
      </div>
    `;
  }

  if (event.tyyppi === "kotiryhma") {
    return `
      <div class="schedule-event homeroom" style="--event-top: ${top}px; --event-height: ${height}px;" title="Kotiryhmä (${event.alku}–${event.loppu})">
        <div class="schedule-time">${event.alku}–${event.loppu}</div>
        <div class="schedule-event-content">
          <strong>${escapeHtml(event.ryhma || "Kotiryhmätunti")}</strong>
          <span>Kotiryhmä</span>
        </div>
      </div>
    `;
  }

  const groupCode = event.ryhma || "";
  const gradeClass = getGradeClassFromGroup(groupCode);
  return `
    <a href="#/aikataulu/${encodeURIComponent(groupCode)}" class="schedule-event ${gradeClass}" style="--event-top: ${top}px; --event-height: ${height}px;" title="Avaa ryhmän ${escapeHtml(groupCode)} aikataulu">
      <div class="schedule-time">${event.alku}–${event.loppu}</div>
      <div class="schedule-event-content">
        <strong>${escapeHtml(groupCode)}</strong>
        <span>${escapeHtml(event.tila || "")}</span>
      </div>
    </a>
  `;
}

// --------------------------------------------------------------------------
// 2. RYHMIEN AIKATAULUT (AIKATAULU-NÄKYMÄ)
// --------------------------------------------------------------------------

function getAllScheduleGroups() {
  if (!state.schedules) return [];
  const groups = [];
  Object.entries(state.schedules).forEach(([courseCode, courseSched]) => {
    Object.keys(courseSched.groups || {}).forEach((groupCode) => {
      groups.push({
        courseCode,
        groupCode,
        schedule: courseSched.groups[groupCode]
      });
    });
  });
  groups.sort((a, b) => a.groupCode.localeCompare(b.groupCode));
  return groups;
}

function renderAikatauluGroupPills(groups) {
  const pillHtml = groups
    .map((g) => {
      const isActive = g.groupCode === state.activeScheduleGroup;
      return `
        <button type="button" class="aikataulu-group-btn ${isActive ? "active" : ""}" data-group="${escapeHtml(g.groupCode)}">
          ${escapeHtml(g.groupCode)}
        </button>
      `;
    })
    .join("");

  if (aikatauluGroupPills) {
    aikatauluGroupPills.innerHTML = pillHtml;
    aikatauluGroupPills.querySelectorAll(".aikataulu-group-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectScheduleGroup(btn.dataset.group);
      });
    });
  }

  if (sidebarAikatauluGroupPills) {
    sidebarAikatauluGroupPills.innerHTML = pillHtml;
    sidebarAikatauluGroupPills.querySelectorAll(".aikataulu-group-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectScheduleGroup(btn.dataset.group);
      });
    });
  }
}

function updateCurrentGroupFavoriteButton() {
  const btn = document.querySelector("#fav-btn-current-group");
  const starLabel = document.querySelector("#fav-group-star-label");
  if (!btn) return;
  const currentGroup = state.activeScheduleGroup;
  if (!currentGroup) {
    btn.hidden = true;
    return;
  }
  btn.hidden = false;
  const isFav = state.favorites.includes(currentGroup);
  btn.classList.toggle("is-favorite", isFav);
  btn.setAttribute("aria-pressed", isFav ? "true" : "false");
  const starIcon = btn.querySelector(".star-icon");
  if (starIcon) starIcon.textContent = isFav ? "★" : "☆";
  if (starLabel) {
    starLabel.textContent = isFav ? "Suosikeissa" : "Lisää suosikkeihin";
  }
  btn.title = isFav ? "Poista suosikeista" : "Lisää suosikkeihin";
}

async function selectScheduleGroup(groupCode) {
  state.activeScheduleGroup = groupCode;
  window.location.hash = `#/aikataulu/${groupCode}`;
  await renderAikataulu();
}

async function renderAikataulu() {
  const groups = getAllScheduleGroups();
  if (!groups.length) {
    if (aikatauluLessonsList) {
      aikatauluLessonsList.innerHTML = '<div class="empty">Ei aktiivisia opetusryhmiä tässä jaksossa.</div>';
    }
    return;
  }

  const favGroups = groups.filter((g) => state.favorites.includes(g.groupCode));

  if (!state.activeScheduleGroup) {
    if (favGroups.length > 0) {
      const pref = favGroups.find((g) => g.groupCode === state.defaultScheduleGroup);
      state.activeScheduleGroup = pref ? pref.groupCode : favGroups[0].groupCode;
    }
  } else if (!groups.some((g) => g.groupCode === state.activeScheduleGroup)) {
    if (favGroups.length > 0) {
      const pref = favGroups.find((g) => g.groupCode === state.defaultScheduleGroup);
      state.activeScheduleGroup = pref ? pref.groupCode : favGroups[0].groupCode;
    } else {
      state.activeScheduleGroup = null;
    }
  }

  renderAikatauluGroupPills(groups);
  updateCurrentGroupFavoriteButton();

  if (!state.activeScheduleGroup) {
    if (aikatauluLessonsList) {
      aikatauluLessonsList.innerHTML = `
        <div class="aikataulu-unselected-box">
          <div style="font-size: 2.5rem; margin-bottom: 12px;" aria-hidden="true">👥</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0 0 8px 0; color: var(--color-heading);">Valitse opetusryhmä</h3>
          <p style="font-size: 0.92rem; color: var(--color-text-muted); max-width: 440px; margin: 0 auto 16px auto; line-height: 1.5;">
            Valitse ryhmä yläpuolelta nähdäksesi sen tuntiaikataulun, päivämäärät ja tehtävät.
          </p>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin: 0;">
            💡 <em>Vinkki: Voit lisätä oman ryhmäsi suosikkeihin tähdellä (☆), jolloin ryhmänäkymä avaa ja keskittää sen automaattisesti!</em>
          </p>
        </div>
      `;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const currentGroupObj = groups.find((g) => g.groupCode === state.activeScheduleGroup);
  if (!currentGroupObj) return;

  const { courseCode, schedule } = currentGroupObj;

  if (aikatauluLessonsList) {
    aikatauluLessonsList.innerHTML = '<div class="empty">Ladataan ryhmän tuntiaikataulua…</div>';
  }

  try {
    const courseData = await getCourseData(courseCode);
    const lessons = courseData.lessons || [];
    const exceptions = schedule.exceptions || [];
    const events = [];

    lessons.forEach((lesson) => {
      const date = getLessonDate(lesson.lesson, schedule);
      if (date) {
        events.push({
          date,
          lesson,
          exception: null
        });
      }
    });

    exceptions.forEach((exception) => {
      events.push({
        date: exception.date,
        lesson: null,
        exception
      });
    });

    events.sort((a, b) => a.date.localeCompare(b.date));

    if (!events.length) {
      aikatauluLessonsList.innerHTML = '<div class="empty">Tälle ryhmälle ei löytynyt aikataulutettuja oppitunteja.</div>';
      return;
    }

    aikatauluLessonsList.innerHTML = events
      .map((event) => {
        if (event.exception) {
          return `
            <article class="lesson-card exception-card" data-date="${event.date}">
              <div class="lesson-header">
                <div>
                  <p class="lesson-number">Poikkeusohjelmaa</p>
                  <p class="lesson-date">${formatDisplayDate(event.date)}</p>
                  <div class="exception-box">
                    <strong>${escapeHtml(event.exception.type)}</strong>
                  </div>
                  <p class="lesson-card-body-text">${escapeHtml(event.exception.description)}</p>
                </div>
              </div>
            </article>
          `;
        }

        const lesson = event.lesson;
        const lessonNum = lesson.lesson;

        // Renderöidään tehtävät (taskSheets ja tasks)
        let tasksHtml = "";
        const taskDefs = [
          { key: "research", label: "Tutkimus", className: "research" },
          { key: "theory", label: "Työkirja", className: "theory" },
          { key: "warmup", label: "Yhteiset", className: "warmup" },
          { key: "blue", label: "Siniset", className: "blue" },
          { key: "red", label: "Punaiset", className: "red" }
        ];

        let rows = "";
        if (lesson.tasks && typeof lesson.tasks === "object") {
          rows = taskDefs
            .filter((def) => lesson.tasks[def.key] && lesson.tasks[def.key].trim() !== "")
            .map((def) => `
              <div class="task-card-row">
                <span class="task-badge ${def.className}">${def.label}</span>
                <span class="task-desc">${escapeHtml(lesson.tasks[def.key])}</span>
              </div>
            `)
            .join("");
        }

        let sheetsHtml = "";
        const sheets = Array.isArray(lesson.taskSheets) ? lesson.taskSheets : (lesson.taskSheets ? [lesson.taskSheets] : []);
        if (sheets.length > 0) {
          sheetsHtml = `
            <div class="lesson-task-sheets-container" style="margin-top: 8px;">
              ${sheets
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
                        <button type="button" class="rev-btn rev-btn-tasks aikataulu-task-pdf-btn" data-url="${escapeHtml(sheet.pdf)}" data-title="${escapeHtml(sheet.title)}">
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
          tasksHtml = `
            <div class="tasks" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--color-border);">
              <h4 style="margin: 0 0 8px; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Oppitunnin tehtävät</h4>
              <div class="task-cards-grid">${rows}</div>
              ${sheetsHtml}
            </div>
          `;
        }

        return `
          <article class="lesson-card" data-date="${event.date}">
            <div class="lesson-header">
              <div class="lesson-card-header-row">
                <div>
                  <p class="lesson-number">Oppitunti #${lessonNum}</p>
                  <p class="lesson-date">${formatDisplayDate(event.date)}</p>
                </div>
                <a href="#/${courseCode}/${lessonNum}" class="lesson-open-link-btn" title="Siirry oppitunnin sivulle">
                  <span>Oppitunnille</span>
                  <span>→</span>
                </a>
              </div>
              <h3 class="lesson-card-title">${escapeHtml(lesson.topic || lesson.title)}</h3>
            </div>

            ${lesson.content ? `<div class="lesson-card-body-text">${lesson.content}</div>` : ""}

            ${tasksHtml}

            ${
              lesson.substituteNote
                ? `
                  <div class="substitute-box">
                    <strong>Sijaiselle</strong>
                    <p>${escapeHtml(lesson.substituteNote)}</p>
                  </div>
                `
                : ""
            }
          </article>
        `;
      })
      .join("");

    // Kytketään PDF-napit avaamaan modaali
    aikatauluLessonsList.querySelectorAll(".aikataulu-task-pdf-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLessonTaskViewer(btn.dataset.title, btn.dataset.url);
      });
    });

    highlightCurrentLesson(true);
  } catch (err) {
    console.error("Aikataulun latausvirhe:", err);
    if (aikatauluLessonsList) {
      aikatauluLessonsList.innerHTML = `<div class="empty">Virhe ryhmän aikataulun lataamisessa: ${escapeHtml(err.message)}</div>`;
    }
  }
}

function highlightCurrentLesson(scrollIntoView = true) {
  const today = formatDate(new Date());
  const cards = Array.from(document.querySelectorAll("#aikataulu-lessons-list .lesson-card"));
  if (!cards.length) return;

  cards.forEach((card) => card.classList.remove("current-lesson"));

  let currentCard = cards.find((card) => card.dataset.date >= today);
  if (!currentCard && cards.length > 0) {
    currentCard = cards[cards.length - 1];
  }

  if (currentCard) {
    currentCard.classList.add("current-lesson");
    if (scrollIntoView) {
      setTimeout(() => {
        currentCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }
}

// --------------------------------------------------------------------------
// 3. SIJAISEN MUISTILISTA
// --------------------------------------------------------------------------

function renderSubstituteGuide() {
  if (!substituteContent) return;

  substituteContent.innerHTML = `
    <div class="guide-content">
      <h3>Oppimateriaalit</h3>
      <p>Löydät esimerkiksi opettajan oppaat ja muun tarpeellisen seuraavasti:</p>
      <ul>
        <li><strong>Talon sisäiset sijaiset:</strong> Opehuone-Drive → Sijaiset JAETTU → Yläkoulu → RAUH</li>
        <li><strong>Talon ulkopuoliset sijaiset:</strong> Kirjaudu sijaisläppärillä → selaimella Google Drive → Minulle jaetut → Sijaiset JAETTU → Yläkoulu → RAUH</li>
      </ul>
      <p>Tuntien aiheet ilmoitetaan seuraavista lähteistä:</p>
      <ul>
        <li>Kurssisivusto (KS)</li>
        <li>Avoin matematiikka (AM), pdf-muodossa</li>
        <li>Oppikirja (esim. Kuutio X)</li>
        <li>Työkirja (vain fysiikassa, FYKE-kirjasarja)</li>
      </ul>
      <p>Kurssisivusto toimii ilman kirjautumista kaikilla laitteilla. Osoitteen löydät oppimateriaalikansiosta ja se on jaettu myös oppilaille.</p>

      <h3>Oppilaiden tuntitehtävät</h3>
      <p>Oppilaiden tuntitehtävissä on eri tyyppejä ja vaikeustasoja.</p>

      <h4>MATEMATIIKKA</h4>
      <ul class="task-levels">
        <li><span class="level-dot black"></span><strong>Yhteiset:</strong> Kaikille pakolliset aloitustehtävät</li>
        <li><span class="level-dot blue"></span><strong>Siniset:</strong> Arvosanan 8 tasoon tähtäävät tehtävät</li>
        <li><span class="level-dot red"></span><strong>Punaiset:</strong> Arvosanojen 9 ja 10 tasoon tähtäävät tehtävät</li>
      </ul>

      <h4>FYSIIKKA</h4>
      <ul class="task-levels">
        <li><span class="level-dot green"></span><strong>Tutkimus:</strong> Labratyöt (työkirjasta, jos sivunumero), simulaatiot ja demot</li>
        <li><span class="level-dot black"></span><strong>Työkirja:</strong> Harjoitustehtävät työkirjasta, loppupään tehtävät haastavampia</li>
      </ul>

      <h3>Tuntimerkinnät</h3>
      <p>Oppilaiden tuntimerkinnät kirjataan <strong>paperisiin oppilaslistoihin</strong>.</p>
      <p>Merkitse:</p>
      <ul>
        <li>ketkä ovat pois tunnilta</li>
        <li>ketkä ovat myöhässä</li>
        <li>muut olennaiset tuntimerkinnät</li>
      </ul>
      <p>Merkitse lisäksi kouluarvosana-asteikolla <strong>4–10</strong>, millaista tuntityöskentelyä kullakin oppilaalla on ollut. Huomioon otetaan esimerkiksi läksyt, harjoittelumäärä ja erityisesti laatu, kaverien auttaminen ja aktiivisuus.</p>
      <div class="guide-important">
        <strong>⚠️ Ilman tätä tietoa oppilaiden jatkuva arviointi ei ole mahdollista, ethän unohda tehdä sitä!</strong>
      </div>

      <h3>Koetilanne</h3>
      <p>Sallitut välineet kokeissa:</p>
      <ul>
        <li>Kynä ja pyyhekumi</li>
        <li>Opettajan antamaa tyhjää paperia (oppilaan omia ei saa käyttää)</li>
        <li>Laskin (ilmoitetaan kokeen tiedoissa erikseen)</li>
        <li>Tietokone (ilmoitetaan kokeen tiedoissa erikseen)</li>
      </ul>
      <p>Kielletyt välineet kokeissa:</p>
      <ul>
        <li>Oppilaan omat lunttilaput yms.</li>
        <li>Puhelimet, älykellot, kuulokkeet ja älylasit</li>
      </ul>
      <p>Ennen koetta valvova opettaja tarkistaa, että kiellettyjä välineitä ei ole (esim. ranteet ja korvat tulee näyttää). Oppilaiden reput viedään opettajan osoittamaan paikkaan, kuten luokan etu- tai takaosaan.</p>
      <p>Varmista, että oppilaat istuvat sellaisessa paikassa, johon on hyvä näkyvyys. Jos kokeen aikana oppilas tarvitsee apua, opettaja ei mene oppilaan luo, vaan oppilas tulee opettajan luo.</p>
      <p>Jos koe on kirjallinen, valvotaan luokan etuosasta. Jos koe on sähköinen, luokan takaosasta näkee parhaiten oppilaiden näytöt. Muista oikeasti VALVOA oppilaita, älä puuhastele omiasi!</p>
      <p>Lunttaustilanteessa oppilaan koe keskeytetään ja koevälineet kerätään pois. Kaikista poikkeustilanteista tulee tehdä muistiinpanot.</p>
      <p>Kun koe on palautettu, oppilaat voivat lukea luokassa olevia lehtiä tai kirjoja. Omia tietokoneita ja puhelimia ei saa käyttää. Koe päättyy aina viimeistään silloin, kun oppitunti päättyy.</p>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 4. LUO SIJAISOHJEET
// --------------------------------------------------------------------------

function initInstructionsForm() {
  if (!instructionsStart || !instructionsEnd) return;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (!instructionsStart.value) instructionsStart.value = formatDate(today);
  if (!instructionsEnd.value) instructionsEnd.value = formatDate(tomorrow);
}

function getTimetableEventsForDate(isoDate) {
  if (!state.timetable || !state.timetable.paivat) return [];
  const date = new Date(`${isoDate}T12:00:00`);
  const dayKeys = ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"];
  const dayKey = dayKeys[date.getDay()];
  const dayData = state.timetable.paivat[dayKey];
  if (!dayData || !Array.isArray(dayData.tapahtumat)) return [];

  return dayData.tapahtumat.map((event) => ({
    ...event,
    date: isoDate
  }));
}

function getCourseForGroup(groupCode) {
  if (!groupCode) return null;
  const courseCodeValue = groupCode.split(".").slice(0, -1).join(".");
  return (state.courses || []).find((course) => course.code === courseCodeValue) || null;
}

function getScheduleForGroup(groupCode) {
  if (!state.schedules || !groupCode) return null;
  const courseCodeValue = groupCode.split(".").slice(0, -1).join(".");
  const courseSchedule = state.schedules[courseCodeValue];
  return courseSchedule?.groups?.[groupCode] || null;
}

async function getLessonForDate(course, schedule, isoDate) {
  if (!course || !schedule) return null;

  const courseData = await getCourseData(course.code);
  const lessons = courseData.lessons || [];
  const date = new Date(`${isoDate}T12:00:00`);
  const startDate = new Date(`${schedule.startDate}T12:00:00`);
  const endDate = new Date(`${schedule.endDate}T12:00:00`);

  if (date < startDate || date > endDate || !schedule.weekdays.includes(date.getDay())) {
    return null;
  }

  const exception = (schedule.exceptions || []).find((item) => item.date === isoDate);
  if (exception) {
    return { exception };
  }

  let lessonNumber = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= date) {
    const currentIso = formatDate(currentDate);
    if (schedule.weekdays.includes(currentDate.getDay())) {
      const isException = (schedule.exceptions || []).some((item) => item.date === currentIso);
      if (!isException) {
        lessonNumber++;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const lesson = lessons.find((item) => item.lesson === lessonNumber);
  return lesson ? { lesson } : null;
}

async function handleInstructionsSubmit(e) {
  e.preventDefault();
  if (!instructionsStart || !instructionsEnd) return;

  const start = instructionsStart.value;
  const end = instructionsEnd.value;

  if (!start || !end) {
    showToast("Valitse sekä alku- että loppupäivä.");
    return;
  }

  if (start > end) {
    showToast("Alkupäivä ei voi olla loppupäivän jälkeen.");
    return;
  }

  const dates = getDatesBetween(start, end);
  const events = [];

  for (const date of dates) {
    const dayEvents = getTimetableEventsForDate(date);
    for (const event of dayEvents) {
      if (event.tyyppi === "oppitunti" && event.ryhma) {
        const course = getCourseForGroup(event.ryhma);
        const schedule = getScheduleForGroup(event.ryhma);
        if (course && schedule) {
          const lessonInfo = await getLessonForDate(course, schedule, date);
          if (lessonInfo) {
            events.push({
              ...event,
              ...lessonInfo
            });
            continue;
          }
        }
      }
      events.push(event);
    }
  }

  const emailText = buildSubstituteInstructions(events, start, end);
  const lessonEventsCount = events.filter((ev) => ev.tyyppi === "oppitunti").length;
  renderGeneratedInstructions(emailText, start, end, lessonEventsCount);
}

function buildSubstituteInstructions(events, start, end) {
  const lines = [];
  const grouped = new Map();

  events.forEach((event) => {
    const date = event.date;
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date).push(event);
  });

  [...grouped.entries()].forEach(([date, dayEvents]) => {
    lines.push(formatEmailDate(date));
    lines.push("");

    dayEvents.forEach((event, eventIndex) => {
      if (event.tyyppi === "valvonta") {
        lines.push(`  ${event.alku}–${event.loppu}  VALVONTA  (${event.paikka || ""})`);
      } else {
        lines.push(`  ${event.alku}–${event.loppu}  ${event.ryhma}  (${event.tila || ""})`);

        if (event.exception) {
          lines.push(`    ${event.exception.type}`);
          lines.push(`    ${event.exception.description}`);
        } else if (event.lesson) {
          lines.push(`    Aihe: ${event.lesson.topic || event.lesson.title || ""}`);

          if (event.lesson.tasks) {
            const taskLines = Object.entries(event.lesson.tasks)
              .filter(([, value]) => value !== undefined && value !== null && value !== "")
              .map(([key, value]) => {
                const labels = {
                  research: "Tutkimus",
                  theory: "Työkirja",
                  warmup: "Yhteiset",
                  blue: "Siniset",
                  red: "Punaiset"
                };
                return `${labels[key] || key}: ${value}`;
              });

            if (taskLines.length) {
              lines.push(`    Tehtävät: ${taskLines.join(" | ")}`);
            }
          }

          if (Array.isArray(event.lesson.taskSheets) && event.lesson.taskSheets.length) {
            const sheetTitles = event.lesson.taskSheets.map((s) => s.title).join(", ");
            lines.push(`    Tehtävämoniste (PDF): ${sheetTitles}`);
          }

          if (event.lesson.substituteNote) {
            lines.push(`    Sijaiselle: ${event.lesson.substituteNote}`);
          }
        }
      }

      if (eventIndex < dayEvents.length - 1) {
        lines.push("");
      }
    });

    lines.push("");
  });

  const siteUrl = window.location.href.split("#")[0];
  const range = formatDateRange(start, end);

  return [
    `Hei!`,
    ``,
    `Olen poissa ${range}. Tässä poissaoloni aikana pidettävät oppitunnit ja niiden ohjeet:`,
    ``,
    lines.join("\n"),
    `Luethan myös muut sijaisuuksiin liittyvät ohjeet kurssisivustolta:`,
    siteUrl,
    ``,
    `Ystävällisin terveisin,`,
    `Mikael`
  ].join("\n").replace(/\n{3,}/g, "\n\n");
}

function renderGeneratedInstructions(emailText, start, end, eventCount) {
  if (!generatedInstructions) return;
  generatedInstructions.hidden = false;

  generatedInstructions.innerHTML = `
    <div class="generated-header">
      <h3>Valmis sijaisohje</h3>
      <p>${eventCount} oppituntia löytyi aikaväliltä ${formatDateRange(start, end)}.</p>
    </div>

    <pre id="instructions-preview-formatted" class="instructions-preview-formatted">${escapeHtml(emailText)}</pre>

    <div class="instruction-actions">
      <button id="btn-copy-instructions" class="rev-btn rev-btn-tasks" type="button" style="padding: 10px 18px; font-size: 0.95rem;">
        📋 Kopioi leikepöydälle
      </button>
    </div>
  `;

  const copyBtn = document.querySelector("#btn-copy-instructions");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(emailText)
        .then(() => {
          showToast("📋 Sijaisohjeet kopioitu leikepöydälle!");
        })
        .catch(() => {
          showToast("Kopiointi epäonnistui. Kopioi teksti suoraan ruudulta.");
        });
    });
  }
}

// Käynnistetään sovellus
init();
