import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmitterService } from '../shared';

import { LaCaseCoreInfo } from '../models';

/// very smart forms from data
// https://juristr.com/blog/2017/10/demystify-dynamic-angular-forms/
// https://mdbootstrap.com/docs/angular/forms/inputs/

// https://getbootstrap.com/docs/4.0/components/forms/


@Component({
  selector: 'app-case-title',
  templateUrl: './case-title.component.html'
})
export class CaseTitleComponent implements OnInit, OnDestroy, OnChanges {
  @Input() caseInfo: LaCaseCoreInfo;
  isOpen = false;

  caseInfoForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
  }

  isPanelOpen() {
    return this.isOpen && this.caseInfo
  }

  doOpenPanel(event:Event) {
    if ( !this.caseInfo ) return;
    this.isOpen = true;
  }

  doClosePanel(event:Event) {
    this.isOpen = false;
  }

  resetCaseInfo(caseInfo:LaCaseCoreInfo) {
    this.caseInfoForm = this.formBuilder.group({
      openedFileName: [caseInfo.openedFileName],
      version: [caseInfo.version],
      title: [caseInfo.title],
      description: [caseInfo.description],
      notes: [caseInfo.notes],
      keywords: [caseInfo.keywords],
      metadata: [caseInfo.metadata],
      owner: [caseInfo.owner || 'Author'],
      source: [caseInfo.source],
      name: [caseInfo.name],
      extension: [caseInfo.extension],
      lastChange: [caseInfo.lastChange],
      nextFileName: [caseInfo.nextFileName],
      prevFileName: [caseInfo.prevFileName],
      workspace: [caseInfo.workspace],
      guidKey: [caseInfo.guidKey]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
        const change = changes[propName];
        this.resetCaseInfo(change.currentValue);
    }
 }

  ngOnInit() {
    this.resetCaseInfo(this.caseInfo);
  }

    // convenience getter for easy access to form fields
    get f() {
      return this.caseInfoForm.controls;
    }

    onSubmit() {
      const result = {
        openedFileName: this.f.openedFileName.value,
        version: this.f.version.value,
        title: this.f.title.value,
        description: this.f.description.value,
        notes: this.f.notes.value,
        keywords: this.f.keywords.value,
        source: this.f.source.value,
        metadata: this.f.metadata.value,
        owner: this.f.owner.value || 'author',
        name: this.f.name.value,
        extension: this.f.extension.value,
        lastChange: this.f.lastChange.value,
        nextFileName: this.f.nextFileName.value,
        prevFileName: this.f.prevFileName.value,
        workspace: this.f.workspace.value,
        guidKey: this.f.guidKey.value,
      };
      // const msg = JSON.stringify(result, undefined, 3);
      // Toast.success('captured ', msg);
      this.caseInfo.override(result);

      this.isOpen = false;
      EmitterService.broadcastCommand(this, 'SetDirty');
    }

    ngOnDestroy() {
      this.caseInfoForm = null;
      this.caseInfo = null;
    }

}
