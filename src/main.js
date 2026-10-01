import { Parser } from "./core/parser.js";
import { Renderer } from "./core/renderer.js";


const editor = document.getElementById("editor");
const display = document.getElementById("displayarea");
const decks = document.getElementById("decks");

let totalslidehtml = document.getElementsByClassName("totalnumber");  
let slidenumberhtml = document.getElementsByClassName("slidenumber");




let singleSlideView = false;
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
  const rendered = singleSlideView ? renderer.renderSingleSlide(parsed.slides[currentSlideIndex]) : renderer.renderWhole(parsed);
  display.innerHTML = rendered;
  updateSlideNumbers();
}

editor.addEventListener("input", () => {
  render();
});




