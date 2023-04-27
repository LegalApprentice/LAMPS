import { Component, OnInit } from '@angular/core';
import { LegalPadService } from '../models/legal-pad.service';
import { LaLegalCase, LaParagraph, LaSentence } from '../models';
import { LaLegalPad } from '../models/la-legalPad';
import { EmitterService, Toast } from '../shared';
import { LegalCaseService } from '../models/legal-case.service';
import { LaLegalSearch } from '@app/models/la-legalSearch';
import { LegalSearchService } from '@app/models/legal-search.service';
import { TagService } from '@app/models/tag.service';

@Component({
  selector: 'app-selections',
  templateUrl: './selections.component.html'
})
export class SelectionsComponent implements OnInit {

  constructor(
    private tagService: TagService,
    private sService: LegalSearchService,
    private cService: LegalCaseService,
    private pService: LegalPadService) { }


  get legalPad(): LaLegalPad {
    return this.pService.legalModel();
  }

  get legalCase(): LaLegalCase {
    return this.cService.legalModel();
  }

  get legalSearch(): LaLegalSearch {
    return this.sService.legalModel();
  }



  ngOnInit(): void {
    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }


  //   const plist = this.getParagraphs().filter( item => item.isItemOfInterest);
  //   plist.forEach(obj => {
  //     paragraphCount += 1
  //     obj.isItemOfInterest = false;
  //     this.pService.addToParagraphGroup(obj);
  //   })

  //   if (sentenceCount + paragraphCount > 0) {
  //     Toast.success(`Added to Group`, `${sentenceCount} sentences ${paragraphCount} paragraphs`)
  //   } else {
  //     Toast.warning("Sentence or Paragraph must be selected first.")
  //   }
  //   return result;
  // }

  doToggleNotes() {
    this.tagService.doToggleNotes();
  }

  doToggleTags() {
    this.tagService.doToggleTags();
  }


  get paragraphCount() {
    return this.getParagraphs().length
  }

  getParagraphs() {
    const list: Array<LaParagraph> = [];
    this.legalPad?.getParagraphsOfInterest().forEach((obj) => {
      list.push(obj)
    })

    this.legalCase?.getParagraphsOfInterest().forEach((obj) => {
      list.push(obj)
    })

    this.legalSearch?.getParagraphsOfInterest().forEach((obj) => {
      list.push(obj)
    })
    return list;
  }

  get sentenceCount() {
    return this.getSentences().length
  }

  getSentences() {
    const list: Array<LaSentence> = [];
    this.legalPad?.getSentencesOfInterest().forEach((obj) => {
      list.push(obj)
    })

    this.legalCase?.getSentencesOfInterest().forEach((obj) => {
      list.push(obj)
    })

    this.legalSearch?.getSentencesOfInterest().forEach((obj) => {
      list.push(obj)
    })

    return list;
  }

  onRefreshDisplay() {

  }



  doClearAll(e:Event) {
    this.getSentences().forEach((obj) => {
      obj.isItemOfInterest = false
    })

    this.getParagraphs().forEach((obj) => {
      obj.isItemOfInterest = false
    })
  }

  doSendToPad(e:Event) {
    let sentenceCount = 0
    let paragraphCount = 0

    this.getSentences().forEach(obj => {
      sentenceCount += 1
      this.pService.broadcastAddSentenceToPad(obj);
    })

    this.getParagraphs().forEach(obj => {
      paragraphCount += 1
      this.pService.broadcastAddParagraphToPad(obj);
    })

    if (sentenceCount + paragraphCount > 0) {
      Toast.success(`Sent to legal pad`, `${sentenceCount} sentences ${paragraphCount} paragraphs`)
    } else {
      Toast.warning("Sentence or Paragraph must be selected first.")
    }
  }
}
