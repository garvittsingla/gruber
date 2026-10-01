import { Tokenizer } from "./lexer.js";
import { TokenType, Document, Slide, Heading, Bold, Italic,Code,Text,BlockQuote,Paragraph } from "./types.js";

export class Parser extends Tokenizer {
  constructor() {
    super();
  }
  
  parse(markdown) {
    this.tokenize(markdown);
    
    const document = new Document();
    let currentSlide = new Slide();
    
    for (let token of this.tokens) {
      if (token.type === TokenType.NEW_SLIDE) {
        document.addSlide(currentSlide);
        currentSlide = new Slide();
      } else {
        if (token.type === "text" && token.value.trim().length === 0) {
            continue; 
        }
        if (token.type.startsWith('heading')) {
          const level = parseInt(token.type.replace('heading', ''));
          const inlineChildren = this.parseInline(token.value);
          currentSlide.addContent(new Heading(level, inlineChildren));
        } else if (token.type === "text" ) {
          const inlineChildren = this.parseInline(token.value);
          currentSlide.addContent(new Paragraph(inlineChildren));
        } else if (token.type === "code") {
          const inlineChildren = this.parseInline(token.value);
          currentSlide.addContent(new Code(inlineChildren));
        } else if (token.type === "blockquote") {
          const inlineChildren = this.parseInline(token.value);
          currentSlide.addContent(new BlockQuote(inlineChildren));
        }
      }
    }
    
    document.addSlide(currentSlide);
    
    return document;
  }

  parseInline(text) {
      const children = [];
      let i = 0;
      let currentText = "";
  
      while (i < text.length) {
        if (text[i] === '*' && text[i+1] === '*') {
          if (currentText.length > 0) {
            children.push(new Text(currentText));
            currentText = "";
          }
  
          i += 2; 
          let boldText = "";
          while (i < text.length && !(text[i] === '*' && text[i+1] === '*')) {
            boldText += text[i];
            i++;
          }
          
          children.push(new Bold([new Text(boldText)]));
          if (i < text.length) i += 2; 
          continue; 
        }
  
        if (text[i] === '*') {
          if (currentText.length > 0) {
            children.push(new Text(currentText));
            currentText = "";
          }
  
          i += 1;
          let italicText = "";
          while (i < text.length && text[i] !== '*') {
            italicText += text[i];
            i++;
          }
          
          children.push(new Italic([new Text(italicText)]));
          if (i < text.length) i += 1; 
          continue;
        }
  
        currentText += text[i];
        i++;
      }
  
      if (currentText.length > 0) {
        children.push(new Text(currentText));
      }
  
      return children; 
    }
  
}