import { Parser } from "./core/parser.js";
import { Renderer } from "./core/renderer.js";
import { PetEngine } from "./pets.js";

const editor = document.getElementById("editor");
const display = document.getElementById("displayarea");
const totalSlideHtml = document.querySelector(".totalnumber");
const slideNumberHtml = document.querySelectorAll(".slidenumber");
const previousSlideButton = document.getElementById("prevslide");
const nextSlideButton = document.getElementById("nextslide");
const singleSlideButton = document.querySelector(".setsingleslideview");
const multiSlideButton = document.querySelector(".setmultislideview");
const editorToolbar = document.querySelector(".editor-toolbar");

// Navbar elements
const btnTemplates = document.getElementById("btn-templates");
const templatesDropdown = document.getElementById("templates-dropdown");
const templatesWrapper = document.getElementById("templates-wrapper");
const btnExport = document.getElementById("btn-export");
const exportDropdown = document.getElementById("export-dropdown");
const exportWrapper = document.getElementById("export-wrapper");
const btnPresent = document.getElementById("btn-present");

// Pet control buttons
const btnAddPet = document.getElementById("btn-add-pet");
const btnRemovePet = document.getElementById("btn-remove-pet");
const btnPetSound = document.getElementById("btn-pet-sound");

// Presenter elements
const presentationStage = document.getElementById("presentation-stage");
const presenterSlideViewport = document.getElementById("presenter-slide-viewport");
const presenterHud = document.getElementById("presenter-hud");
const hudPrev = document.getElementById("hud-prev");
const hudNext = document.getElementById("hud-next");
const hudCurrent = document.getElementById("hud-current");
const hudTotal = document.getElementById("hud-total");
const hudTimer = document.getElementById("hud-timer");
const hudExit = document.getElementById("hud-exit");

// Toast container
const toastContainer = document.getElementById("toast-container");

let singleSlideView = true;
let currentSlideIndex = 0;
let isPresentationMode = false;
let presentationSeconds = 0;
let presentationTimerInterval = null;
let hudHideTimeout = null;

let markdown;
let parser;
let renderer;
let petEngine;

// Default presentation templates
const TEMPLATES = {
  gruber: `# gruber
made on the name of markdown creator 'John Gruber'

realtime markdown to presentation generator.

## motivation
this project is made for learning purpose and inspired by https://github.com/arpitbbhayani/deckrun, but with a simpler, more focused implementation.here he used parser marked(https://www.npmjs.com/package/marked) which is a markdown parser written in JavaScript but I wanted to learn how tokenizers, parsers, and ASTs work. moreover this project is like you need to have npm installed on your machine, but some non tech people don't know how to use it, so it will be deployed as a static site. Yaa it is not a very big deal to make it a static site, but the project is in itself a learning project.
and for me it is the one of the coolest implementation that i will do myself in this era of Artificial Intelligence.
## inspiration
just look at the wireframe i generated from LLM with this as raw wireframe
![](https://github.com/garvittsingla/gruber/raw/main/wireframes/wireframeraw.png)
and it created it
![](https://github.com/garvittsingla/gruber/raw/main/wireframes/wireframe.png)
`,
  minimalist: `# Minimalist Deck 🍃
## Clean, Focused, Direct

---

# Core Idea 💡

- Focus on the essence of your message.
- Remove all unnecessary distractions.
- Let your words and typography speak for themselves.

---

# Clean Structure 📐

> Simplicity is about subtracting the obvious and adding the meaningful.

- Markdown is transparent
- Presentation without clutter
- Pure focus on content

---

# Thank You! 🌿
*Keep it simple.*
`,
  pitch: `# Acme Studio 🚀
## The Future of Developer Presentations
*Seed Pitch Deck • 2026*

---

# The Problem ⚠️

- Developers waste hours fighting mouse-heavy slide builders
- Code snippets lose syntax styling and format
- Version control is impossible with traditional slide decks

> "Developers live in text editors, yet slides haven't evolved in decades."

---

# The Solution 💡

A lightning-fast Markdown engine that renders beautiful slides in realtime.

- Pure text in, polished decks out
- Instant hot-reloading
- 100% offline and zero dependencies

---

# Traction 📊

- 10x faster presentation authoring
- Git-friendly collaboration
- Exportable to PDF, HTML, and Markdown

---

# Let's Build Together ✨
*Contact us at team@gruber.studio*
`,
  tech: `# Building a Markdown Engine 🛠️
## From Tokens to Slides

---

# Architecture Overview 🏛️

The pipeline is split into clean, decoupled stages:

- **Lexer**: Tokenizes markdown into atomic symbols
- **Parser**: Builds an Abstract Syntax Tree (AST)
- **Renderer**: Generates responsive DOM elements

---

# Lexer Implementation 🔍

\`\`\`javascript
class Tokenizer {
  tokenize(markdown) {
    this.tokens = [];
    while (!this.isAtEnd()) {
      this.scanBlock();
    }
    return this.tokens;
  }
}
\`\`\`

---

# Slide Delimiter \`---\` ⚡

Horizontal rules split slides instantly:

> Keep slides concise. One key thought per slide maximizes comprehension.

---

# Questions & Discussion 💬
*Thank you for listening!*
`
};

document.addEventListener("DOMContentLoaded", () => {
  markdown = editor.value;
  parser = new Parser();
  renderer = new Renderer();

  try {
    petEngine = new PetEngine("pets-canvas");
  } catch (err) {
    console.warn("Could not start PetEngine:", err);
  }

  setupNavbar();
  render();
});

editorToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-insert]");
  if (!button) return;

  const insertions = {
    slide: "\n\n---\n\n# New Slide\n",
    heading: "# Heading",
    code: "```javascript\n// Your code here\n```"
  };
  const insertion = insertions[button.dataset.insert];
  const start = editor.selectionStart;
  const end = editor.selectionEnd;

  editor.focus();
  editor.setRangeText(insertion, start, end, "end");
  editor.dispatchEvent(new Event("input", { bubbles: true }));
});

function updateSlideNumbers() {
  const slideCount = parser.parse(markdown).slides.length;
  totalSlideHtml.textContent = slideCount;
  slideNumberHtml.forEach((number) => (number.textContent = currentSlideIndex + 1));
  previousSlideButton.disabled = currentSlideIndex === 0;
  nextSlideButton.disabled = currentSlideIndex >= slideCount - 1;
}

function render() {
  markdown = editor.value;
  const parsed = parser.parse(markdown);
  currentSlideIndex = Math.min(currentSlideIndex, parsed.slides.length - 1);
  if (singleSlideView) {
    display.innerHTML = renderer.renderSingleSlide(parsed.slides[currentSlideIndex]);
    display.classList.add("singleSlideView");
    display.classList.remove("multipleSlideView");
  } else {
    display.innerHTML = renderer.renderWhole(parsed);
    display.classList.remove("singleSlideView");
    display.classList.add("multipleSlideView");
    display.querySelectorAll(".decks > .slide").forEach((slide, index) => {
      slide.addEventListener("click", () => {
        currentSlideIndex = index;
        singleSlideView = true;
        singleSlideButton.classList.add("active");
        multiSlideButton.classList.remove("active");
        render();
      });
    });
  }
  updateSlideNumbers();
}

editor.addEventListener("input", () => {
  localStorage.setItem("markdown", editor.value);
  render();
});

previousSlideButton.addEventListener("click", () => {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    render();
  }
});

nextSlideButton.addEventListener("click", () => {
  const slideCount = parser.parse(editor.value).slides.length;
  if (currentSlideIndex < slideCount - 1) {
    currentSlideIndex++;
    render();
  }
});

singleSlideButton.addEventListener("click", () => {
  singleSlideView = true;
  singleSlideButton.classList.add("active");
  multiSlideButton.classList.remove("active");
  render();
});

multiSlideButton.addEventListener("click", () => {
  singleSlideView = false;
  multiSlideButton.classList.add("active");
  singleSlideButton.classList.remove("active");
  render();
});

function loadFromLocalStorage() {
  if (localStorage.getItem("markdown")) {
    editor.value = localStorage.getItem("markdown");
    render();
  } else {
    editor.value = TEMPLATES.gruber;
    render();
  }
}

window.addEventListener("load", loadFromLocalStorage);

/* ==========================================================================
   NAVBAR INTERACTIONS & ACTIONS
   ========================================================================== */

function setupNavbar() {
  // 1. Dropdown Toggles
  setupDropdown(templatesWrapper, btnTemplates, templatesDropdown);
  setupDropdown(exportWrapper, btnExport, exportDropdown);

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  // 2. Templates Click
  document.querySelectorAll("[data-template]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const templateKey = btn.dataset.template;
      if (TEMPLATES[templateKey]) {
        editor.value = TEMPLATES[templateKey];
        localStorage.setItem("markdown", editor.value);
        currentSlideIndex = 0;
        render();
        closeAllDropdowns();
        const title = btn.querySelector(".item-title")?.textContent || templateKey;
        showToast(`Loaded ${title}`);
      }
    });
  });

  // 3. Export Actions
  document.getElementById("export-copy-md")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    navigator.clipboard.writeText(editor.value).then(() => {
      showToast("📋 Markdown copied to clipboard!");
    }).catch(() => {
      showToast("⚠️ Could not copy to clipboard");
    });
  });

  document.getElementById("export-download-md")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gruber-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📝 Downloaded presentation.md");
  });

  document.getElementById("export-print-pdf")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    window.print();
  });

  document.getElementById("export-standalone-html")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    exportStandaloneHtml();
  });

  // 4. Pet Controls
  btnAddPet?.addEventListener("click", (e) => {
    e.stopPropagation();
    petEngine?.addPet();
  });

  btnRemovePet?.addEventListener("click", (e) => {
    e.stopPropagation();
    petEngine?.removePet();
  });

  btnPetSound?.addEventListener("click", (e) => {
    e.stopPropagation();
    const muted = petEngine?.toggleSound();
    btnPetSound.textContent = muted ? "🔇" : "🔊";
    btnPetSound.title = muted ? "Unmute sound effects" : "Mute sound effects";
    showToast(muted ? "Sound muted 🔇" : "Sound enabled 🔊");
  });

  // 5. Presenter Controls
  btnPresent?.addEventListener("click", () => enterPresentationMode());
  hudExit?.addEventListener("click", () => exitPresentationMode());
  hudPrev?.addEventListener("click", () => prevPresentationSlide());
  hudNext?.addEventListener("click", () => nextPresentationSlide());

  // Mouse inactivity HUD auto-hide
  document.addEventListener("mousemove", () => {
    if (!isPresentationMode) return;
    presenterHud.classList.remove("hud-hidden");
    clearTimeout(hudHideTimeout);
    hudHideTimeout = setTimeout(() => {
      if (isPresentationMode) {
        presenterHud.classList.add("hud-hidden");
      }
    }, 3500);
  });

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (isPresentationMode) {
      if (e.key === "Escape") {
        exitPresentationMode();
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextPresentationSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevPresentationSlide();
      }
    } else {
      if (e.key === "F5" || ((e.metaKey || e.ctrlKey) && e.key === "Enter")) {
        e.preventDefault();
        enterPresentationMode();
      }
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && isPresentationMode) {
      exitPresentationMode();
    }
  });
}

function setupDropdown(wrapper, button, dropdown) {
  if (!button || !dropdown) return;
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("show");
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add("show");
      wrapper.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll(".nav-dropdown-menu.show").forEach((menu) => menu.classList.remove("show"));
  document.querySelectorAll(".nav-dropdown-wrapper.open").forEach((wrapper) => wrapper.classList.remove("open"));
  document.querySelectorAll(".nav-btn[aria-expanded='true']").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
}

/* ==========================================================================
   PRESENTATION MODE CONTROLLER
   ========================================================================== */

function enterPresentationMode() {
  if (isPresentationMode) return;
  isPresentationMode = true;
  presentationStage.classList.add("active");
  presentationStage.setAttribute("aria-hidden", "false");

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  presentationSeconds = 0;
  updateHudTimer();
  clearInterval(presentationTimerInterval);
  presentationTimerInterval = setInterval(() => {
    presentationSeconds++;
    updateHudTimer();
  }, 1000);

  renderFullscreenSlide();
  showToast("Presentation started (Esc to exit)");
}

function exitPresentationMode() {
  if (!isPresentationMode) return;
  isPresentationMode = false;
  presentationStage.classList.remove("active");
  presentationStage.setAttribute("aria-hidden", "true");
  clearInterval(presentationTimerInterval);

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  render();
  showToast("Exited presentation mode");
}

function updateHudTimer() {
  const mins = String(Math.floor(presentationSeconds / 60)).padStart(2, "0");
  const secs = String(presentationSeconds % 60).padStart(2, "0");
  hudTimer.textContent = `${mins}:${secs}`;
}

function renderFullscreenSlide() {
  const parsed = parser.parse(editor.value);
  if (!parsed.slides.length) return;
  currentSlideIndex = Math.max(0, Math.min(currentSlideIndex, parsed.slides.length - 1));
  presenterSlideViewport.innerHTML = renderer.renderSingleSlide(parsed.slides[currentSlideIndex]);
  hudCurrent.textContent = currentSlideIndex + 1;
  hudTotal.textContent = parsed.slides.length;
}

function nextPresentationSlide() {
  const slideCount = parser.parse(editor.value).slides.length;
  if (currentSlideIndex < slideCount - 1) {
    currentSlideIndex++;
    renderFullscreenSlide();
  }
}

function prevPresentationSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    renderFullscreenSlide();
  }
}

/* ==========================================================================
   STANDALONE HTML EXPORT
   ========================================================================== */

function exportStandaloneHtml() {
  const parsed = parser.parse(editor.value);
  const slidesHtml = renderer.renderWhole(parsed);
  const standaloneContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gruber Presentation</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#18191A; color:#EBDBB2; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
    #deck-stage { width:90vw; max-width:1040px; aspect-ratio:16/9; max-height:85vh; background:#1D2021; border:1px solid #3C3836; border-radius:12px; padding:40px; overflow:auto; box-shadow:0 16px 40px rgba(0,0,0,0.5); }
    .decks { width:100%; height:100%; }
    .slide { display:none; width:100%; height:100%; overflow:auto; }
    .slide.active { display:block; }
    h1 { color:#EBDBB2; font-size:2.2em; margin-bottom:0.5em; }
    h2 { color:#FABD2F; font-size:1.75em; margin-bottom:0.5em; }
    h3 { color:#A89984; font-size:1.35em; margin-bottom:0.5em; }
    p { margin-bottom:0.8em; line-height:1.6; }
    pre { background:#18191A; border:1px solid #3C3836; border-radius:8px; padding:12px; font-family:monospace; margin:0.8em 0; overflow-x:auto; }
    code { color:#FABD2F; font-family:monospace; }
    blockquote { border-left:4px solid #FABD2F; padding:8px 14px; background:#32302F; color:#A89984; margin:1em 0; font-style:italic; }
    #hud { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#282828; border:1px solid #504945; border-radius:20px; padding:6px 16px; display:flex; align-items:center; gap:12px; font-size:12px; font-family:monospace; }
    button { background:#32302F; border:1px solid #504945; color:#EBDBB2; border-radius:4px; padding:4px 8px; cursor:pointer; }
    button:hover { color:#FABD2F; border-color:#FABD2F; }
  </style>
</head>
<body>
  <div id="deck-stage">
    ${slidesHtml}
  </div>
  <div id="hud">
    <button id="prev">◀</button>
    <span id="counter">1 / 1</span>
    <button id="next">▶</button>
  </div>
  <script>
    const slides = document.querySelectorAll(".decks > .slide");
    let cur = 0;
    const counter = document.getElementById("counter");
    function update() {
      slides.forEach((s, i) => s.classList.toggle("active", i === cur));
      counter.textContent = (cur + 1) + " / " + slides.length;
    }
    document.getElementById("prev").onclick = () => { if (cur > 0) { cur--; update(); } };
    document.getElementById("next").onclick = () => { if (cur < slides.length - 1) { cur++; update(); } };
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { if (cur < slides.length - 1) { cur++; update(); } }
      else if (e.key === "ArrowLeft") { if (cur > 0) { cur--; update(); } }
    });
    update();
  </script>
</body>
</html>`;
  const blob = new Blob([standaloneContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gruber-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("🌐 Downloaded standalone HTML presentation!");
}


function showToast(message, duration = 2500) {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 250);
  }, duration);
}