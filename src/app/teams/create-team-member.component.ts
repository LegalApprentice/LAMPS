import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmitterService } from '../shared';

import { TeamsService } from '../models/teams.service';
import { LaTeamMember, LaTeam } from '../models';


@Component({
  selector: 'app-create-team-member',
  templateUrl: './create-team-member.component.html',
  styleUrls: ['./create-team-member.component.scss']
})
export class CreateTeamMemberComponent implements OnInit, OnDestroy {
  @Input() team: LaTeam;
  showForm = false;
  submitted = false;

  teamCreateMemberForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private tService: TeamsService) { }

  ngOnInit() {
    this.teamCreateMemberForm = this.formBuilder.group({
      member: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.teamCreateMemberForm = null;
  }

  get f() {
    return this.teamCreateMemberForm.controls;
  }



  doCreate() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.teamCreateMemberForm.invalid) {
      return;
    }

    const result = {
      teamName: this.team.teamName,
      pattern: this.team.pattern,
      workspace: this.team.workspace,
      leader:  this.team.leader,
      member: this.f.member.value,
      invited: true,
      active: false,
    };

    const member = new LaTeamMember(result);

    this.tService.establishTeamMember$(member).subscribe( _ => {
      EmitterService.broadcastCommand(this, 'RefreshTeams');
    });

    this.showForm = false;
  }

  doCreateTeamMember() {
    this.showForm = true;
  }

  doCancel() {
    this.showForm = false;
  }

}
