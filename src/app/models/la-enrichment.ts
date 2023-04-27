import { LaAtom } from '../shared/la-atom';

import { Tools } from '@app/shared';
import { LaSentence } from './la-sentence';
import { LaUser } from '.';
import { environment } from '@environments/environment';


export class LaPrediction extends LaAtom {
    label: string;
    prediction: number;

    constructor(properties?: any) {
        super(properties)
    }
}

export class LaEnrichment extends LaAtom {

    private sentence: LaSentence;
    category:string = '';
    text: string = '';
    classification: string;
    predictions: any;
    private showMLPredections:boolean = false;
    private predictionList: Array<LaPrediction>;
    private mlPredictionList: Array<LaPrediction>;

    constructor(properties?: any) {
        super(properties)

        this.predictionList = this.capturePredictionData(this.predictions)
    }

    mergePreditions(predictions:any, prefix:string = ''){
        const keys = Object.keys(predictions);

        keys.forEach(key => {
            const obj = new LaPrediction({
                label: `${prefix}${Tools.capitalize(key)}`,
                prediction: Tools.formatPrediction(predictions[key])
            });
            const found = this.predictionList.find(item => item.label == obj.label);
            if ( !found ) {
                this.predictionList.push(obj);
            }
        });

        this.predictionList = this.predictionList.sort((a, b) => b.prediction - a.prediction);

    }

    applyPredictionToSentence(obj: LaPrediction, user: LaUser) {
        //apply to every sentences predicted to be this type above this threshold
        this.sentence.writeLabel(this.category,obj.label,user?.email);
        this.sentence.writeProbability(this.category,obj.prediction);
    }

    extractFromSentence() {
        const data = this.sentence.forecast;
        if ( data ) {
            const source = data[this.category];
            if (source && source.predictions) {
                const list = this.capturePredictionData(source.predictions);
                this.mlPredictionList = list;
                this.showMLPredections = true;
            }
        }
        return this.mlPredictionList
      }

    setSentence(sentence: LaSentence): LaEnrichment{
        this.sentence = sentence;
        if ( this.sentence.getRhetClass() ) {
            this.extractFromSentence();
        }
        return this;
    }

    setCategory(category: string): LaEnrichment{
        this.category = category;
        return this;
    }

    getPredictionList() {
        return this.showMLPredections ? this.mlPredictionList : this.predictionList;
    }


    private capturePredictionData(predictions:any, prefix:string = '') {

        const keys = Object.keys(predictions);

        let list = [];
        keys.forEach(key => {
            const obj = new LaPrediction({
                label: `${prefix}${Tools.capitalize(key)}`,
                prediction: Tools.formatPrediction(predictions[key])
            });
            list.push(obj);
        });

        list = list.sort((a, b) => b.prediction - a.prediction);
        return list;
    }

}

export class LaEnrichmentSet extends LaAtom {
    private sentence: LaSentence;
    serviceResult: any;
    enrichments: Array<LaEnrichment> = new Array<LaEnrichment>();

    constructor(properties?: any) {
        super()
        Tools.applyOverKeyValue(properties, (key: string, value: any)=> {
            const enrich = new LaEnrichment(value);
            enrich.setCategory(key);
            this.enrichments.push(enrich);
        })
    }

    mergeDefaults(properties?: any){
        Tools.applyOverKeyValue(properties, (key: string, value: any)=> {
            const found = this.enrichments.find(item => item.category == key);
            if ( found ) {
                found.mergePreditions(value.predictions);
            }

        })
    }

    setSentence(sentence: LaSentence): LaEnrichmentSet{
        this.sentence = sentence;
        this.enrichments.forEach( x => x.setSentence(sentence));
        return this;
    }

    filteredEnrichments():  Array<LaEnrichment> {
        if ( this.sentence.isFindingSentence()) {
            return this.enrichments;
        }
        return [this.enrichments[0]]
    }
}
