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
    NEW_SLIDE: 'new_slide',
    IMAGE: 'image',
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
  
  export class Document {
    slides;
    constructor() {
      this.slides = [];
    }
    
    addSlide(slide) {
      this.slides.push(slide);
    }
  
    getSlides() {
      return this.slides;
    }
    
    getSlideCount() {
      return this.slides.length;
    }
    
  }
  export class Slide {
    constructor() {
      this.children = [];
    }
    
    addContent(token) {
      this.children.push(token);
    }
  
    getContent() {
      return this.children;
    }
  }

export class Heading {
  type
  level
  children
  
  constructor(level, children) {
    this.type = 'heading';
    this.level = level;
    this.children = children;
  }
}
export class Code {
  type
  content
  
  constructor(content) {
    this.type = 'code';
    this.content = content;
  }
}

export class BlockQuote {
  type
  children
  
  constructor(children) {
    this.type = 'blockquote';
    this.children = children;
  }
}

export class Text {
  type
  content
  
  constructor(content) {
    this.type = 'text';
    this.content = content;
  }
}

export class Bold {
  type
  children
  
  constructor(children) {
    this.type = 'bold';
    this.children = children;
  }
}

export class Italic {
  type
  children
  
  constructor(children) {
    this.type = 'italic';
    this.children = children;
  }
}
export class Paragraph {
  type
  children
  
  constructor(children) {
    this.type = 'paragraph';
    this.children = children;
  }
}
export class Image{
  type
  src
  alt
  
  constructor(src, alt) {
    this.type = 'image';
    this.src = src;
    this.alt = alt;
  }
}