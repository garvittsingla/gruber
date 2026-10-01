import { Parser } from "./core/parser.js";
import { Renderer } from "./core/renderer.js";



const editor = document.getElementById("editor");
let display = document.getElementById("display");
let markdown = editor.value;
const parser = new Parser();
const renderer = new Renderer();
const parsed = parser.parse(markdown);
const rendered = renderer.render(parsed);
display.innerHTML = rendered;

editor.addEventListener("input", () => {
  markdown = editor.value;
  const parsed = parser.parse(markdown);
  const rendered = renderer.render(parsed);
  display.innerHTML = rendered;
});
