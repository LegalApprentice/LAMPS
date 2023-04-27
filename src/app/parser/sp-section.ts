import { spParagraph } from './sp-paragraph';
import { spToken } from './sp-token';

export class spSection {
    id = 0;
    public title: spToken | undefined;
    public sectionType: string;
    public paragraphs: Array<spParagraph> = new Array<spParagraph>();
    public isAttribute = false;

    constructor(type: string, title?: spToken|undefined, isAttribute: boolean = false) {
        this.sectionType = type;
        this.title = title;
        this.isAttribute = isAttribute;
    }

    append(paragraph: spParagraph) {
        this.paragraphs.push(paragraph);
        //paragraph.id = this.paragraphs.length;
        return this;
    }

    lastParagraph() {
        return this.paragraphs[this.paragraphs.length - 1];
    }

}
