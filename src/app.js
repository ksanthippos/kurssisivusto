// Tila ja mallit
const state = {
  courses: [],
  books: [],
  revisions: [],
  info: null,
  activeView: "lesson", // "lesson" | "kirjat" | "kertaus" | "arviointi"
  activeGrade: "9",
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
const lessonHeading = document.querySelector("#lesson-heading");
const lessonSummaryBox = document.querySelector("#lesson-summary-box");
const lessonBody = document.querySelector("#lesson-body");
const lessonEmbedSection = document.querySelector("#lesson-embed-section");
const embedTitle = document.querySelector("#embed-title");
const embedWrapper = document.querySelector("#embed-wrapper");
const lessonTasksSection = document.querySelector("#lesson-tasks-section");
const taskCardsGrid = document.querySelector("#task-cards-grid");
const lessonContextLinks = document.querySelector("#lesson-context-links");
const prevLessonBtn = document.querySelector("#prev-lesson-btn");
const nextLessonBtn = document.querySelector("#next-lesson-btn");
const navTabs = document.querySelectorAll(".nav-tab");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-navigation");

// Sivupalkin ohjainalueet
const sidebarLessonControls = document.querySelector("#sidebar-lesson-controls");
const sidebarBooksControls = document.querySelector("#sidebar-books-controls");
const sidebarRevisionControls = document.querySelector("#sidebar-revision-controls");
const booksQuickNav = document.querySelector("#books-quick-nav");
const revisionQuickNav = document.querySelector("#revision-quick-nav");
const booksFilterPills = document.querySelectorAll("#books-filter-pills .filter-pill");
const revisionFilterPills = document.querySelectorAll("#revision-filter-pills .filter-pill");

// Päänäkymä-paneelit
const viewLesson = document.querySelector("#view-lesson");
const viewBooks = document.querySelector("#view-books");
const viewRevision = document.querySelector("#view-revision");
const viewArviointi = document.querySelector("#view-arviointi");

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
    // Oletus: 7. lk ja MA_71
    setGrade("7", "MA_71", 1);
    return;
  }

  const parts = hash.split("/");
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
      setGrade("7", "MA_71", 1);
    }
  }
}

// Näkymän vaihto
function switchView(viewName) {
  state.activeView = viewName;
  updateNavTabsUI();

  // Piilotetaan kaikki näkymäpaneelit
  if (viewLesson) viewLesson.hidden = viewName !== "lesson";
  if (viewBooks) viewBooks.hidden = viewName !== "kirjat";
  if (viewRevision) viewRevision.hidden = viewName !== "kertaus";
  if (viewArviointi) viewArviointi.hidden = viewName !== "arviointi";

  // Sivupalkin vastaavat kontrollit
  if (sidebarLessonControls) sidebarLessonControls.hidden = viewName !== "lesson";
  if (sidebarBooksControls) sidebarBooksControls.hidden = viewName !== "kirjat";
  if (sidebarRevisionControls) sidebarRevisionControls.hidden = viewName !== "kertaus";

  if (viewName === "kirjat") {
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
      if (embedTitle) embedTitle.textContent = current.simulation.title || "Interaktiivinen simulaatio";
      if (embedWrapper) {
        embedWrapper.innerHTML = `
          <iframe 
            src="${current.simulation.url}" 
            title="${escapeHtml(current.simulation.title || "Simulaatio")}"
            allowfullscreen 
            loading="lazy"
          ></iframe>
        `;
      }
    } else {
      lessonEmbedSection.hidden = true;
      if (embedWrapper) embedWrapper.innerHTML = "";
    }
  }

  // Tehtävät
  renderTasks(current.tasks);

  // Kontekstilinkit oppikirjaan ja kertaustehtäviin
  renderLessonContextLinks();

  // Edellinen / Seuraava -painikkeet
  if (prevLessonBtn) prevLessonBtn.disabled = current.lesson <= 1;
  if (nextLessonBtn) nextLessonBtn.disabled = current.lesson >= lessons.length;

  window.scrollTo({ top: 0, behavior: "smooth" });
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

// Käynnistetään sovellus
init();
