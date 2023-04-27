import { Tools } from '../shared';
import { spParagraph } from './sp-paragraph';
import { spSection } from './sp-section';
import { spToken } from './sp-token';

export class spPage {


    text!: string;
    rawtext!: string;
    footnoteIds: string[] = Array<string>();
    foundfootnoteIds: string[] = Array<string>();
    missedIds: string[] = Array<string>();

    constructor() {
        this.text = '';
        this.rawtext = '';
    }

    isEmpty() {
        return Tools.isEmpty(this.text);
    }

    mergePage(page: spPage) {
        this.text += page.text
        this.footnoteIds.concat(page.footnoteIds);
    }

    endsWithPeriod() {
        const ends = this.text.endsWith('. ');
        return ends ? true : false;
    }


    startsWithCapLetter() {
        let firstChar = this.text[0];
        if (firstChar == ' ') {
            firstChar = this.text[1];
        }
        return firstChar !== firstChar.toLowerCase();
    }

    endsWithCapLetter() {
        let length = this.text.length - 1;
        let lastChar = this.text[length];
        return lastChar !== lastChar.toLowerCase();
    }

    copyPage(page: spPage) {
        this.text = page.text
        this.footnoteIds = page.footnoteIds;
    }

    static findAndReplaceCase1(obj: spPage, id: string, pos:number): number {
        const case1 = `.${id} `;
        const case2 = `. ${id} `;
        const case3 = `.${id}`;
        const replace = `.{{${id}}}||`;
        //there should only be one
        let found = obj.text.indexOf(case1,pos);
        if (found >= 0) {
            const before = obj.text[found-1]; //footnotes are not part of a number like 5.64
            if ( !( before >= '0' && before <= '9' )) {
                obj.text = obj.text.replace(case1, replace);
                return found;
            }
        }
        found = obj.text.indexOf(case2,pos);
        if (found >= 0) {
            obj.text = obj.text.replace(case2, replace);
            return found;
        }
        if ( obj.text.endsWith(case3)){
            found = obj.text.length; 
            obj.text = obj.text.replace(case3, replace);
        }
        return found;
    }



    static findAndReplaceCase2(obj: spPage, id: string, pos:number): number {
        const case1 = `\"${id} `;
        const replace = `\"{{${id}}}||`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase3(obj: spPage, id: string, pos:number): number {
        const case1 = `.${id}\r`;
        const replace = `.{{${id}}}||\r`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        const before = obj.text[found-1]; //footnotes are not part of a number like 5.64
        if ( before >= '0' && before <= '9' ) return -1;
        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase4(obj: spPage, id: string, pos:number): number {
        const case1 = `${id}\r\n`;
        const replace = `{{${id}}}||`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase5(obj: spPage, id: string, pos:number): number {
        const case1 = `,${id}`;
        const replace = `,{{${id}}}`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase6(obj: spPage, id: string, pos:number): number {
        const case1 = `;${id}`;
        const replace = `;{{${id}}}`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase7(obj: spPage, id: string, pos:number): number {
        const case1 = `. ${id} `;
        const replace = `.{{${id}}}||`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase8(obj: spPage, id: string, pos:number): number {
        const case1 = `:${id} `;
        const replace = `:{{${id}}}||`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase9(obj: spPage, id: string, pos:number): number {
        const case1 = `\r\n ${id} `;
        const replace = `{{${id}}}||`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceCase10(obj: spPage, id: string, pos:number): number {
        const case1 = `${id}; `;
        const replace = `{{${id}}};||`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceTrailingSpace(obj: spPage, id: string, pos:number): number {
        const case1 = `${id} `;
        const replace = `{{${id}}} `;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        const before = obj.text[found-1]; //footnotes are not part of a number like 5.64
        if ( before == '.' ) return -1;
        if ( before >= '0' && before <= '9' ) return -1;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    static findAndReplaceAnything(obj: spPage, id: string, pos:number): number {
        const case1 = `${id}`;
        const replace = `{{${id}}}`;
        //there should only be one
        const found = obj.text.indexOf(case1,pos);
        if (found == -1) return found;

        const before = obj.text[found-1]; //footnotes are not part of a number like 5.64
        if ( before == '.' ) return -1;
        if ( before >= '0' && before <= '9' ) return -1;

        obj.text = obj.text.replace(case1, replace);
        return found;
    }

    findAndReplaceFootnote(id: string): boolean {
        const list = [
            spPage.findAndReplaceCase1,
            spPage.findAndReplaceCase2,
            spPage.findAndReplaceCase3,
            spPage.findAndReplaceCase4,
            spPage.findAndReplaceCase5,
            spPage.findAndReplaceCase6,
            spPage.findAndReplaceCase7,
            spPage.findAndReplaceCase8,
            spPage.findAndReplaceCase9,
            spPage.findAndReplaceCase10,
            spPage.findAndReplaceTrailingSpace,
            spPage.findAndReplaceAnything,
        ]

        for (var i = 0; i < list.length; i++) {
            const funct = list[i];
            let loc = funct(this, id, 0)
            if (loc != -1 ) return true;
        }
        return false;
    }

    replaceAll(text: string, x: string, y: string) {
        const len = y.length;
        let result = text;
        let found = result.indexOf(x);
        while (found !== -1) {
            result = result.replace(x, y);
            found = result.indexOf(x, found + len);
        }
        return result;
    }

    doCleanText() {
        this.text = this.replaceAll(this.rawtext, '\u0002', '');
    }

    doFootnoteMarkup() {
        this.doCleanText()

        this.footnoteIds.forEach(id => {
            if (this.findAndReplaceFootnote(id)) {
                this.foundfootnoteIds.push(id)
            }
        })

        if (this.foundfootnoteIds.length != this.footnoteIds.length) {
            this.footnoteIds.forEach(id => {
                const found = this.foundfootnoteIds.find(item => item == id);
                if (!found) {
                    this.missedIds.push(id)
                    console.log('missed footnote ', id)
                }
            })
        }
    }

    createParagraphs(): Array<spParagraph> {
        const paragraphs: Array<spParagraph> = new Array<spParagraph>();

        const list = this.text.split('\r\n')
        list.forEach(item => {
            const para = new spParagraph();
            para.text = item.trim();
            paragraphs.push(para);
        })

        return paragraphs;
    }

}