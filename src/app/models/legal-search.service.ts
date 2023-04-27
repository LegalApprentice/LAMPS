import { Injectable } from '@angular/core';
import { Toast, EmitterService, Tools } from '../shared';
import {Injector} from '@angular/core';

import { LaSearchResult, LaSentence, LaFindResult, LaFilename, LaQuery } from '.';


import { ReplaySubject, Subject } from 'rxjs';
import { SearchServiceLocator } from '@app/shared/service-locator';

import { LaParagraph } from './la-paragraph';
import { LaLegalSearch } from './la-legalSearch';
import { LegalModelService } from './legal-model.service';
import { LaLegalModel } from './la-legalModel';

export class advancedSearchDTO {
  includeany: string;
  includeall:  string;
  exactphrase:  string;
  excludeany:  string;

  FindingSentence: boolean;
  EvidenceSentence: boolean;
  LegalRuleSentence: boolean;
  ReasoningSentence: boolean;
  CitationSentence: boolean;

  public clear(): advancedSearchDTO {
    this.includeany = '';
    this.includeall = '';
    this.exactphrase = '';
    this.excludeany = '';

    this.FindingSentence = false;
    this.EvidenceSentence = false;
    this.LegalRuleSentence = false;
    this.ReasoningSentence = false;
    this.CitationSentence = false;
    return this;
  }
}


@Injectable({
  providedIn: 'root'
})
export class LegalSearchService  extends LegalModelService {

  public searchTextList: Array<string>;

  lastSearch:advancedSearchDTO = new advancedSearchDTO()


  constructor(injector: Injector) {
    super(injector);

    EmitterService.registerCommand(this, 'FileOpenSearch', this.onFileOpen);
    EmitterService.registerCommand(this, 'FileSaveSearch', this.onFileSave);
    EmitterService.registerCommand(this, 'AutoSaveSearchAs', this.onAutoSaveAs);

    EmitterService.registerCommand(this, 'SetDirty', this.onSetDirty);
    EmitterService.processCommands(this);

    this.currentFilename = new LaFilename({
      pre: `search`,
      name: Tools.getNowIsoDate().split('.')[0],
    })
  }

  extractLaFilename(): LaFilename {
    if (this.currentLegalModel) {
      this.currentFilename = this.currentLegalModel.extractLaFilename();
      this.currentFilename.pre = 'search'
    }
    return this.currentFilename;
  }

  public getCurrentModel$(): ReplaySubject<LaLegalModel> {
    if (this.modelStream$ == null) {
      this.modelStream$ = new ReplaySubject<LaLegalModel>(1);
    }
    return this.modelStream$;
  }


  addParagraph(paragraph: LaParagraph): LaParagraph {
    this.currentLegalModel?.establishParagraph(paragraph);
    return paragraph;
  }

  queryForParagraph(sentence: LaSentence, callBack: any) {
    const key = sentence.paraIDTag();

    this.findParagraph$(key).subscribe(data => {
      const result = data[0];
      if (result) {
        const paragraph = new LaParagraph(result._source);
        //this.currentLegalSearch.addParagraph(paragraph)
        callBack && callBack(paragraph)
        Toast.success(`Paragraph ${key} found`, `Sentences ${paragraph.sentences.length}`);
      } else {
        Toast.warning(`Paragraph ${key} not found in search`)
      }
    })

  }


  createCaseOfSearchResults(data: Array<LaSearchResult>) {
    const model = this.createLegalModel<LaLegalSearch>(LaLegalSearch, {});

    const sentences = data.map(item => item.sentence)
    sentences.forEach(item => {
      model.establishSentence(item)
    })

    this.getCurrentModel$().next(model)
  }



  readAndRestoreFile(file: File) {

    const reader = new FileReader();
    reader.onerror = event => {
      Toast.error('fail...', JSON.stringify(event.target));
    };
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);

      const model = this.createLegalModel<LaLegalSearch>(LaLegalSearch, data);
      this.currentFilename = this.extractLaFilename();
      this.currentFilename.syncronise(file.name);
      this.getCurrentModel$().next(model);

      Toast.success('Search loading!', model.filename);
    };

    reader.readAsText(file);
  }


  private bold(name: string) {
    return `<b class="boldhighlight">${name}</b>`;
  }

  private replaceSplitJoin(text: string, x: string, y: string) {
    const temp = text.split(x);
    const result = temp.join(y);
    return result;
  }

  private replaceBold(text: string, name: string) {
    return this.replaceSplitJoin(text, name, this.bold(name));
  }

  private textMarkup(rawText: string, listOfWords: Array<string>): string {
    let text = rawText;
    listOfWords.forEach(word => {
      // text = this.replaceBold(text.toLowerCase(), word.toLowerCase());
      text = this.replaceBold(text, word);
      text = this.replaceBold(text, word.toLowerCase());
      text = this.replaceBold(text, Tools.capitalize(word.toLowerCase()));
    });
    text = `&nbsp; &nbsp; ${text}`;
    return text;
  }


  public advancedQuery$(data: LaQuery): Subject<Array<LaSearchResult>> {
    let includeany = data.includeany?.split(' ').filter(item => item.length > 0);
    let includeall = data.includeall?.split(' ').filter(item => item.length > 0);
    let exactphrase = data.exactphrase?.split(' ').filter(item => item.length > 0);
    includeany = includeany ? includeany : [];
    includeall = includeall ? includeall : []
    exactphrase = exactphrase ? exactphrase : []
    this.searchTextList = [...includeany, ...includeall, ...exactphrase];


    if ( data.isEmpty()) {
      Toast.warning("Search Filters Are Empty");
      return;
    }
    const serviceOptions = new SearchServiceLocator({
      serviceKey: 'advancedQuery$',
      endpoint: `/query`
    });

    const localSubject = new Subject<Array<LaSearchResult>>();
    const httpSubject = this.payloadService.esPost$(LaSearchResult, serviceOptions, data);

    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          const payload = result.payload.map(item => {
            const text = item.sentence.text;
            item.innerHTML = this.textMarkup(text, this.searchTextList);
            return item;
          })
          localSubject.next(payload);
        }
        localSubject.complete();
      },
      error: (e) => {
        localSubject.error(e)
        localSubject.complete();
      },
      complete: () => {
        localSubject.complete();
      }
    });

    return localSubject;
  }

  public findCase$(caseID: string): Subject<Array<LaFindResult>> {
    const serviceOptions = new SearchServiceLocator({
      serviceKey: 'findCase$',
      endpoint: `/Case/${caseID}`
    });

    const localSubject = new Subject<Array<LaFindResult>>();
    const httpSubject = this.payloadService.esGet$(LaFindResult, serviceOptions);

    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          localSubject.next(result.payload);
        }
        localSubject.complete();
      },
      error: (e) => {
        localSubject.error(e)
        localSubject.complete();
      },
      complete: () => {
        localSubject.complete();
      }
    });

    return localSubject;
  }


  public findParagraph$(paraID: string): Subject<Array<LaFindResult>> {

    const serviceOptions = new SearchServiceLocator({
      serviceKey: 'findParagraph$',
      endpoint: `/paragraph/${paraID}`
    });

    const localSubject = new Subject<Array<LaFindResult>>();
    const httpSubject = this.payloadService.esGet$(LaFindResult, serviceOptions);

    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          localSubject.next(result.payload);
        }
        localSubject.complete();
      },
      error: (e) => {
        localSubject.error(e)
        localSubject.complete();
      },
      complete: () => {
        localSubject.complete();
      }
    });

    return localSubject;
  }

  public findSentence$(sentID: string): Subject<Array<LaFindResult>> {

    const serviceOptions = new SearchServiceLocator({
      serviceKey: 'findSentence$',
      endpoint: `/sentence/${sentID}`
    });

    const localSubject = new Subject<Array<LaFindResult>>();
    const httpSubject = this.payloadService.esGet$(LaFindResult, serviceOptions);

    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          localSubject.next(result.payload);
        }
        localSubject.complete();
      },
      error: (e) => {
        localSubject.error(e)
        localSubject.complete();
      },
      complete: () => {
        localSubject.complete();
      }
    });


    return localSubject;
  }

}


/**
             {
            "took": 670,
            "timed_out": false,
            "_shards": {
               "total": 8,
               "successful": 8,
               "failed": 0
            },
            "hits": {
               "total": 74,
               "max_score": 1,
               "hits": [
                  {
                     "_index": "2000_270_0",
                     "_type": "Medical",
                     "_id": "02:17447847049147026174478:174159",
                     "_score": 1,
                     "_source": {
                        "memberId": "0x7b93910446f91928e23e1043dfdf5bcf",
                        "memberFirstName": "Uri",
                        "memberMiddleName": "Prayag",
                        "memberLastName": "Dubofsky"
                     }
                  },
**/
