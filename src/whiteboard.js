/**
 * whiteboard.js - Luokkahuoneen interaktiivinen valkotaulutyökalu (HTML5 Canvas & Pointer Events)
 * Pasilan peruskoulu · RAUH Kurssisivusto (TODO.md kohta 3a)
 *
 * Ominaisuudet:
 * - Näyttötilat: split (puoli ruutua rinnakkain teorian kanssa), fullscreen (koko ruutu), floating (kelluva siirrettävä ikkuna)
 * - Tussit ja värit: musta, sininen, punainen, vihreä, keltainen korostus
 * - Kynän paksuudet: ohut (2px), normaali (4px), paksu (8px)
 * - Pyyhekumi (destination-out: pyyhkii vain kynänjälkiä, ei taustaa)
 * - Taustapohjat: valkoinen, ruutupaperi (matematiikka), koordinaatisto (x, y -akselit & asteikko), viivoitus
 * - Kumoa / Tee uudelleen (Undo / Redo) ja Tyhjennys
 * - Kuvan vienti PNG-tiedostoksi (Export)
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
let activeTool = "pen"; // "pen" | "eraser"
let activeColor = "#1e293b";
let activeSize = 4;
let activeBackground = "coords"; // "blank" | "grid" | "coords" | "lines"

// Piirroksen historia (vektoripohjainen terävä tallennus)
let strokes = []; // { tool, color, size, points: [{x, y}, ...] }
let redoStack = [];
let currentStroke = null;
let isDrawing = false;
let resizeObserver = null;

// Kelluvan ikkunan raahaustila
let isDraggingWindow = false;
let dragStartX = 0;
let dragStartY = 0;
let panelStartLeft = 0;
let panelStartTop = 0;

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

  // ResizeObserver tarkkailee canvas-wrapperin todellista kokoa lennossa
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (isOpen) {
        requestAnimationFrame(resizeCanvases);
      }
    });
    resizeObserver.observe(canvasWrapper);
  } else {
    window.addEventListener("resize", () => {
      if (isOpen) requestAnimationFrame(resizeCanvases);
    });
  }

  // Aseta ja palauta aiemmat valkotaulun asetukset välimuistista (localStorage)
  const savedBg = localStorage.getItem("rauh_wb_bg");
  if (savedBg && ["blank", "grid", "coords", "lines"].includes(savedBg)) {
    activeBackground = savedBg;
    const bgSelect = document.querySelector("#wb-bg-select");
    if (bgSelect) bgSelect.value = savedBg;
  }

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
  if (savedTool && (savedTool === "pen" || savedTool === "eraser")) {
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
  // 1. Taustapohjan valitsin
  const bgSelect = document.querySelector("#wb-bg-select");
  if (bgSelect) {
    bgSelect.addEventListener("change", (e) => {
      activeBackground = e.target.value;
      localStorage.setItem("rauh_wb_bg", activeBackground);
      drawBackground();
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

      // Jos pyyhekumi oli valittuna, vaihda takaisin kynään
      if (activeTool === "eraser") {
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

  // 4. Työkalut: Kynä ja pyyhekumi
  const penBtn = document.querySelector("#wb-tool-pen");
  const eraserBtn = document.querySelector("#wb-tool-eraser");
  if (penBtn) penBtn.addEventListener("click", () => setTool("pen"));
  if (eraserBtn) eraserBtn.addEventListener("click", () => setTool("eraser"));

  // 5. Toiminnot: Kumoa, Uudelleen, Tyhjennä, Tallenna
  const undoBtn = document.querySelector("#wb-btn-undo");
  const redoBtn = document.querySelector("#wb-btn-redo");
  const clearBtn = document.querySelector("#wb-btn-clear");
  const exportBtn = document.querySelector("#wb-btn-export");

  if (undoBtn) undoBtn.addEventListener("click", undo);
  if (redoBtn) redoBtn.addEventListener("click", redo);
  if (clearBtn) clearBtn.addEventListener("click", clearBoard);
  if (exportBtn) exportBtn.addEventListener("click", exportPNG);

  // 6. Ikkunatilan vaihtonapit (Split / Kelluva yhdistetty toggle, Koko ruutu, Sulje)
  const modeToggleBtn = document.querySelector("#wb-btn-mode-toggle");
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener("click", toggleWhiteboardMode);
  }

  const fullscreenBtn = document.querySelector("#wb-btn-fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", toggleFullscreenMode);
  }

  document.querySelectorAll(".wb-mode-btn[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setMode(btn.dataset.mode);
    });
  });

  // 7. Sulkunappi
  const closeBtn = document.querySelector("#wb-btn-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeWhiteboard());
  }

  // 8. Ulkoiset herätepainikkeet (kaikki toimivat aktivoi/deaktivoi -kytkiminä)
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
 * Pointer Events -piirtologiikka (tukee hiirtä, kosketusta ja kynää)
 */
function setupPointerEvents() {
  drawCanvas.addEventListener("pointerdown", handlePointerDown, { passive: false });
  drawCanvas.addEventListener("pointermove", handlePointerMove, { passive: false });
  drawCanvas.addEventListener("pointerup", handlePointerUp, { passive: false });
  drawCanvas.addEventListener("pointercancel", handlePointerUp, { passive: false });
}

function getCanvasPos(e) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function handlePointerDown(e) {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  e.preventDefault();

  try {
    drawCanvas.setPointerCapture(e.pointerId);
  } catch (err) {}

  const pos = getCanvasPos(e);
  isDrawing = true;

  currentStroke = {
    tool: activeTool,
    color: activeTool === "eraser" ? "rgba(0,0,0,1)" : activeColor,
    size: activeSize,
    points: [pos]
  };

  // Piirrä aloituspiste heti näkyviin (piste tai kumin klikkaus)
  drawDot(pos.x, pos.y, currentStroke);
}

function handlePointerMove(e) {
  if (!isDrawing || !currentStroke) return;
  e.preventDefault();

  const pos = getCanvasPos(e);
  const pts = currentStroke.points;
  const prevPos = pts[pts.length - 1];

  pts.push(pos);
  drawSegment(prevPos, pos, currentStroke);
}

function handlePointerUp(e) {
  if (!isDrawing || !currentStroke) return;
  try {
    drawCanvas.releasePointerCapture(e.pointerId);
  } catch (err) {}

  if (currentStroke.points.length > 0) {
    strokes.push(currentStroke);
    redoStack = []; // Uusi veto tyhjentää redo-pinon
    updateUndoRedoUI();
    saveStrokesToStorage();
  }

  currentStroke = null;
  isDrawing = false;
}

/**
 * Yhden pisteen piirto (kun klikataan ilman liikettä)
 */
function drawDot(x, y, stroke) {
  drawCtx.save();
  const radius = stroke.tool === "eraser" ? stroke.size * 2 : stroke.size / 2;

  if (stroke.tool === "eraser") {
    drawCtx.globalCompositeOperation = "destination-out";
    drawCtx.beginPath();
    drawCtx.arc(x, y, radius, 0, Math.PI * 2);
    drawCtx.fill();
  } else {
    drawCtx.globalCompositeOperation = "source-over";
    drawCtx.fillStyle = stroke.color;
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

  if (stroke.tool === "eraser") {
    drawCtx.globalCompositeOperation = "destination-out";
    drawCtx.strokeStyle = "rgba(0,0,0,1)";
    drawCtx.lineWidth = stroke.size * 4; // Kumi on hieman paksumpi kätevyyden vuoksi
  } else {
    drawCtx.globalCompositeOperation = "source-over";
    drawCtx.strokeStyle = stroke.color;
    drawCtx.lineWidth = stroke.size;
  }

  drawCtx.beginPath();
  drawCtx.moveTo(p1.x, p1.y);
  drawCtx.lineTo(p2.x, p2.y);
  drawCtx.stroke();
  drawCtx.restore();
}

/**
 * Piirtää koko vetohistorian uudelleen puhtaalle kankaalle (vektoriterävyys)
 */
function redrawAllStrokes() {
  const rect = drawCanvas.getBoundingClientRect();
  drawCtx.clearRect(0, 0, rect.width, rect.height);

  for (const s of strokes) {
    if (!s.points || s.points.length === 0) continue;
    if (s.points.length === 1) {
      drawDot(s.points[0].x, s.points[0].y, s);
      continue;
    }

    drawCtx.save();
    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";

    if (s.tool === "eraser") {
      drawCtx.globalCompositeOperation = "destination-out";
      drawCtx.strokeStyle = "rgba(0,0,0,1)";
      drawCtx.lineWidth = s.size * 4;
    } else {
      drawCtx.globalCompositeOperation = "source-over";
      drawCtx.strokeStyle = s.color;
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
 * Taustapohjien piirto (ruutupaperi, koordinaatisto, viivat, tyhjä)
 */
function drawBackground() {
  if (!bgCanvas || !bgCtx) return;
  const rect = bgCanvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  bgCtx.clearRect(0, 0, w, h);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const bgColor = isDark ? "#0f172a" : "#ffffff";
  const gridFaint = isDark ? "#1e293b" : "#f1f5f9";
  const gridLine = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#475569";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  // 1. Taustaväri
  bgCtx.fillStyle = bgColor;
  bgCtx.fillRect(0, 0, w, h);

  if (activeBackground === "blank") {
    return;
  }

  // 2. Ruutupaperi (matematiikka / geometria)
  if (activeBackground === "grid") {
    const step = 28;
    bgCtx.lineWidth = 1;

    for (let x = 0; x <= w; x += step) {
      bgCtx.strokeStyle = (Math.round(x / step) % 5 === 0) ? gridLine : gridFaint;
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, 0);
      bgCtx.lineTo(x + 0.5, h);
      bgCtx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      bgCtx.strokeStyle = (Math.round(y / step) % 5 === 0) ? gridLine : gridFaint;
      bgCtx.beginPath();
      bgCtx.moveTo(0, y + 0.5);
      bgCtx.lineTo(w, y + 0.5);
      bgCtx.stroke();
    }
    return;
  }

  // 3. Koordinaatisto (x, y -akselit nuolineen ja numeroineen)
  if (activeBackground === "coords") {
    const step = 34; // Ruutukoko
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);

    // Taustaruudukko
    bgCtx.lineWidth = 1;
    bgCtx.strokeStyle = gridFaint;
    for (let x = cx % step; x <= w; x += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, 0);
      bgCtx.lineTo(x + 0.5, h);
      bgCtx.stroke();
    }
    for (let y = cy % step; y <= h; y += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(0, y + 0.5);
      bgCtx.lineTo(w, y + 0.5);
      bgCtx.stroke();
    }

    // Pääakselit: X ja Y
    bgCtx.lineWidth = 2;
    bgCtx.strokeStyle = axisColor;

    // X-akseli
    bgCtx.beginPath();
    bgCtx.moveTo(0, cy + 0.5);
    bgCtx.lineTo(w, cy + 0.5);
    bgCtx.stroke();

    // Y-akseli
    bgCtx.beginPath();
    bgCtx.moveTo(cx + 0.5, 0);
    bgCtx.lineTo(cx + 0.5, h);
    bgCtx.stroke();

    // Nuolet akselien päihin
    bgCtx.fillStyle = axisColor;
    // Nuoli X oikealle
    bgCtx.beginPath();
    bgCtx.moveTo(w - 2, cy + 0.5);
    bgCtx.lineTo(w - 12, cy - 5);
    bgCtx.lineTo(w - 12, cy + 5);
    bgCtx.closePath();
    bgCtx.fill();

    // Nuoli Y ylös
    bgCtx.beginPath();
    bgCtx.moveTo(cx + 0.5, 2);
    bgCtx.lineTo(cx - 5, 12);
    bgCtx.lineTo(cx + 5, 12);
    bgCtx.closePath();
    bgCtx.fill();

    // Asteikkomerkit ja numerot
    bgCtx.font = "11px system-ui, -apple-system, sans-serif";
    bgCtx.fillStyle = textColor;
    bgCtx.textAlign = "center";
    bgCtx.textBaseline = "top";

    // X-akselin merkit
    let valX = 1;
    for (let x = cx + step; x < w - 20; x += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, cy - 4);
      bgCtx.lineTo(x + 0.5, cy + 4);
      bgCtx.stroke();
      bgCtx.fillText(valX, x, cy + 6);
      valX++;
    }
    valX = -1;
    for (let x = cx - step; x > 20; x -= step) {
      bgCtx.beginPath();
      bgCtx.moveTo(x + 0.5, cy - 4);
      bgCtx.lineTo(x + 0.5, cy + 4);
      bgCtx.stroke();
      bgCtx.fillText(valX, x, cy + 6);
      valX--;
    }

    // Y-akselin merkit
    bgCtx.textAlign = "right";
    bgCtx.textBaseline = "middle";
    let valY = 1;
    for (let y = cy - step; y > 20; y -= step) {
      bgCtx.beginPath();
      bgCtx.moveTo(cx - 4, y + 0.5);
      bgCtx.lineTo(cx + 4, y + 0.5);
      bgCtx.stroke();
      bgCtx.fillText(valY, cx - 6, y);
      valY++;
    }
    valY = -1;
    for (let y = cy + step; y < h - 20; y += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(cx - 4, y + 0.5);
      bgCtx.lineTo(cx + 4, y + 0.5);
      bgCtx.stroke();
      bgCtx.fillText(valY, cx - 6, y);
      valY--;
    }

    // Akselien kirjaimet x ja y ja origo 0
    bgCtx.font = "italic 700 13px system-ui, sans-serif";
    bgCtx.fillText("x", w - 16, cy - 14);
    bgCtx.textAlign = "left";
    bgCtx.fillText("y", cx + 10, 16);
    bgCtx.font = "11px system-ui, sans-serif";
    bgCtx.textAlign = "right";
    bgCtx.fillText("0", cx - 6, cy + 12);
    return;
  }

  // 4. Viivoitus (muistiinpanot)
  if (activeBackground === "lines") {
    const step = 32;
    bgCtx.lineWidth = 1;
    bgCtx.strokeStyle = gridLine;
    for (let y = 50; y < h; y += step) {
      bgCtx.beginPath();
      bgCtx.moveTo(0, y + 0.5);
      bgCtx.lineTo(w, y + 0.5);
      bgCtx.stroke();
    }
    // Punainen marginaaliviiva vasemmalle
    bgCtx.strokeStyle = isDark ? "#7f1d1d" : "#fca5a5";
    bgCtx.beginPath();
    bgCtx.moveTo(60.5, 0);
    bgCtx.lineTo(60.5, h);
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

  // Skaalaa kontekstit
  bgCtx.setTransform(1, 0, 0, 1, 0, 0);
  bgCtx.scale(dpr, dpr);
  drawCtx.setTransform(1, 0, 0, 1, 0, 0);
  drawCtx.scale(dpr, dpr);

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
      // Rajoitetaan enintään 250 viimeisimpään vetoon, jotta pysyy nopeana
      localStorage.setItem("rauh_wb_strokes", JSON.stringify(strokes.slice(-250)));
    }
  } catch (err) {
    console.warn("Valkotaulun piirrosten tallennus epäonnistui:", err);
  }
}

/**
 * Työkalun vaihto (kynä / pyyhekumi)
 */
function setTool(tool) {
  activeTool = tool;
  try {
    localStorage.setItem("rauh_wb_tool", tool);
  } catch (err) {}

  const penBtn = document.querySelector("#wb-tool-pen");
  const eraserBtn = document.querySelector("#wb-tool-eraser");

  if (penBtn) penBtn.classList.toggle("active", tool === "pen");
  if (eraserBtn) eraserBtn.classList.toggle("active", tool === "eraser");

  if (drawCanvas) {
    drawCanvas.style.cursor = tool === "eraser" ? "cell" : "crosshair";
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
  // Mahdollistaa palauttamisen Undo-napilla
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

  if (currentMode !== "fullscreen") {
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
      modeToggleIcon.textContent = "◫";
      modeToggleBtn.title = "Poistu koko ruudun tilasta jaettuun ruutuun (◫)";
      modeToggleBtn.setAttribute("aria-label", "Poistu koko ruudun tilasta jaettuun ruutuun");
    }
  }

  // Päivitä fullscreen-nappi
  const fsBtn = document.querySelector("#wb-btn-fullscreen");
  if (fsBtn) {
    fsBtn.classList.toggle("active", mode === "fullscreen");
    fsBtn.title = mode === "fullscreen" ? "Poistu koko ruudun tilasta (⛶)" : "Koko ruutu (⛶)";
  }

  // Päivitä vanhat moodinapit jos DOMissa
  document.querySelectorAll(".wb-mode-btn[data-mode]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

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
 * Vaihtaa koko ruudun (fullscreen) ja edellisen tilan välillä
 */
export function toggleFullscreenMode() {
  if (currentMode === "fullscreen") {
    setMode(previousMode === "floating" ? "floating" : "split");
  } else {
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

  requestAnimationFrame(() => {
    resizeCanvases();
  });
}

/**
 * Sulkee valkotaulun
 */
export function closeWhiteboard() {
  if (!panel) return;

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
    if (e.target.closest("button") || e.target.closest("select")) return;

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

    // Jos paneelin sijainti määrittyy right/bottom:lla, lukitaan se suoriksi left/top-arvoiksi,
    // jotta oikean alanurkan veto laajentaa ikkunaa luonnollisesti hiiren/sormen mukana
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
 * Tarkkailee teeman muutosta (data-theme) ja piirtää taustan uudelleen
 */
function setupThemeObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "data-theme") {
        if (isOpen) {
          drawBackground();
        }
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
