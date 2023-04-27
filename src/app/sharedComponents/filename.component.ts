import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmitterService } from '../shared';

import { LaFilename } from '../models';

/// very smart forms from data
// https://juristr.com/blog/2017/10/demystify-dynamic-angular-forms/
// https://mdbootstrap.com/docs/angular/forms/inputs/

// https://getbootstrap.com/docs/4.0/components/forms/


@Component({
  selector: 'app-filename',
  templateUrl: './filename.component.html'
})
export class FilenameComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filenameInfo: LaFilename;
  success: boolean = false;
  filenameInfoForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
  }


  resetfilenameInfo(filenameInfo: LaFilename) {
    this.filenameInfoForm = this.formBuilder.group({
      pre: [filenameInfo.pre],
      version: [filenameInfo.version],
      name: [filenameInfo.name],
      extension: [filenameInfo.extension],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const change = changes[propName];
      this.resetfilenameInfo(change.currentValue);
    }
  }

  doCancel() {
    this.success = false;
  }

  doSave() {
    this.success = true;
  }


  ngOnInit() {
    this.resetfilenameInfo(this.filenameInfo);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.filenameInfoForm.controls;
  }

  onSubmit() {
    const result = {
      pre: this.f.pre.value,
      name: this.f.name.value,
      version: this.f.version.value,
      extension: this.f.extension.value,
    };

    if (this.filenameInfoForm.invalid) {
      return;
    }

    EmitterService.broadcastCommand(this, 'ToggleFilenameOpen');
    if (this.success) {
      this.filenameInfo.override(result);
      EmitterService.broadcastCommand(this, 'ForceFileSave');
    }
    this.success = false;
  }

  ngOnDestroy() {
    this.filenameInfoForm = null;
    this.filenameInfo = null;
  }

}
