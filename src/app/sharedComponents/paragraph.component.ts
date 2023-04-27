import { Component, OnInit, Input } from '@angular/core';
import { LaParagraph } from '../models';


@Component({
  selector: 'app-paragraph',
  templateUrl: './paragraph.component.html'
})
export class ParagraphComponent implements OnInit {
  @Input() hideFootnotes = false;
  @Input() userCanAddNotesAndTags = false;
  @Input() userCanEdit = true;
  @Input() showImmutable: boolean = true;
  @Input() paragraph: LaParagraph;

  constructor() { }

  ngOnInit() {
  }

  getSentences() {
    return this.paragraph.sentences;
  }

  getFilteredSentences() {
    const result =  this.getSentences();
    // if (this.hideFootnotes ) {
    //   //remove all the footnotes in this view
    //   return result.filter( item => Tools.isEmpty(item.footnoteId));
    // }
    return result;
  }

}
