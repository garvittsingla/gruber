import { Tokenizer } from "./lexer.js";
import { TokenType } from "./types.js";

export class Parser extends Tokenizer {
  constructor() {
    super();
  }
  
  parse(markdown) {
    this.tokenize(markdown);
    
  }
  
  
}