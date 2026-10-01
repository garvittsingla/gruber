import { Parser } from "./core/parser.js";


const editor = document.getElementById("editor");
const parser = new Parser();
editor.addEventListener("input", () => {
  const markdown = editor.value;
  const parsed = parser.parse(markdown);
  console.log(parsed)
});
