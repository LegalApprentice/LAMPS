import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmitterService } from '../shared';

import { TeamsService } from '../models/teams.service';
import { LaTeamMember, LaTeam } from '../models';


@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.scss']
})
export class TeamMemberComponent implements OnInit, OnDestroy, OnChanges {
  @Input() team: LaTeam;
  @Input() member: LaTeamMember;


  confirmDelete = false;
  teamMemberForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private tService: TeamsService) { }

  resetTeamMember(obj: LaTeamMember) {
    this.teamMemberForm = this.formBuilder.group({
      member: [obj.member],
      invited: [obj.invited],
      active: [obj.active],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // tslint:disable-next-line: forin
    for (const propName in changes) {
        const change = changes[propName];
        this.resetTeamMember(change.currentValue);
    }
 }

  ngOnInit() {
    this.resetTeamMember(this.member);
  }

  isLeader() {
    return this.member.isLeaderRecord();
  }

  isNotLeader() {
    return !this.member.isLeaderRecord();
  }

  invitedText() {
    return this.f.invited.value ? 'Invited' : 'Not Invited';
  }

  invitedClass() {
    return this.f.invited.value ? 'btn-success' : 'btn-danger';
  }

  doToggleInvite() {
    this.f.invited.setValue(!this.f.invited.value);
  }

  activeText() {
    return this.f.active.value ? 'Active' : 'Not Active';
  }

  activeClass() {
    return this.f.active.value ? 'btn-success' : 'btn-danger';
  }

  doToggleActive() {
    this.f.active.setValue(!this.f.active.value);
  }

  deleteText() {
    return this.confirmDelete ? 'Save' : 'Delete';
  }

  doDeleteMember() {
    this.confirmDelete = !this.confirmDelete;
  }

  doConfirmDelete() {
    this.confirmDelete = false;
    this.tService.deleteTeamMember$(this.member.guidKey).subscribe(_ => {
      EmitterService.broadcastCommand(this, 'RefreshTeams');
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.teamMemberForm.controls;
  }

  doUpdateMember() {
    const result = {
      pattern: this.team.pattern,
      member: this.f.member.value,
      invited: this.f.invited.value,
      active: this.f.active.value,
    };

    this.member.override(result);

    this.tService.establishTeamMember$(this.member).subscribe( _ => {
      EmitterService.broadcastCommand(this, 'RefreshTeams');
    });
  }

  ngOnDestroy() {
    this.teamMemberForm = null;
    this.member = null;
  }



}
