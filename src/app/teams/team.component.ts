import { Component, OnInit, Input } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { TeamsService } from '../models/teams.service';
import {  LaTeam, LaUser } from '../models';


// https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  @Input() expanded = false;
  @Input() userCanEdit = false;
  @Input() team: LaTeam;

  confirmDelete = false;
  userList: Array<LaUser>;
  leaderDetails: LaUser;

  constructor(
    private tService: TeamsService) {
    }

  ngOnInit() {
    this.loadDetailsForTeam();
  }

  public loadDetailsForTeam() {
    const s1 = this.tService.getTeamDetailsForTeam$(this.team.teamName).subscribe(data => {
      this.userList = data;
      this.leaderDetails = this.team.canDelete() && data.find(obj => obj.email === this.team.leader);
      s1.unsubscribe();
    });
  }

  deleteText() {
    return this.confirmDelete ? 'Save Team' : 'Delete Team';
  }

  doDeleteTeam() {
    this.confirmDelete = !this.confirmDelete;
  }

  doConfirmDeleteTeam() {
    this.confirmDelete = false;

    this.tService.deleteTeam$(this.team.teamName).subscribe(_ => {
      EmitterService.broadcastCommand(this, 'RefreshTeams');
    });
  }



}
