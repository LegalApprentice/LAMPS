import { Component, Input, OnInit } from '@angular/core';
import { LaResolvable, LaSentence } from '@app/models';
import { LegalCaseService } from '@app/models/legal-case.service';
import { Tools } from '@app/shared';

@Component({
  selector: 'app-group-badge',
  templateUrl: './group-badge.component.html'
})
export class GroupBadgeComponent implements OnInit {
  @Input() sentence: LaResolvable;

  constructor(private cService: LegalCaseService) { }


  ngOnInit(): void {
  }

  hasGroup() {
    return Tools.isEmpty(this.sentence?.groupIDs) ? false : true;
  }

  groupID() {
    return this.sentence?.groupIDs;
  }

}
