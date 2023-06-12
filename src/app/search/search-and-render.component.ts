import { Component, OnInit, OnDestroy } from '@angular/core';



import { LegalSearchService } from '../models/legal-search.service';
import { LaLegalCase, LaQuery, LaSearchResult, TOPIC_AdvancedQuery } from '../models';
import { Toast, PubSub, EmitterService } from '../shared';
import { LegalCaseService } from '@app/models/legal-case.service';
import { saveAs } from 'file-saver-es';

@Component({
  selector: 'app-search-and-render',
  templateUrl: './search-and-render.component.html'
})
export class SearchAndRenderComponent implements OnInit, OnDestroy {

  searchResults: Array<LaSearchResult>;
  noResultsFound:string = ''
  currentLegalModel: any;
  authService: any;
  teamService: any;
  currentFilename: any;



  constructor(
    private cService: LegalCaseService,
    private sService: LegalSearchService) {

    EmitterService.registerCommand(this, 'SaveCaseFromSearch', this.saveCaseFromSearch);

    EmitterService.processCommands(this);
    }

  ngOnInit(): void {

    PubSub.Sub(TOPIC_AdvancedQuery, (data) => {
      const query: LaQuery = data[0] as LaQuery;
      this.doAdvancedSearch(query);
    });
  }

  ngOnDestroy(): void {
    PubSub.Unsub(TOPIC_AdvancedQuery);
  }

  saveCaseFromSearch(caseID: string) {
    Toast.info(`caseID  ${caseID}`, 'loading from Search...')
    this.sService.findCase$(caseID).subscribe(data => {
      const result = data[0];
      if (result) {
        var caseModel = this.cService.createLegalModel<LaLegalCase>(LaLegalCase, result._source)

        const model = caseModel.asUploadedCase(null, null);
        const blob = new Blob([model.data], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, caseModel.filename);

        EmitterService.broadcastCommand(this, 'Saved from Search...', caseModel.filename);
      } else {
        Toast.warning(`caseID ${caseID} not found in search`)
      }
    })
  }



  doAdvancedSearch(query: LaQuery) {
    this.searchResults = [];
    this.noResultsFound = '';

    const display = query.simplify();

    const q = JSON.stringify(display, undefined, 3);

    var subject = this.sService.advancedQuery$(query)
    subject.subscribe({
      next: (data) => {
        const count = data.length;
        this.searchResults = data;
        this.noResultsFound = count == 0 ? `No Results for query: \r\n${q}`: ''
        this.sService.createCaseOfSearchResults(data);
        console.log(data[0])

        if ( count == 0 ) {
          Toast.error(`${count} results found`);
        } else {
          Toast.success(`${count} results found`);
        }
      },
      error: e => Toast.error(e),
      complete:  () => {
      }
    });
  }





}

