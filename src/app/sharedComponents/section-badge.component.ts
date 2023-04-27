import { Component, OnInit, Input } from '@angular/core';

import { LegalCaseService } from '../models/legal-case.service';
import { LaSentence } from '../models';
import { EmitterService, Tools } from '@app/shared';
import { OpenPage, TagService } from '@app/models/tag.service';



@Component({
  selector: 'app-section-badge',
  templateUrl: './section-badge.component.html'
})
export class SectionBadgeComponent implements OnInit {
  @Input() sentence: LaSentence;
  isDirty = false

  targets: LaSentence[] = new Array<LaSentence>()

  issection = false;
  renametext: string = ''
  showEditor: boolean = false;

  constructor(
    private tService: TagService,
    private cService: LegalCaseService
  ) { }

  isFootnotePage() {
    return this.tService.openPage == OpenPage.Footnote;
  }

  ngOnInit() {
    this.isDirty = false;
    this.issection = this.sentence.isSection;
    this.renametext = this.sentence.GetSectionType();
    const para = this.cService.findParagraph(this.sentence);
    para?.sentences.forEach(item => {
      this.targets.push(new LaSentence(item))
    })

  }

  onRenameChange(ev: Event) {
    this.doApply()
  }

  getSectionBadges() {
    const keys = this.sentence ? this.sentence.getSectionBadges() : [];
    return keys;
  }

  getPossableSection() {
    const sections = this.cService.getUniqueSection()
    return sections
  }

  onSectionBeginChanged(ev:Event){
    let sent = this.targets[0]
    sent.isSection = this.issection;
  }

  doToggleSection(){
    this.issection = !this.issection
    let sent = this.targets[0]
    sent.isSection = this.issection;
  }

  changedTargets() {
    return this.targets;
  }

  doChangeSection(section: string) {
    if ( this.isFootnotePage() ) return;
    this.showEditor = !this.showEditor;
  }

  doApplyItem(item:string){
    if ( this.isDirty && Tools.matches(this.renametext, item)) {
      this.doExecute()
      return;
    }
    this.renametext = item;
    this.doApply();
  }

  doApply() {
    this.isDirty = true;
    this.tService.clearPostEdit();

    this.targets.forEach(item => {
      //remember the service will do the footnotes
      this.cService.setSentenceSection(item,this.renametext, item.isFirst ? this.issection : false);
    })
  }

  doExecute() {
    try {
      const para = this.cService.findParagraph(this.sentence);
      //remember the service will do the footnotes
      para && this.cService.setParagraphSection(para,this.renametext, this.issection);
    } catch {}
    this.doClose();
  }

  doCancel() {
    this.isDirty = false
    this.tService.clearPostEdit();
    this.doClose();
  }



  doClose(event?: Event) {
    this.showEditor = false;
    event?.preventDefault();
    if (this.isDirty) {
      EmitterService.broadcastCommand(this, 'SetDirty');
    }
    this.isDirty = false;
  }






}
