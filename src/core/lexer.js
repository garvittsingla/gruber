import { TokenType, Token, HeadingMap } from './types.js';

export class Tokenizer {
  constructor() {
    this.markdown = "";
    this.tokens = [];
    this.cursor = 0;
  }

  /*
    Tokenizes the markdown into an array of tokens.
    @param {string} markdown - The markdown string to tokenize.
    @returns {Token[]} - The array of tokens generated from the markdown.
  */
  tokenize(markdown) {
    this.tokens = [];
    this.cursor = 0;
    this.markdown = markdown;
    
    while (!this.isAtEnd()) {
      this.scanBlock();
    }
    
    return this.tokens;
  }

  /*
    Scans the markdown for a block and consumes it.
    @private
  */
  scanBlock() {
    if (this.peek() === "#") {
      let level = 0;
      while (this.cursor + level < this.markdown.length && this.markdown[this.cursor + level] === "#" && level < 6) {
        level++;
      }
      if (this.markdown[this.cursor + level] === " ") {
        this.consumeHeading(level);
        return;
      }
    }

    if (this.peek() === ">") {
      this.consumeBlockQuote();
      return;
    }

    if (this.peek() === "`" && this.markdown.substring(this.cursor, this.cursor + 3) === "```") {
      this.consumeCodeBlock();
      return;
    }

    this.consumeText();
  }

  /*
    Consumes a heading from the markdown.
    @private
  */
  consumeHeading(level) {
    const headingType = HeadingMap[level];
    this.cursor += level + 1;

    let text = "";
    while (!this.isAtEnd() && this.peek() !== "\n") {
      text += this.peek();
      this.advance();
    }
    if (!this.isAtEnd() && this.peek() === "\n") {
      this.advance();
    }
    this.push(new Token(headingType, text));
  }

  /*
    Consumes a block quote from the markdown.
    @private
  */
  consumeBlockQuote() {
    this.advance();
    if (!this.isAtEnd() && this.peek() === " ") {
      this.advance();
    }

    let text = "";
    while (!this.isAtEnd() && this.peek() !== "\n") {
      text += this.peek();
      this.advance();
    }
    if (!this.isAtEnd() && this.peek() === "\n") {
      this.advance();
    }
    this.push(new Token(TokenType.BLOCKQUOTE, text));
  }

  /*
    Consumes text from the markdown.
    @private
  */
  consumeText() {
    let text = "";
    while (!this.isAtEnd() && this.peek() !== "\n") {
      text += this.peek();
      this.advance();
    }
    if (!this.isAtEnd() && this.peek() === "\n") {
      this.advance();
    }
    this.push(new Token(TokenType.TEXT, text));
  }

  /*
    Consumes a code block from the markdown.
    @private
  */
  consumeCodeBlock() {
    this.cursor += 3; 

    let text = "";
    while (!this.isAtEnd() && this.markdown.substring(this.cursor, this.cursor + 3) !== "```") {
      text += this.peek();
      this.advance();
    }
    
    if (!this.isAtEnd()) {
      this.cursor += 3;
    }
    
    this.push(new Token(TokenType.CODE, text));
  }

  push(token) {
    this.tokens.push(token);
  }
  
  peek() {
    return this.markdown[this.cursor];
  }

  advance() {
    this.cursor++;
  }

  isAtEnd() {
    return this.cursor >= this.markdown.length;
  }
}