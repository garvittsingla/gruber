import { Parser } from "./core/parser.js";
import { Renderer } from "./core/renderer.js";


const editor = document.getElementById("editor");
const display = document.getElementById("displayarea");
const decks = document.getElementById("decks");

let totalslidehtml = document.getElementsByClassName("totalnumber");  
let slidenumberhtml = document.getElementsByClassName("slidenumber");




let singleSlideView = true;
let currentSlideIndex = 0;

let markdown;
let parser;
let renderer;

document.addEventListener("DOMContentLoaded", () => {
  markdown = editor.value;
  parser = new Parser();
  renderer = new Renderer();
  render();
});

function updateSlideNumbers() {
  totalslidehtml[0].textContent = parser.parse(markdown).slides.length;
  slidenumberhtml[0].textContent = currentSlideIndex + 1;
}

function render() {
  markdown = editor.value;
  const parsed = parser.parse(markdown);
  if (singleSlideView) {
    display.innerHTML = renderer.renderSingleSlide(parsed.slides[currentSlideIndex]);
    decks.classList.add("single-slide-view");
  } else {
    display.innerHTML = renderer.renderWhole(parsed);
    decks.classList.remove("multi-slide-view");
  }
  updateSlideNumbers();
}

editor.addEventListener("input", () => {
  render();
});




