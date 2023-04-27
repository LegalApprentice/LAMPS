import { spSection } from './sp-section';


export class spDocument {
    attributes: any = {};

    caseNumber = '';
    sections: Array<spSection> = new Array<spSection>();

    isEmpty(): boolean {
        return this.sections.length === 0;
    }

    assert(key: string, value: any) {
        this.attributes[key] = value;
        return this;
    }

    getValue(key: string) {
        return this.attributes[key];
    }

    append(section: spSection) {
        this.sections.push(section);
        section.id = this.sections.length;
        return this;
    }

    toSentences() {
        const sentences: any = [];
        const caseNumber = this.caseNumber 
    
        let p = 0;
        let s = 0;
        this.sections.forEach((sect: { title: any; sectionType: any; paragraphs: any[]; }) => {
          const title = sect.title;
          const sectionType = sect.sectionType;
    
          p++;
          s = 1;
          const obj = {
            sentID: `${caseNumber}P${p}S${s}`,
            text: title && title.asString(),
            isSection: true,
            sectionType,
          };
    
          if (title && !title.isEmpty()) {
            sentences.push(obj);
          }
    
          sect.paragraphs.forEach((prag: { sentences: any[]; }) => {
    
            p++;
            s = 1;
            prag.sentences.forEach((sent: { asString: () => any; }) => {
              let obj: any = {
                sentID: `${caseNumber}P${p}S${s}`,
                text: sent.asString(),
                isSection: false,
                sectionType
              };
    
              //console.log(JSON.stringify(obj,undefined,3))
              if (obj.text.length > 0) {
                sentences.push(obj);
                s++;
              }
            });
          });
        });
    
        return sentences;   
      }
}