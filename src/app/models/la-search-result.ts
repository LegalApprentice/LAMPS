import { LaAtom } from '../shared';
import { LaSentence } from './la-sentence';
import { environment } from '../../environments/environment';

export class LaFindResult extends LaAtom {
    _index: any;
    _type: any;
    _id: any;
    _score: any;
    _source: any;

    constructor(properties?: any) {
        super(properties);
    }
}

export class LaSearchResult extends LaFindResult {
    innerHTML: string;
    sentence: LaSentence;

    constructor(properties?: any) {
        super(properties);

        this.sentence = new LaSentence(properties._source);
    }

    get isSelected() {
        return this.sentence?.isItemOfInterest;
    }

    get rawText() {
        return this.sentence.text;
    }

    get formatedScore() {
        const data = Math.round(100 * this._score) / 100;
        return data;
    }


    get RhetClassLabel() {
        return `${this.sentence.getRhetClass()}`;
    }

    get CaseNoLabel() {
        return `Case No. ${this.sentence.caseNumber}`;
    }
    get SearchScoreLabel() {
        return `Search Score ${this.formatedScore}`;
    }

    get caseNumber() {
        return this.sentence.caseNumber;
    }

    CaseLink() {
      //https://localhost:44360/legalmarker/#/case/case1800023
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port;
      var url = `${protocol}//${hostname}:${port}/legalmarker/#/case/${this.caseNumber}`
      //var url = `${environment.launchMarkerEndpoint}`
      return url;
    }

}
