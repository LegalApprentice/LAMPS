import { Component, OnInit, Input } from '@angular/core';
import { LaUserTag } from '@app/models/la-tags';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmitterService, Toast } from '@app/shared';
import { LaTagable } from '../models';
import { TagService } from '@app/models/tag.service';
import { Tools } from '@app/shared/foTools';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html'
})
export class TagsComponent implements OnInit {
  @Input() context: LaTagable;
  isDirty = false

  isNewTagOpen = false;
  submitted = false;

  tagCreationForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private tService: TagService) {
  }

  doClose(event: Event) {
    event?.preventDefault();
    EmitterService.broadcastCommand(this, 'CloseTags');
    if (this.isDirty) {
      EmitterService.broadcastCommand(this, 'SetDirty');
    }
  }

  ngOnInit() {
    this.tagCreationForm = this.formBuilder.group({
      tagName: ['example', Validators.required],
      tagType: ['tag0:[option1,option2,option3];tag1;tag2;tag2']
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.tagCreationForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.tagCreationForm.invalid) {
      return;
    }

    const tagName = this.f.tagName.value;
    if (!Tools.matches(tagName, 'example')) {
      this.tService.tagDefinitions.establishTag(tagName, this.f.tagType.value)
      Toast.success(`Creating tag ${tagName}`, `you're welcome!`);
    } else {
      Toast.error(`No need to create ${tagName}`, `we're sorry!`);
    }
  }



  tagDefinitionList() {
    return this.tService.tagList();
  }

  tagSource() {
    return this.context
  }

  userTagList() {
    return this.tagSource().userTags;

  }

  addTag(item: LaUserTag) {
    const tag = item.duplicate()
    this.tagSource().addUserTag(tag)
    this.isDirty = false
  }

  doCreateNewTag() {
    this.isNewTagOpen = true
  }

  doSaveNewTag() {
    this.onSubmit()
    this.isNewTagOpen = false
  }

  doCancelNewTag() {
    this.isNewTagOpen = false
  }

  doSaveTagsToFile() {
    this.doSaveNewTag()
    this.tService.saveTagsAs("userTags.json")
    this.isDirty = false
  }

  onFileOpen(e: any) {

    const file = e.target.files[0];
    this.tService.loadFile(file)

    this.isNewTagOpen = false
  }

}
