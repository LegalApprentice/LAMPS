import { Component, OnInit } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { LibraryService } from '../models/library.service';
import { TeamsService } from '../models/teams.service';
import { AuthenticationService } from '../login/authentication.service';

import { LaCaseDirectoryItem, LaTeam } from '../models';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  list: Array<LaCaseDirectoryItem>;
  listAllFiles: Array<LaCaseDirectoryItem>;
  teams: Array<LaTeam>;
  currentWorkspace = '';

  constructor(
    private lService: LibraryService,
    private aService: AuthenticationService,
    private tService: TeamsService) {

    EmitterService.registerCommand(this, 'Saved', this.doRefreshWorkspaces);
    EmitterService.processCommands(this);
  }

  doSelectDefaultTeam(team: LaTeam) {
    this.tService.setActiveTeam(team);
    EmitterService.broadcastCommand(this, 'SelectTeam', team);
  }

  public doRefreshWorkspaces() {
    const leader = this.aService.currentUserValue.email;
    const s1 = this.tService.getTeamMembersFor$(leader).subscribe(data => {
      this.teams = data;

      s1.unsubscribe();
    });
  }

  public doRefreshAllFiles() {
    const admin = this.aService.currentUserValue.isAdmin();
    if (admin == true) {
      const s1 = this.lService.getAllCases$().subscribe({
        next: data => {
          this.listAllFiles = data;
          s1.unsubscribe();
        },
        error: (e)=> console.log(e),
        complete: ()=> console.log('complete')
      });
    }
  }

  ngOnInit() {
    this.doRefreshWorkspaces();
    this.doRefreshAllFiles();
  }


}
