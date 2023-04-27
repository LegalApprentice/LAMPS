import { Component, OnInit, Input } from '@angular/core';

import { LaUser } from '../models';

@Component({
  selector: 'app-team-member-display',
  templateUrl: './team-member-display.component.html',
  styleUrls: ['./team-member-display.component.scss']
})
export class TeamMemberDisplayComponent implements OnInit {
  @Input() user: LaUser;
  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.user = null;
  }

}
