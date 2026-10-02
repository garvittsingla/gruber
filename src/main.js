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
  console.log(parsed);
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

let defaulttemplate = `# gruber
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
---
# New slide

---

## How Gruber Works

Gruber turns simple Markdown into presentation slides.

Each slide is separated using:

---

The editor updates the presentation **in real time** as you type.

---

## Creating Slides

Use three hyphens to create a new slide.

---

Everything after the separator belongs to the next slide.

You can create as many slides as you want.

---

## Headings

Gruber supports six levels of headings.

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

---

## Text Formatting

You can make text **bold**.

You can make text *italic*.

You can also combine normal text with **bold** and *italic* text.

---

## Blockquotes

Use the greater-than symbol to create a blockquote.

> Markdown is a language designed to be readable.

Blockquotes are useful for highlighting important ideas or quotes.

---

## Code Blocks

Use three backticks to create a code block.
`