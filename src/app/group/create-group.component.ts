import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateGroupSpec } from '@app/models/la-group';
import { EmitterService } from '@app/shared';



@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit, OnDestroy {
  createGroupForm: FormGroup;
  groupInfo: CreateGroupSpec = new CreateGroupSpec();
  success: boolean = false;

  constructor(
    private formBuilder: FormBuilder) {
  }

  resetGroupInfo(groupInfo: CreateGroupSpec) {
    this.createGroupForm = this.formBuilder.group({
      groupIDs: [groupInfo.groupIDs, Validators.required],
      title: [groupInfo.title, Validators.required],
      description: [groupInfo.description],
      category: [groupInfo.category],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const change = changes[propName];
      this.resetGroupInfo(change.currentValue);
    }
  }

  doCancel() {
    this.success = false;
  }

  doCreate() {
    this.success = true;
  }


  ngOnInit() {
    this.resetGroupInfo(this.groupInfo.setToEmpty());
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.createGroupForm.controls;
  }

  onSubmit() {
    const result = {
      title: this.f.title.value,
      description: this.f.description.value,
      category: this.f.category.value,
    };

    if (this.createGroupForm.invalid) {
      return;
    }
    
    this.groupInfo.override(result);

    if (!this.success) {
      EmitterService.broadcastCommand(this, 'CloseCreateGroup');
    } else {
      EmitterService.broadcastCommand(this, 'CreateGroup', this.groupInfo);
      EmitterService.broadcastCommand(this, 'SetDirty');
    }
    this.success = false;
  }

  ngOnDestroy() {
    this.createGroupForm = null;
    this.groupInfo = null;
  }

}
