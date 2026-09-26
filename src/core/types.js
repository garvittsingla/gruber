export const TokenType = {
  HEADING1: 'heading1', 
  HEADING2: 'heading2', 
  HEADING3: 'heading3', 
  HEADING4: 'heading4', 
  HEADING5: 'heading5', 
  HEADING6: 'heading6', 
  TEXT: 'text', 
  CODE: 'code',
  BOLD_START: 'bold_start', 
  BOLD_END: 'bold_end',
  ITALIC_START: 'italic_start', 
  ITALIC_END: 'italic_end',
  BLOCKQUOTE: 'blockquote',
}

export const HeadingMap = {
  1: TokenType.HEADING1,
  2: TokenType.HEADING2,
  3: TokenType.HEADING3,
  4: TokenType.HEADING4,
  5: TokenType.HEADING5,
  6: TokenType.HEADING6,
}

export class Token{
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  
  toString() {
    return `Token(${this.type}, ${this.value})`;
  }
}