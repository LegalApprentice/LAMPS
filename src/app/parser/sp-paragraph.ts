import { spParser, spSentence } from '.';
import { spToken } from './sp-token';


export class spParagraph {
    id:string = '';
    text!: string;
    groups!: any;
    sets!: any;
    sentences: Array<spSentence> = new Array<spSentence>();

    constructor(sentence?: spSentence) {
        sentence && this.appendSentence(sentence);
    }

    isEmpty(): boolean {
        return this.sentences.length === 0;
    }

    clearAll(): spParagraph {
        this.sentences = new Array<spSentence>();
        return this;
    }

    createSentenceFromToken(token: spToken) {
        const sentence = new spSentence(token);
        this.appendSentence(sentence);
        return sentence;
    }


    appendSentence(sentence: spSentence) {
        this.sentences.push(sentence);
        //sentence.id = this.sentences.length;
        return this;
    }

    firstSentence() {
        return this.sentences[0];
    }

    lastSentence() {
        return this.sentences[this.sentences.length - 1];
    }

    asString() {
        const reducer = (accumulator: string, currentValue: spSentence) => `${accumulator} ${currentValue.asString()}`;
        return this.sentences.reduce(reducer, '');
    }

    createGroups(): Array<string> {
        if (this.text.endsWith('||')) {
            this.text = this.text.substring(0, this.text.length - 2);
        }
        const list = this.text.split('||')
        return list.map(item => item.trim());
    }

    parseGroupsIntoSets(parser: spParser): Array<string> {
        this.sets = new Array<string>();

        let groups = this.createGroups()

        groups.forEach((item: string) => {
            parser.setBuffer(item.trim())
            let text = parser.getSentence();
            //console.log(text)
            //console.log('-----------------------------------------------------')
            while (text.length > 0) {
                this.sets.push(text);
                text = parser.getSentence();
            }
        });
        return this.sets;
    }

}