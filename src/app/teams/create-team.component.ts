import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmitterService } from '../shared';

import { TeamsService } from '../models/teams.service';
import { AuthenticationService } from '../login/authentication.service';
import { LaTeamMember } from '../models';

import { Tools } from '../shared';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss']
})
export class CreateTeamComponent implements OnInit, OnDestroy {
  showForm = false;
  submitted = false;
  teamCreateForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private aService: AuthenticationService,
    private tService: TeamsService) { }



  ngOnInit() {

    const pattern = 'BVA{name}-PTSD-{version}';

    this.teamCreateForm = this.formBuilder.group({
      teamName: ['', Validators.required],
      workspace: ['', Validators.required],
      pattern: [pattern, Validators.required]
    });
  }

  ngOnDestroy() {
    this.teamCreateForm = null;
  }

  get f() {
    return this.teamCreateForm.controls;
  }


  doCreateAndPost() {
    this.submitted = true;

    const workspace = Tools.toVirtualFolder(this.f.workspace.value);
    this.f.workspace.setValue(workspace);

    // stop here if form is invalid
    if (this.teamCreateForm.invalid) {
      return;
    }

    const leader = this.aService.currentUserValue.email;



    const result = {
      teamName: this.f.teamName.value,
      workspace: this.f.workspace.value,
      pattern: this.f.pattern.value,
      leader,
      member: leader,
      invited: true,
      active: true,
    };

    const member = new LaTeamMember(result);

    this.tService.establishTeam$(member).subscribe( _ => {
      EmitterService.broadcastCommand(this, 'RefreshTeams');
    });

    this.showForm = false;
  }

  doCreateTeam() {
    this.showForm = true;
  }

  doCancel() {
    this.showForm = false;
  }

}
