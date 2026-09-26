import { TokenType } from "./core/types.js";
import { Tokenizer } from "./core/lexer.js";


const tokenizer = new Tokenizer();

editor = document.getElementById('editor');
editor.addEventListener('input', () => {
  const markdown = editor.value;
  console.log(tokenizer.tokenize(markdown));
});
