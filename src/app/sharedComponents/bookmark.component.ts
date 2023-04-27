import { Component, Input, OnInit } from '@angular/core';
import { LaSentence } from '@app/models';
import { LegalCaseService } from '@app/models/legal-case.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html'
})
export class BookmarkComponent implements OnInit {
  @Input() sentence: LaSentence;

  constructor(private cService: LegalCaseService) { }

  ngOnInit(): void {
  }

  doToggleBookmark() {
    //first turn off all the others...
    //if (this.isActive()) {
      this.sentence.toggleBookmark()
    //}

    if (this.isActive()) {
      this.cService.gotoNextBookmark(this.sentence.anchorTag())
    }
  }

  isActive() {
    return this.sentence.isBookmark ? true : false;
  }

  isNotActive() {
    return this.sentence.isBookmark ? false : true;
  }

}
