/**
 * whiteboard.js - Luokkahuoneen interaktiivinen valkotaulutyökalu (HTML5 Canvas & Pointer Events)
 * Pasilan peruskoulu · RAUH Kurssisivusto (TODO.md kohta 3a)
 *
 * Ominaisuudet:
 * - Näyttötilat: split (puoli ruutua rinnakkain teorian kanssa), fullscreen (koko ruutu), floating (kelluva siirrettävä ikkuna)
 * - Kokoruututilan kytkentä: paluu edelliseen näkymään (split/floating) yhdellä klikkauksella
 * - Tussit ja värit: tumma/valkoinen (automaattinen tumman tilan invertointi), sininen, punainen, vihreä, keltainen korostus
 * - Kynän paksuudet: ohut (2px), normaali (4px), paksu (8px)
 * - Työkalut: Tussi, pyyhekumi (destination-out) ja Panorointi (✋)
 * - Zoomaus ja panorointi: (+, -, 100% nollaus, hiiren rulla ja kahden sormen nipistys-zoomaus älytaululla)
 * - Taustapohjat: tiivistetty yhden napin valikko: ruutupaperi (matematiikka), koordinaatisto (x, y -akselit & asteikko), viivoitus, valkoinen
 * - Kumoa / Tee uudelleen (Undo / Redo) ja Tyhjennys
 * - Kuvan vienti PNG-tiedostoksi (Export)
 * - Kelluvan ikkunan koon ja sijainnin automaattinen muistaminen välimuistissa (localStorage)
 * - Natiivit Pointer Events (hiiri, kosketus, älytaulun kynä / stylus)
 * - Retina / HiDPI -terävyys (devicePixelRatio)
 */

let panel = null;
let canvasWrapper = null;
let bgCanvas = null;
let drawCanvas = null;
let bgCtx = null;
let drawCtx = null;

// Tila
let isOpen = false;
let currentMode = "split"; // "split" | "fullscreen" | "floating"
let previousMode = "split"; // "split" | "floating"
let activeTool = "pen"; // "pen" | "eraser" | "pan"
let activeColor = "#1e293b";
let activeSize = 4;
let activeBackground = "coords"; // "blank" | "grid" | "coords" | "lines"

// Zoomaus ja panorointi
let zoom = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartPointer = { x: 0, y: 0 };
let panStartOffset = { x: 0, y: 0 };

// Monikosketus (kahden sormen nipistys-zoomaus älytaululle & kosketusnäytölle)
const activePointers = new Map();
let pinchStartDistance = 0;
let pinchStartZoom = 1.0;
let pinchStartCenter = { x: 0, y: 0 };
let pinchStartPan = { x: 0, y: 0 };
let isPinching = false;

// Piirroksen historia (vektoripohjainen terävä tallennus maailmankoordinaateissa)
let strokes = []; // { tool, color, size, points: [{x, y}, ...] }
let redoStack = [];
let currentStroke = null;
let isDrawing = false;
let resizeObserver = null;
let panelResizeObserver = null;

// Kelluvan ikkunan raahaustila
let isDraggingWindow = false;
let dragStartX = 0;
let dragStartY = 0;
let panelStartLeft = 0;
let panelStartTop = 0;

// Taustapohjien konfiguraatio
const BG_INFO = {
  coords: { icon: "📈", label: "Koordinaatisto (x, y)" },
  grid: { icon: "▦", label: "Ruutupaperi" },
  blank: { icon: "⬜", label: "Puhdas tausta" },
  lines: { icon: "☰", label: "Viivoitus" }
};

/**
 * Muuntaa mustan tussin valkoiseksi tummassa teemassa ja päinvastoin
 */
function getEffectiveStrokeColor(rawColor) {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    if (rawColor === "#1e293b" || rawColor === "#000000" || rawColor === "#0f172a" || !rawColor) {
      return "#f8fafc";
    }
  } else {
    if (rawColor === "#f8fafc" || rawColor === "#ffffff") {
      return "#1e293b";
    }
  }
  return rawColor;
}

/**
 * Päivittää tussipaletin ensimmäisen napin värin vastaamaan teemaa
 */
function updatePrimaryColorForTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const primaryBtn = document.querySelector("#wb-color-primary");
  if (primaryBtn) {
    const colorVal = isDark ? "#f8fafc" : "#1e293b";
    primaryBtn.style.setProperty("--c", colorVal);
    primaryBtn.title = isDark ? "Valkoinen / Kirkas tussi (tumma tila)" : "Musta / Tumma tussi";
  }
}

/**
 * Asettaa ja tallentaa valkotaulun taustapohjan
 */
export function setWhiteboardBackground(bgKey) {
  if (!BG_INFO[bgKey]) bgKey = "coords";
  activeBackground = bgKey;
  try {
    localStorage.setItem("rauh_wb_bg", bgKey);
  } catch (err) {}

  const bgBtn = document.querySelector("#wb-btn-bg");
  const bgIcon = document.querySelector("#wb-bg-btn-icon");
  if (bgBtn && bgIcon) {
    bgIcon.textContent = BG_INFO[bgKey].icon;
    bgBtn.title = `Taustapohja: ${BG_INFO[bgKey].label} (klikkaa vaihtaaksesi)`;
  }

  document.querySelectorAll(".wb-bg-option").forEach((opt) => {
    const isMatch = opt.dataset.bg === bgKey;
    opt.classList.toggle("active", isMatch);
  });

  if (isOpen) {
    drawBackground();
  }
}

/**
 * Asettaa kankaalle zoomaus-, panorointi- ja HiDPI-skaalauksen
 */
function applyCanvasTransform(ctx) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.translate(panX, panY);
  ctx.scale(zoom, zoom);
}

/**
 * Muuntaa ruutukoordinaatit virtuaalimaailman koordinaateiksi
 */
function getScreenPos(e) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function screenToWorld(pos) {
  return {
    x: (pos.x - panX) / zoom,
    y: (pos.y - panY) / zoom
  };
}

/**
 * Zoomaa tietyn pisteen (screenX, screenY) ympäri
 */
function zoomAtPoint(factor, screenX, screenY) {
  const newZoom = Math.min(3.0, Math.max(0.4, zoom * factor));
  panX = screenX - ((screenX - panX) / zoom) * newZoom;
  panY = screenY - ((screenY - panY) / zoom) * newZoom;
  zoom = newZoom;
  updateZoomUI();
  drawBackground();
  redrawAllStrokes();
}

/**
 * Nollaa zoomauksen ja panoroinnin oletukseen (100%)
 */
function resetZoomAndPan() {
  zoom = 1.0;
  panX = 0;
  panY = 0;
  updateZoomUI();
  drawBackground();
  redrawAllStrokes();
}

/**
 * Päivittää zoomausprosentin työkalupalkkiin
 */
function updateZoomUI() {
  const zoomText = document.querySelector("#wb-zoom-text");
  if (zoomText) {
    zoomText.textContent = `${Math.round(zoom * 100)}%`;
  }
  const zoomResetBtn = document.querySelector("#wb-btn-zoom-reset");
  if (zoomResetBtn) {
    zoomResetBtn.title = `Nollaa zoomaus (nykyinen: ${Math.round(zoom * 100)}%)`;
  }
}

/**
 * Alustaa valkotaulun DOM-elementit ja tapahtumankuuntelijat
 */
export function initWhiteboard() {
  panel = document.querySelector("#whiteboard-panel");
  if (!panel) return;

  canvasWrapper = document.querySelector("#whiteboard-canvas-wrapper");
  bgCanvas = document.querySelector("#whiteboard-bg-canvas");
  drawCanvas = document.querySelector("#whiteboard-draw-canvas");

  if (!bgCanvas || !drawCanvas || !canvasWrapper) return;

  bgCtx = bgCanvas.getContext("2d");
  drawCtx = drawCanvas.getContext("2d");

  setupToolbarEvents();
  setupPointerEvents();
  setupDragEvents();
  setupResizeEvents();
  setupThemeObserver();

  // ResizeObserver tarkkailee canvas-wrapperin kokoa ja päivittää resoluution
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (isOpen) {
        requestAnimationFrame(resizeCanvases);
      }
    });
    resizeObserver.observe(canvasWrapper);

    // Tarkkailee kelluvan paneelin kokoa lennossa ja tallentaa sen välimuistiin
    panelResizeObserver = new ResizeObserver(() => {
      if (currentMode === "floating" && isOpen) {
        const w = panel.offsetWidth;
        const h = panel.offsetHeight;
        if (w >= 300 && h >= 200) {
          try {
            localStorage.setItem("rauh_wb_w", String(w));
            localStorage.setItem("rauh_wb_h", String(h));
          } catch (err) {}
        }
      }
    });
    panelResizeObserver.observe(panel);
  } else {
    window.addEventListener("resize", () => {
      if (isOpen) requestAnimationFrame(resizeCanvases);
    });
  }

  // Aseta ja palauta aiemmat valkotaulun asetukset välimuistista (localStorage)
  const savedBg = localStorage.getItem("rauh_wb_bg") || "coords";
  setWhiteboardBackground(savedBg);

  updatePrimaryColorForTheme();

  const savedColor = localStorage.getItem("rauh_wb_color");
  if (savedColor) {
    activeColor = savedColor;
    document.querySelectorAll(".wb-color-btn").forEach((btn) => {
      const match = btn.dataset.color === savedColor;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-checked", match ? "true" : "false");
    });
  }

  const savedSize = localStorage.getItem("rauh_wb_size");
  if (savedSize) {
    activeSize = parseInt(savedSize, 10) || 4;
    document.querySelectorAll(".wb-size-btn").forEach((btn) => {
      const match = parseInt(btn.dataset.size, 10) === activeSize;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-checked", match ? "true" : "false");
    });
  }

  const savedTool = localStorage.getItem("rauh_wb_tool");
  if (savedTool && ["pen", "eraser", "pan"].includes(savedTool)) {
    setTool(savedTool);
  }

  const savedMode = localStorage.getItem("rauh_wb_mode");
  if (savedMode && (savedMode === "split" || savedMode === "floating")) {
    currentMode = savedMode;
    previousMode = savedMode;
  }

  // Palauta piirretyt muistiinpanot välimuistista
  try {
    const savedStrokes = localStorage.getItem("rauh_wb_strokes");
    if (savedStrokes) {
      const parsed = JSON.parse(savedStrokes);
      if (Array.isArray(parsed) && parsed.length > 0) {
        strokes = parsed;
        updateUndoRedoUI();
      }
    }
  } catch (err) {
    console.warn("Valkotaulun piirrosten palautus epäonnistui:", err);
  }

  // Palauta aukiolotila (jos valkotaulu oli avattuna ennen sivun päivitystä)
  const wasOpen = localStorage.getItem("rauh_wb_open") === "1";
  if (wasOpen) {
    openWhiteboard(currentMode);
  }
}

/**
 * Työkalupalkin painikkeet ja toiminnot
 */
function setupToolbarEvents() {
  // 1. Tiivistetty taustapohjan valitsin ja ponnahdusvalikko
  const bgBtn = document.querySelector("#wb-btn-bg");
  const bgMenu = document.querySelector("#wb-bg-menu");

  if (bgBtn && bgMenu) {
    bgBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = bgMenu.hasAttribute("hidden");
      if (isHidden) {
        bgMenu.removeAttribute("hidden");
        bgBtn.setAttribute("aria-expanded", "true");
      } else {
        bgMenu.setAttribute("hidden", "");
        bgBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".wb-bg-option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        const chosenBg = opt.dataset.bg;
        setWhiteboardBackground(chosenBg);
        bgMenu.setAttribute("hidden", "");
        bgBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Sulje valikko klikattaessa sen ulkopuolelle
    document.addEventListener("click", (e) => {
      if (!bgMenu.hasAttribute("hidden") && !e.target.closest("#wb-bg-dropdown-container")) {
        bgMenu.setAttribute("hidden", "");
        bgBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 2. Väripaletti
  document.querySelectorAll(".wb-color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".wb-color-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
      activeColor = btn.dataset.color || "#1e293b";
      localStorage.setItem("rauh_wb_color", activeColor);

      // Jos pyyhekumi tai panorointi oli valittuna, vaihda automaattisesti takaisin kynään
      if (activeTool === "eraser" || activeTool === "pan") {
        setTool("pen");
      }
    });
  });

  // 3. Paksuuspaletti
  document.querySelectorAll(".wb-size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".wb-size-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
      activeSize = parseInt(btn.dataset.size, 10) || 4;
      localStorage.setItem("rauh_wb_size", String(activeSize));
    });
  });

  // 4. Työkalut: Kynä, Pyyhekumi ja Panorointi (✋)
  const penBtn = document.querySelector("#wb-tool-pen");
  const eraserBtn = document.querySelector("#wb-tool-eraser");
  const panBtn = document.querySelector("#wb-tool-pan");

  if (penBtn) penBtn.addEventListener("click", () => setTool("pen"));
  if (eraserBtn) eraserBtn.addEventListener("click", () => setTool("eraser"));
  if (panBtn) panBtn.addEventListener("click", () => setTool("pan"));

  // 5. Zoomauspainikkeet: Loitonna, Nollaa 100%, Lähennä
  const zoomInBtn = document.querySelector("#wb-btn-zoom-in");
  const zoomOutBtn = document.querySelector("#wb-btn-zoom-out");
  const zoomResetBtn = document.querySelector("#wb-btn-zoom-reset");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      const rect = canvasWrapper.getBoundingClientRect();
      zoomAtPoint(1.25, rect.width / 2, rect.height / 2);
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      const rect = canvasWrapper.getBoundingClientRect();
      zoomAtPoint(1 / 1.25, rect.width / 2, rect.height / 2);
    });
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", () => {
      resetZoomAndPan();
    });
  }

  // 6. Toiminnot: Kumoa, Uudelleen, Tyhjennä, Tallenna
  const undoBtn = document.querySelector("#wb-btn-undo");
  const redoBtn = document.querySelector("#wb-btn-redo");
  const clearBtn = document.querySelector("#wb-btn-clear");
  const exportBtn = document.querySelector("#wb-btn-export");

  if (undoBtn) undoBtn.addEventListener("click", undo);
  if (redoBtn) redoBtn.addEventListener("click", redo);
  if (clearBtn) clearBtn.addEventListener("click", clearBoard);
  if (exportBtn) exportBtn.addEventListener("click", exportPNG);

  // 7. Ikkunatilan vaihtonapit (Split / Kelluva yhdistetty toggle, Koko ruutu, Sulje)
  const modeToggleBtn = document.querySelector("#wb-btn-mode-toggle");
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener("click", toggleWhiteboardMode);
  }

  const fullscreenBtn = document.querySelector("#wb-btn-fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", toggleFullscreenMode);
  }

  // 8. Sulkunappi
  const closeBtn = document.querySelector("#wb-btn-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeWhiteboard());
  }

  // 9. Ulkoiset herätepainikkeet (kaikki toimivat aktivoi/deaktivoi -kytkiminä)
  const triggerBtn = document.querySelector("#whiteboard-trigger-btn");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => toggleWhiteboard());
  }
  const headerBtn = document.querySelector("#header-whiteboard-btn");
  if (headerBtn) {
    headerBtn.addEventListener("click", () => toggleWhiteboard());
  }
  const lessonWbBtn = document.querySelector("#btn-lesson-whiteboard");
  if (lessonWbBtn) {
    lessonWbBtn.addEventListener("click", () => toggleWhiteboard());
  }
}

/**
 * Pointer Events -piirto ja monikosketuslogiikka (tukee hiirtä, kynää ja monikosketusta)
 */
function setupPointerEvents() {
  drawCanvas.addEventListener("pointerdown", handlePointerDown, { passive: false });
  drawCanvas.addEventListener("pointermove", handlePointerMove, { passive: false });
  drawCanvas.addEventListener("pointerup", handlePointerUp, { passive: false });
  drawCanvas.addEventListener("pointercancel", handlePointerUp, { passive: false });

  // Hiiren rullan zoomaus ja vieritys
  drawCanvas.addEventListener("wheel", handleWheel, { passive: false });
}

function handlePointerDown(e) {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  e.preventDefault();

  try {
    drawCanvas.setPointerCapture(e.pointerId);
  } catch (err) {}

  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  // Jos kaksi sormea koskettaa näyttöä: käynnistetään monikosketus (nipistys-zoomaus ja kahden sormen panorointi)
  if (activePointers.size === 2) {
    if (isDrawing && currentStroke) {
      isDrawing = false;
      currentStroke = null;
      redrawAllStrokes(); // Peruutetaan mahdollinen ensimmäisen sormen aloituspiste
    }
    isPinching = true;
    const pts = Array.from(activePointers.values());
    pinchStartDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
    pinchStartZoom = zoom;
    pinchStartCenter = {
      x: (pts[0].x + pts[1].x) / 2,
      y: (pts[0].y + pts[1].y) / 2
    };
    pinchStartPan = { x: panX, y: panY };
    return;
  }

  // Jos panorointityökalu (käsi) on aktiivinen
  if (activeTool === "pan") {
    isPanning = true;
    panStartPointer = { x: e.clientX, y: e.clientY };
    panStartOffset = { x: panX, y: panY };
    drawCanvas.style.cursor = "grabbing";
    return;
  }

  // Kynä tai pyyhekumi
  const screenPos = getScreenPos(e);
  const worldPos = screenToWorld(screenPos);
  isDrawing = true;

  currentStroke = {
    tool: activeTool,
    color: activeTool === "eraser" ? "rgba(0,0,0,1)" : activeColor,
    size: activeSize,
    points: [worldPos]
  };

  // Piirrä aloituspiste heti
  drawDot(worldPos.x, worldPos.y, currentStroke);
}

function handlePointerMove(e) {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  // 1. Kahden sormen nipistys-zoomaus ja siirto
  if (isPinching && activePointers.size >= 2) {
    e.preventDefault();
    const pts = Array.from(activePointers.values());
    const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const currentCenter = {
      x: (pts[0].x + pts[1].x) / 2,
      y: (pts[0].y + pts[1].y) / 2
    };

    const scaleFactor = currentDist / pinchStartDistance;
    const newZoom = Math.min(3.0, Math.max(0.4, pinchStartZoom * scaleFactor));

    const rect = drawCanvas.getBoundingClientRect();
    const focalX = pinchStartCenter.x - rect.left;
    const focalY = pinchStartCenter.y - rect.top;

    const dx = currentCenter.x - pinchStartCenter.x;
    const dy = currentCenter.y - pinchStartCenter.y;

    panX = focalX - ((focalX - pinchStartPan.x) / pinchStartZoom) * newZoom + dx;
    panY = focalY - ((focalY - pinchStartPan.y) / pinchStartZoom) * newZoom + dy;
    zoom = newZoom;

    updateZoomUI();
    drawBackground();
    redrawAllStrokes();
    return;
  }

  // 2. Panorointityökalu (käsi)
  if (isPanning && activeTool === "pan") {
    e.preventDefault();
    const dx = e.clientX - panStartPointer.x;
    const dy = e.clientY - panStartPointer.y;
    panX = panStartOffset.x + dx;
    panY = panStartOffset.y + dy;
    drawBackground();
    redrawAllStrokes();
    return;
  }

  // 3. Kynä / Pyyhekumi
  if (!isDrawing || !currentStroke) return;
  e.preventDefault();

  const screenPos = getScreenPos(e);
  const worldPos = screenToWorld(screenPos);
  const pts = currentStroke.points;
  const prevWorldPos = pts[pts.length - 1];

  pts.push(worldPos);
  drawSegment(prevWorldPos, worldPos, currentStroke);
}

function handlePointerUp(e) {
  try {
    drawCanvas.releasePointerCapture(e.pointerId);
  } catch (err) {}

  activePointers.delete(e.pointerId);

  if (isPinching) {
    if (activePointers.size < 2) {
      isPinching = false;
    }
    return;
  }

  if (isPanning) {
    isPanning = false;
    if (activeTool === "pan") {
      drawCanvas.style.cursor = "grab";
    }
    return;
  }

  if (!isDrawing || !currentStroke) return;

  if (currentStroke.points.length > 0) {
    strokes.push(currentStroke);
    redoStack = [];
    updateUndoRedoUI();
    saveStrokesToStorage();
  }

  currentStroke = null;
  isDrawing = false;
}

function handleWheel(e) {
  e.preventDefault();
  const rect = drawCanvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (e.ctrlKey || e.metaKey || activeTool === "pan") {
    // Zoomaus hiiren rullalla
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    zoomAtPoint(factor, mouseX, mouseY);
  } else {
    // Panorointi kahden suunnan rullauksella
    panX -= e.deltaX;
    panY -= e.deltaY;
    drawBackground();
    redrawAllStrokes();
  }
}

/**
 * Yhden pisteen piirto
 */
function drawDot(x, y, stroke) {
  drawCtx.save();
  const radius = stroke.tool === "eraser" ? stroke.size * 2 : stroke.size / 2;
  const effectiveColor = getEffectiveStrokeColor(stroke.color);

  if (stroke.tool === "eraser") {
    drawCtx.globalCompositeOperation = "destination-out";
    drawCtx.beginPath();
    drawCtx.arc(x, y, radius, 0, Math.PI * 2);
    drawCtx.fill();
  } else {
    drawCtx.globalCompositeOperation = "source-over";
    drawCtx.fillStyle = effectiveColor;
    drawCtx.beginPath();
    drawCtx.arc(x, y, radius, 0, Math.PI * 2);
    drawCtx.fill();
  }
  drawCtx.restore();
}

/**
 * Kahden pisteen välisen janan piirto suorana ja pehmeänä
 */
function drawSegment(p1, p2, stroke) {
  drawCtx.save();
  drawCtx.lineCap = "round";
  drawCtx.lineJoin = "round";
  const effectiveColor = getEffectiveStrokeColor(stroke.color);

  if (stroke.tool === "eraser") {
    drawCtx.globalCompositeOperation = "destination-out";
    drawCtx.strokeStyle = "rgba(0,0,0,1)";
    drawCtx.lineWidth = stroke.size * 4;
  } else {
    drawCtx.globalCompositeOperation = "source-over";
    drawCtx.strokeStyle = effectiveColor;
    drawCtx.lineWidth = stroke.size;
  }

  drawCtx.beginPath();
  drawCtx.moveTo(p1.x, p1.y);
  drawCtx.lineTo(p2.x, p2.y);
  drawCtx.stroke();
  drawCtx.restore();
}

/**
 * Piirtää koko vetohistorian uudelleen puhtaalle kankaalle
 */
function redrawAllStrokes() {
  if (!drawCanvas || !drawCtx) return;

  const dpr = window.devicePixelRatio || 1;
  drawCtx.setTransform(1, 0, 0, 1, 0, 0);
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  applyCanvasTransform(drawCtx);

  for (const s of strokes) {
    if (!s.points || s.points.length === 0) continue;
    if (s.points.length === 1) {
      drawDot(s.points[0].x, s.points[0].y, s);
      continue;
    }

    drawCtx.save();
    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";
    const effectiveColor = getEffectiveStrokeColor(s.color);

    if (s.tool === "eraser") {
      drawCtx.globalCompositeOperation = "destination-out";
      drawCtx.strokeStyle = "rgba(0,0,0,1)";
      drawCtx.lineWidth = s.size * 4;
    } else {
      drawCtx.globalCompositeOperation = "source-over";
      drawCtx.strokeStyle = effectiveColor;
      drawCtx.lineWidth = s.size;
    }

    drawCtx.beginPath();
    drawCtx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) {
      drawCtx.lineTo(s.points[i].x, s.points[i].y);
    }
    drawCtx.stroke();
    drawCtx.restore();
  }
}

/**
 * Taustapohjien piirto (ruutupaperi, koordinaatisto, viivat, tyhjä) huomioiden zoomaus ja siirto
 */
function drawBackground() {
  if (!bgCanvas || !bgCtx || !canvasWrapper) return;
  const rect = canvasWrapper.getBoundingClientRect();
  const screenW = rect.width;
  const screenH = rect.height;

  if (screenW <= 0 || screenH <= 0) return;

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const bgColor = isDark ? "#0f172a" : "#ffffff";
  const gridFaint = isDark ? "#1e293b" : "#f1f5f9";
  const gridLine = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#475569";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  // 1. Tyhjennä koko taustakangas ja täytä pohjavärillä
  bgCtx.setTransform(1, 0, 0, 1, 0, 0);
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.fillStyle = bgColor;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

  if (activeBackground === "blank") {
    return;
  }

  // Aseta virtuaalitilan siirrot ja skaalaus
  applyCanvasTransform(bgCtx);

  const left = -panX / zoom;
  const top = -panY / zoom;
  const right = (screenW - panX) / zoom;
  const bottom = (screenH - panY) / zoom;

  // 2. Ruutupaperi (matematiikka / geometria)
  if (activeBackground === "grid") {
    const step = 28;
    bgCtx.lineWidth = 1 / zoom;

    const startX = Math.floor(left / step) * step;
    const endX = Math.ceil(right / step) * step;
    const startY = Math.floor(top / step) * step;
    const endY = Math.ceil(bottom / step) * step;

    for (let x = startX; x <= endX; x += step) {
      const idx = Math.round(x / step);
      bgCtx.strokeStyle = (idx % 5 === 0) ? gridLine : gridFaint;
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, top);
      bgCtx.lineTo(x + 0.5, bottom);
      bgCtx.stroke();
    }
    for (let y = startY; y <= endY; y += step) {
      const idx = Math.round(y / step);
      bgCtx.strokeStyle = (idx % 5 === 0) ? gridLine : gridFaint;
      bgCtx.beginPath();
      bgCtx.moveTo(left, y + 0.5);
      bgCtx.lineTo(right, y + 0.5);
      bgCtx.stroke();
    }
    return;
  }

  // 3. Koordinaatisto (x, y -akselit nuolineen ja numeroineen)
  if (activeBackground === "coords") {
    const step = 34; // Ruutukoko
    const cx = Math.round(screenW / 2);
    const cy = Math.round(screenH / 2);

    // Taustaruudukko
    bgCtx.lineWidth = 1 / zoom;
    bgCtx.strokeStyle = gridFaint;
    const startX = Math.floor((left - cx) / step) * step + cx;
    const endX = Math.ceil((right - cx) / step) * step + cx;
    const startY = Math.floor((top - cy) / step) * step + cy;
    const endY = Math.ceil((bottom - cy) / step) * step + cy;

    for (let x = startX; x <= endX; x += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, top);
      bgCtx.lineTo(x + 0.5, bottom);
      bgCtx.stroke();
    }
    for (let y = startY; y <= endY; y += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(left, y + 0.5);
      bgCtx.lineTo(right, y + 0.5);
      bgCtx.stroke();
    }

    // Pääakselit: X ja Y
    bgCtx.lineWidth = 2 / zoom;
    bgCtx.strokeStyle = axisColor;

    // X-akseli
    bgCtx.beginPath();
    bgCtx.moveTo(left, cy + 0.5);
    bgCtx.lineTo(right, cy + 0.5);
    bgCtx.stroke();

    // Y-akseli
    bgCtx.beginPath();
    bgCtx.moveTo(cx + 0.5, top);
    bgCtx.lineTo(cx + 0.5, bottom);
    bgCtx.stroke();

    // Nuolet akselien päihin
    bgCtx.fillStyle = axisColor;
    const arrowSize = 10 / zoom;

    // Nuoli X oikealle
    bgCtx.beginPath();
    bgCtx.moveTo(right - 2, cy + 0.5);
    bgCtx.lineTo(right - 2 - arrowSize, cy - arrowSize / 2);
    bgCtx.lineTo(right - 2 - arrowSize, cy + arrowSize / 2);
    bgCtx.closePath();
    bgCtx.fill();

    // Nuoli Y ylös
    bgCtx.beginPath();
    bgCtx.moveTo(cx + 0.5, top + 2);
    bgCtx.lineTo(cx - arrowSize / 2, top + 2 + arrowSize);
    bgCtx.lineTo(cx + arrowSize / 2, top + 2 + arrowSize);
    bgCtx.closePath();
    bgCtx.fill();

    // Asteikkomerkit ja numerot
    const fontSize = Math.max(9, Math.min(16, Math.round(11 / zoom)));
    bgCtx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    bgCtx.fillStyle = textColor;
    bgCtx.textAlign = "center";
    bgCtx.textBaseline = "top";

    // X-akselin merkit
    for (let x = cx + step; x < right - 20; x += step) {
      const val = Math.round((x - cx) / step);
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, cy - 4 / zoom);
      bgCtx.lineTo(x + 0.5, cy + 4 / zoom);
      bgCtx.stroke();
      bgCtx.fillText(val, x, cy + 6 / zoom);
    }
    for (let x = cx - step; x > left + 20; x -= step) {
      const val = Math.round((x - cx) / step);
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, cy - 4 / zoom);
      bgCtx.lineTo(x + 0.5, cy + 4 / zoom);
      bgCtx.stroke();
      bgCtx.fillText(val, x, cy + 6 / zoom);
    }

    // Y-akselin merkit
    bgCtx.textAlign = "right";
    bgCtx.textBaseline = "middle";
    for (let y = cy - step; y > top + 20; y -= step) {
      const val = Math.round((cy - y) / step);
      bgCtx.beginPath();
      bgCtx.moveTo(cx - 4 / zoom, y + 0.5);
      bgCtx.lineTo(cx + 4 / zoom, y + 0.5);
      bgCtx.stroke();
      bgCtx.fillText(val, cx - 6 / zoom, y);
    }
    for (let y = cy + step; y < bottom - 20; y += step) {
      const val = Math.round((cy - y) / step);
      bgCtx.beginPath();
      bgCtx.moveTo(cx - 4 / zoom, y + 0.5);
      bgCtx.lineTo(cx + 4 / zoom, y + 0.5);
      bgCtx.stroke();
      bgCtx.fillText(val, cx - 6 / zoom, y);
    }

    // Akselien kirjaimet x ja y ja origo 0
    bgCtx.font = `italic 700 ${fontSize + 2}px system-ui, sans-serif`;
    bgCtx.fillText("x", right - 16 / zoom, cy - 14 / zoom);
    bgCtx.textAlign = "left";
    bgCtx.fillText("y", cx + 10 / zoom, top + 16 / zoom);
    bgCtx.font = `${fontSize}px system-ui, sans-serif`;
    bgCtx.textAlign = "right";
    bgCtx.fillText("0", cx - 6 / zoom, cy + 12 / zoom);
    return;
  }

  // 4. Viivoitus (muistiinpanot)
  if (activeBackground === "lines") {
    const step = 32;
    bgCtx.lineWidth = 1 / zoom;
    bgCtx.strokeStyle = gridLine;
    const startY = Math.floor((top - 50) / step) * step + 50;
    const endY = Math.ceil((bottom - 50) / step) * step + 50;
    for (let y = startY; y < endY; y += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(left, y + 0.5);
      bgCtx.lineTo(right, y + 0.5);
      bgCtx.stroke();
    }
    // Punainen marginaaliviiva vasemmalle
    bgCtx.strokeStyle = isDark ? "#7f1d1d" : "#fca5a5";
    bgCtx.beginPath();
    bgCtx.moveTo(60.5, top);
    bgCtx.lineTo(60.5, bottom);
    bgCtx.stroke();
  }
}

/**
 * Päivittää kankaan resoluution Retina / HiDPI -tasolle ilman kuvan vääristymistä
 */
function resizeCanvases() {
  if (!bgCanvas || !drawCanvas || !canvasWrapper) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvasWrapper.getBoundingClientRect();
  const w = Math.floor(rect.width);
  const h = Math.floor(rect.height);

  if (w <= 0 || h <= 0) return;

  // CSS-näyttökoko
  bgCanvas.style.width = w + "px";
  bgCanvas.style.height = h + "px";
  drawCanvas.style.width = w + "px";
  drawCanvas.style.height = h + "px";

  // Todellinen pikseliresoluutio
  bgCanvas.width = Math.floor(w * dpr);
  bgCanvas.height = Math.floor(h * dpr);
  drawCanvas.width = Math.floor(w * dpr);
  drawCanvas.height = Math.floor(h * dpr);

  drawBackground();
  redrawAllStrokes();
}

/**
 * Tallentaa piirretyt vektorivedot selaimeen (localStorage)
 */
function saveStrokesToStorage() {
  try {
    if (strokes.length === 0) {
      localStorage.removeItem("rauh_wb_strokes");
    } else {
      // Rajoitetaan enintään 300 viimeisimpään vetoon suorituskyvyn varmistamiseksi
      localStorage.setItem("rauh_wb_strokes", JSON.stringify(strokes.slice(-300)));
    }
  } catch (err) {
    console.warn("Valkotaulun piirrosten tallennus epäonnistui:", err);
  }
}

/**
 * Työkalun vaihto (kynä, pyyhekumi tai panorointi ✋)
 */
export function setTool(tool) {
  activeTool = tool;
  try {
    localStorage.setItem("rauh_wb_tool", tool);
  } catch (err) {}

  const penBtn = document.querySelector("#wb-tool-pen");
  const eraserBtn = document.querySelector("#wb-tool-eraser");
  const panBtn = document.querySelector("#wb-tool-pan");

  if (penBtn) penBtn.classList.toggle("active", tool === "pen");
  if (eraserBtn) eraserBtn.classList.toggle("active", tool === "eraser");
  if (panBtn) panBtn.classList.toggle("active", tool === "pan");

  if (drawCanvas) {
    if (tool === "pan") {
      drawCanvas.style.cursor = "grab";
    } else if (tool === "eraser") {
      drawCanvas.style.cursor = "cell";
    } else {
      drawCanvas.style.cursor = "crosshair";
    }
  }
}

/**
 * Kumoa edellinen veto
 */
function undo() {
  if (strokes.length === 0) return;
  const last = strokes.pop();
  redoStack.push(last);
  redrawAllStrokes();
  updateUndoRedoUI();
  saveStrokesToStorage();
}

/**
 * Palauta kumoamisen jälkeen
 */
function redo() {
  if (redoStack.length === 0) return;
  const restored = redoStack.pop();
  strokes.push(restored);
  redrawAllStrokes();
  updateUndoRedoUI();
  saveStrokesToStorage();
}

/**
 * Tyhjennä valkotaulu (vetohistoria tallennetaan redo-pinoon, joten tyhjennys voidaan kumota)
 */
function clearBoard() {
  if (strokes.length === 0) return;
  redoStack = [...strokes];
  strokes = [];
  redrawAllStrokes();
  updateUndoRedoUI();
  saveStrokesToStorage();
}

/**
 * Päivittää Undo ja Redo -painikkeiden disabled-tilat
 */
function updateUndoRedoUI() {
  const undoBtn = document.querySelector("#wb-btn-undo");
  const redoBtn = document.querySelector("#wb-btn-redo");
  if (undoBtn) undoBtn.disabled = strokes.length === 0;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

/**
 * Tallenna valkotaulu kuvana (PNG)
 */
function exportPNG() {
  if (!bgCanvas || !drawCanvas) return;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = bgCanvas.width;
  exportCanvas.height = bgCanvas.height;
  const ctx = exportCanvas.getContext("2d");

  // Yhdistä tausta ja kynänjäljet yhteen kuvaan
  ctx.drawImage(bgCanvas, 0, 0);
  ctx.drawImage(drawCanvas, 0, 0);

  const link = document.createElement("a");
  const now = new Date();
  const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  link.download = `valkotaulu_${timeStr}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

/**
 * Asettaa valkotaulun näyttötilan (split, fullscreen, floating)
 */
export function setMode(mode) {
  if (!panel) return;

  // Tallennetaan kelluvan ikkunan mitat ja sijainti ennen moodin vaihtoa
  if (currentMode === "floating" && panel.offsetWidth && panel.offsetHeight) {
    try {
      localStorage.setItem("rauh_wb_w", String(panel.offsetWidth));
      localStorage.setItem("rauh_wb_h", String(panel.offsetHeight));
      if (panel.style.left) {
        localStorage.setItem("rauh_wb_x", parseInt(panel.style.left, 10));
        localStorage.setItem("rauh_wb_y", parseInt(panel.style.top, 10));
      }
    } catch (err) {}
  }

  if (currentMode !== "fullscreen" && mode === "fullscreen") {
    previousMode = currentMode;
  }
  currentMode = mode;

  panel.classList.remove("mode-split", "mode-fullscreen", "mode-floating");
  panel.classList.add(`mode-${mode}`);

  // Split-tilassa lisätään rungolle luokka, joka siirtää pääsisällön puolikkaalle
  if (mode === "split") {
    document.body.classList.add("whiteboard-split-active");
  } else {
    document.body.classList.remove("whiteboard-split-active");
  }

  // Nollataan AINA kaikki inline-sijainti ja mittatyylit konfliktien ja katoamisen estämiseksi
  panel.style.removeProperty("left");
  panel.style.removeProperty("top");
  panel.style.removeProperty("right");
  panel.style.removeProperty("bottom");
  panel.style.removeProperty("width");
  panel.style.removeProperty("height");

  if (mode === "floating") {
    const savedW = localStorage.getItem("rauh_wb_w");
    const savedH = localStorage.getItem("rauh_wb_h");
    const w = savedW ? Math.max(380, Math.min(window.innerWidth - 30, parseInt(savedW, 10))) : 580;
    const h = savedH ? Math.max(280, Math.min(window.innerHeight - 30, parseInt(savedH, 10))) : 440;
    panel.style.width = `${w}px`;
    panel.style.height = `${h}px`;

    const savedLeft = localStorage.getItem("rauh_wb_x");
    const savedTop = localStorage.getItem("rauh_wb_y");
    if (savedLeft !== null && savedTop !== null) {
      const left = parseInt(savedLeft, 10);
      const top = parseInt(savedTop, 10);
      const maxLeft = Math.max(10, window.innerWidth - w - 10);
      const maxTop = Math.max(10, window.innerHeight - h - 10);
      if (!isNaN(left) && !isNaN(top) && left >= 10 && left <= maxLeft && top >= 10 && top <= maxTop) {
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.right = "auto";
        panel.style.bottom = "auto";
      } else {
        panel.style.right = "24px";
        panel.style.bottom = "24px";
      }
    } else {
      panel.style.right = "24px";
      panel.style.bottom = "24px";
    }
  }

  // Päivitä yhdistetty näkymänvaihtopainike (Split <-> Kelluva)
  const modeToggleBtn = document.querySelector("#wb-btn-mode-toggle");
  const modeToggleIcon = document.querySelector("#wb-mode-icon");
  if (modeToggleBtn && modeToggleIcon) {
    if (mode === "split") {
      modeToggleIcon.textContent = "❐";
      modeToggleBtn.title = "Vaihda kelluvaan ikkunaan (❐)";
      modeToggleBtn.setAttribute("aria-label", "Vaihda kelluvaan ikkunaan");
    } else if (mode === "floating") {
      modeToggleIcon.textContent = "◫";
      modeToggleBtn.title = "Vaihda jaettuun ruutuun (◫)";
      modeToggleBtn.setAttribute("aria-label", "Vaihda jaettuun ruutuun");
    } else {
      modeToggleIcon.textContent = previousMode === "floating" ? "❐" : "◫";
      modeToggleBtn.title = previousMode === "floating" ? "Vaihda kelluvaan ikkunaan (❐)" : "Vaihda jaettuun ruutuun (◫)";
      modeToggleBtn.setAttribute("aria-label", modeToggleBtn.title);
    }
  }

  // Päivitä fullscreen-nappi (näyttää selkeästi aktiivisuuden ja edelliseen paluun)
  const fsBtn = document.querySelector("#wb-btn-fullscreen");
  if (fsBtn) {
    const isFs = mode === "fullscreen";
    fsBtn.classList.toggle("active", isFs);
    fsBtn.title = isFs ? "Pienennä edelliseen näkymään (⛶)" : "Koko ruutu (⛶)";
    fsBtn.setAttribute("aria-label", isFs ? "Pienennä edelliseen näkymään" : "Koko ruutu");
  }

  // Tallenna tila
  if (mode === "split" || mode === "floating") {
    localStorage.setItem("rauh_wb_mode", mode);
  }

  // Päivitä resoluutiot seuraavassa animaatiofreimissä
  requestAnimationFrame(() => {
    resizeCanvases();
  });
}

/**
 * Vaihtaa jaetun ruudun (split) ja kelluvan ikkunan (floating) välillä
 */
export function toggleWhiteboardMode() {
  if (currentMode === "split") {
    setMode("floating");
  } else if (currentMode === "floating") {
    setMode("split");
  } else {
    setMode(previousMode === "floating" ? "floating" : "split");
  }
}

/**
 * Vaihtaa koko ruudun (fullscreen) ja edellisen tilan (split tai floating) välillä
 */
export function toggleFullscreenMode() {
  if (currentMode === "fullscreen") {
    const targetMode = (previousMode && previousMode !== "fullscreen") ? previousMode : "split";
    setMode(targetMode);
  } else {
    previousMode = currentMode;
    setMode("fullscreen");
  }
}

/**
 * Avaa valkotaulun
 */
export function openWhiteboard(mode = null) {
  if (!panel) return;
  if (mode) currentMode = mode;

  panel.hidden = false;
  isOpen = true;
  try {
    localStorage.setItem("rauh_wb_open", "1");
  } catch (err) {}

  setMode(currentMode);

  // Synkronoi aktiiviset tilat kaikkiin herätenappeihin
  document.querySelectorAll("#whiteboard-trigger-btn, #header-whiteboard-btn, #btn-lesson-whiteboard, #pres-wb-btn").forEach((btn) => {
    btn.classList.add("is-active");
  });

  // Päivitä näytön hereilläpito
  window.updateAppKeepAwake?.();

  requestAnimationFrame(() => {
    resizeCanvases();
  });
}

/**
 * Sulkee valkotaulun
 */
export function closeWhiteboard() {
  if (!panel) return;

  // Jos suljetaan kelluva tila, tallennetaan sen mitat talteen
  if (currentMode === "floating" && panel.offsetWidth && panel.offsetHeight) {
    try {
      localStorage.setItem("rauh_wb_w", String(panel.offsetWidth));
      localStorage.setItem("rauh_wb_h", String(panel.offsetHeight));
      if (panel.style.left) {
        localStorage.setItem("rauh_wb_x", parseInt(panel.style.left, 10));
        localStorage.setItem("rauh_wb_y", parseInt(panel.style.top, 10));
      }
    } catch (err) {}
  }

  panel.hidden = true;
  isOpen = false;
  try {
    localStorage.setItem("rauh_wb_open", "0");
  } catch (err) {}
  document.body.classList.remove("whiteboard-split-active");

  // Poista aktiivinen tila herätenapeista
  document.querySelectorAll("#whiteboard-trigger-btn, #header-whiteboard-btn, #btn-lesson-whiteboard, #pres-wb-btn").forEach((btn) => {
    btn.classList.remove("is-active");
  });

  // Päivitä näytön hereilläpito
  window.updateAppKeepAwake?.();
}

/**
 * Avaa tai sulkee valkotaulun (aktivoi/deaktivoi)
 */
export function toggleWhiteboard(mode = null) {
  if (isOpen) {
    closeWhiteboard();
  } else {
    openWhiteboard(mode || currentMode);
  }
}

/**
 * Onko valkotaulu auki
 */
export function isWhiteboardOpen() {
  return isOpen;
}

/**
 * Kelluvan ikkunan raahausotsikko
 */
function setupDragEvents() {
  const handle = document.querySelector("#whiteboard-drag-handle");
  if (!handle) return;

  handle.addEventListener("pointerdown", (e) => {
    if (currentMode !== "floating") return;
    // Älä aloita raahausta, jos klikattiin painiketta tai valintalistan alkiota
    if (e.target.closest("button") || e.target.closest("select") || e.target.closest(".wb-bg-menu")) return;

    isDraggingWindow = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const rect = panel.getBoundingClientRect();
    panelStartLeft = rect.left;
    panelStartTop = rect.top;

    handle.setPointerCapture(e.pointerId);
    handle.style.cursor = "grabbing";
    e.preventDefault();
  });

  handle.addEventListener("pointermove", (e) => {
    if (!isDraggingWindow) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    let newLeft = panelStartLeft + dx;
    let newTop = panelStartTop + dy;

    // Rajoitukset ruudun sisälle
    const maxLeft = Math.max(10, window.innerWidth - panel.offsetWidth - 10);
    const maxTop = Math.max(10, window.innerHeight - panel.offsetHeight - 10);

    newLeft = Math.max(10, Math.min(newLeft, maxLeft));
    newTop = Math.max(10, Math.min(newTop, maxTop));

    panel.style.left = `${newLeft}px`;
    panel.style.top = `${newTop}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  });

  const stopDrag = (e) => {
    if (!isDraggingWindow) return;
    isDraggingWindow = false;
    try {
      handle.releasePointerCapture(e.pointerId);
    } catch (err) {}
    handle.style.cursor = "";

    if (currentMode === "floating" && panel.style.left) {
      localStorage.setItem("rauh_wb_x", parseInt(panel.style.left, 10));
      localStorage.setItem("rauh_wb_y", parseInt(panel.style.top, 10));
    }
  };

  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);
}

/**
 * Kelluvan ikkunan oikean alanurkan koonmuutos (vetämällä isommaksi / pienemmäksi)
 */
function setupResizeEvents() {
  const handle = document.querySelector("#whiteboard-resize-handle");
  if (!handle) return;

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startW = 0;
  let startH = 0;

  handle.addEventListener("pointerdown", (e) => {
    if (currentMode !== "floating") return;
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = panel.offsetWidth;
    startH = panel.offsetHeight;

    // Jos paneelin sijainti määrittyy right/bottom:lla, lukitaan se suoriksi left/top-arvoiksi
    const rect = panel.getBoundingClientRect();
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";

    try {
      handle.setPointerCapture(e.pointerId);
    } catch (err) {}
    e.preventDefault();
    e.stopPropagation();
  });

  handle.addEventListener("pointermove", (e) => {
    if (!isResizing) return;
    e.preventDefault();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const minW = 380;
    const minH = 280;
    const maxW = Math.max(minW, window.innerWidth - panel.offsetLeft - 10);
    const maxH = Math.max(minH, window.innerHeight - panel.offsetTop - 10);

    const newW = Math.max(minW, Math.min(maxW, Math.round(startW + dx)));
    const newH = Math.max(minH, Math.min(maxH, Math.round(startH + dy)));

    panel.style.width = `${newW}px`;
    panel.style.height = `${newH}px`;
  });

  const stopResize = (e) => {
    if (!isResizing) return;
    isResizing = false;
    try {
      handle.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (panel.offsetWidth && panel.offsetHeight) {
      localStorage.setItem("rauh_wb_w", panel.offsetWidth);
      localStorage.setItem("rauh_wb_h", panel.offsetHeight);
      if (panel.style.left) {
        localStorage.setItem("rauh_wb_x", parseInt(panel.style.left, 10));
        localStorage.setItem("rauh_wb_y", parseInt(panel.style.top, 10));
      }
    }
  };

  handle.addEventListener("pointerup", stopResize);
  handle.addEventListener("pointercancel", stopResize);
}

/**
 * Tarkkailee teeman muutosta (data-theme) ja päivittää taustan sekä tussivärin lennossa
 */
function setupThemeObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "data-theme") {
        updatePrimaryColorForTheme();
        if (isOpen) {
          drawBackground();
          redrawAllStrokes();
        }
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
