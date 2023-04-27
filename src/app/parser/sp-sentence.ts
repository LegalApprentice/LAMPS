import { LaSentence } from '@app/models';
import { spToken } from './sp-token';

export class spSentence {

    id: string = '';
    isSection: boolean = false;
    sectionType: string = ''

    tokens: Array<spToken> = new Array<spToken>();

    footnoteRefs!: { [name: string]: string };


    constructor(token?: spToken) {
        token && this.append(token);
    }

    onlyGroupedTokens():Array<spToken>{
        return this.tokens.filter ( item => item.isGrouped() );
    }
    
    isEmpty(): boolean {
        return this.tokens.length === 0;
    }

    append(token: spToken) {
        this.tokens.push(token);
        return this;
    }

    lastToken() {
        const token = this.tokens[this.tokens.length - 1];
        return token;
    }

    endsWith(str: string) {
        const token = this.lastToken();
        return token.endsWith(str);
    }

    asString():string {
        const reducer = (accumulator: string, currentValue: spToken) => {
            if (accumulator.length === 0) {
                return currentValue.text;
            }
            return `${accumulator} ${currentValue.text}`;
        };
        return this.tokens.reduce(reducer, '');
    }

    asSentenceList(context:LaSentence):LaSentence[] {
        const splits = new Array<spSentence>();
        let current = new spSentence();
        this.tokens.forEach( token => {
            current.append(token)
            if ( token.isTerminator ) {
                splits.push(current);
                current = new spSentence();
            }
        })
        splits.push(current);

        let renum:number = 1;
        const result = splits.map( item =>
        {
            const sent = new LaSentence(context)
            sent.text = item.asString();
            sent.sentenceNumber += renum/10;
            sent.renumId += renum/10;
            renum++;
            return sent;
        });
        return result;
    }

    addFootnoteRefs(id: string, noteID: string) {
        if (!this.footnoteRefs) {
            this.footnoteRefs = {}
        }
        this.footnoteRefs[id] = noteID;
    }

    getFootnoteRefs(caseNumber: string) {
        this.tokens.forEach(item => {
            if (item.contains('{{')) {
                const id = item.extractFootnote();
                this.addFootnoteRefs(id, `${caseNumber}N${id}`)
                // const s1 = `{{${id}}}`
                // const s2 = `[FN${id}]`
                // item.replace(s1,s2)
            }
        })
        return this.footnoteRefs
    }

    findFootnoteRefNumber():number {
        let id = 0;
        const found = this.tokens.find(item => item.isFootnoteRef());
        if ( found ) {
            found.replaceAll('{{', '');
            found.replaceAll('}}','');
            id = parseInt(found.asString(),10);
        }
        return id;
    }
    mergeTextFrom(sentence: spSentence) {
        sentence.tokens.forEach(tok => {
            this.append(tok);
        });
        return this;
    }

}




