import { Component, OnInit, Input } from '@angular/core';

import { LegalCaseService } from '../models/legal-case.service';
import { LaSentence } from '../models';
import { LegalPadService } from '../models/legal-pad.service';
import { environment } from '@environments/environment';
import { OpenPage, TagService } from '@app/models/tag.service';

@Component({
  selector: 'app-sentence-badge',
  templateUrl: './sentence-badge.component.html'
})
export class SentenceBadgeComponent implements OnInit {
  @Input() sentence: LaSentence;
  selectionFlag:string = ''

  constructor(
    private tService: TagService,
    private lService: LegalCaseService,
    private pService: LegalPadService
  ) { }

  ngOnInit() {
  }

  isFootnotePage() {
    return this.tService.openPage == OpenPage.Footnote;
  }

  isFirstSentence() {
    const result = this.sentence?.sentenceNumber === "1" ? true: false;
    return result;
  }
  

  selectionClass() {
    this.selectionFlag = ''
    var context = this.lService.findParagraph(this.sentence)
    if (context?.isItemOfInterest ) {
      this.selectionFlag = `${context.paraTag()} IS SELECTED`
      return 'item-of-interest-style'
    }
  }

  doToggleParagraphOfInterest() {
    if ( this.sentence ) {
      var context = this.lService.findParagraph(this.sentence);
      if (context ) {
        context.isItemOfInterest = !context.isItemOfInterest;
      }
    }
  }

  getSentenceBadges() {
    const keys = this.sentence ? [this.sentence] : [];
    return keys;
  }


  doToggleSentenceOfInterest() {
    return this.setIsSentenceOfInterest(!this.getIsSentenceOfInterest())
  }

  getIsSentenceOfInterest() {
    return this.sentence.isItemOfInterest;
  }

  setIsSentenceOfInterest(value: boolean) {
    this.tService.clearPostEdit()
    this.sentence.isItemOfInterest = value;
  }

}
