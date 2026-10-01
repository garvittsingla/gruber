export class Renderer {
  render(ast) {
    let document = '<decks>';

    for (const slide of ast.slides) {
      document += this.renderSlide(slide);
    }

    document += '</decks>';

    return document;
  }

  renderSlide(slide) {
    let slideHtml = '<div class="slide"> ';

    for (const node of slide.children) {
      slideHtml += this.renderNode(node);
    }

    slideHtml += '</div>';

    return slideHtml;
  }

  renderNode(node) {
    switch (node.type) {
      case 'text':
        return this.escapeHtml(node.content);

      case 'heading':
        return `<h${node.level}>${this.renderChildren(node.children)}</h${node.level}>`;

      case 'paragraph':
        return `<p>${this.renderChildren(node.children)}</p>`;

      case 'bold':
        return `<strong>${this.renderChildren(node.children)}</strong>`;

      case 'italic':
        return `<em>${this.renderChildren(node.children)}</em>`;

      case 'blockquote':
        return `<blockquote>${this.renderChildren(node.children)}</blockquote>`;

      case 'code':
        return `<pre><code>${this.renderChildren(node.content)}</code></pre>`;

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  renderChildren(children) {
    return children
      .map(child => this.renderNode(child))
      .join('');
  }

  escapeHtml(text) {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}