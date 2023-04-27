import { Component, OnInit, Input } from '@angular/core';
import { LaSearchResult } from '../models';

@Component({
  selector: 'app-item-set',
  templateUrl: './item-set.component.html'
})
export class ItemSetComponent implements OnInit {
  @Input() searchResults: Array<LaSearchResult> = [];


  throttle = 300;
  scrollDistance = 1;
  
  constructor() { }

  ngOnInit(): void {
  }

  onScrollDown() {
    // if (!this.pinnedView && this.nextPageUrl) {
    //     const s1 = this.service.searchNextPage$(this.nextPageUrl, this.currentPinContext, this.user).subscribe(({ payload, nextPageUrl }) => {
    //         this.payload = this.payload.concat(payload);
    //         this.displayResults = this.payload;
    //         this.nextPageUrl = nextPageUrl;
    //         s1.unsubscribe();
    //     });
    // }
  }

}
