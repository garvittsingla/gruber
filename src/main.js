import { Parser } from "./core/parser.js";
import { Renderer } from "./core/renderer.js";


const editor = document.getElementById("editor");
const display = document.getElementById("displayarea");
const totalSlideHtml = document.querySelector(".totalnumber");
const slideNumberHtml = document.querySelectorAll(".slidenumber");
const previousSlideButton = document.getElementById("prevslide");
const nextSlideButton = document.getElementById("nextslide");
const singleSlideButton = document.querySelector(".setsingleslideview");
const multiSlideButton = document.querySelector(".setmultislideview");
const editorToolbar = document.querySelector(".editor-toolbar");

let singleSlideView = true;
let currentSlideIndex = 0;

let markdown ;
let parser;
let renderer;

document.addEventListener("DOMContentLoaded", () => {
  markdown = editor.value;
  parser = new Parser();
  renderer = new Renderer();
  render();
});

editorToolbar.addEventListener("click", event => {
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
  slideNumberHtml.forEach(number => number.textContent = currentSlideIndex + 1);
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
    editor.value = defaulttemplate;
    render();
  }
}

window.addEventListener("load", loadFromLocalStorage);

let defaulttemplate = ``