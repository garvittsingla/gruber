class Parser {
    constructor() {
        this.editor = document.getElementById('editor');
        this.display = document.getElementById('display');
        this.markdown = '';

        this.editor.addEventListener('input', () => {
            this.markdown = this.editor.value;
            this.divided = this.markdown.split('\n');

            console.log(this.divided);
        });
    }
}

const p = new Parser();