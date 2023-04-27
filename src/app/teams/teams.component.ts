import { Component, OnInit, Input } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { TeamsService } from '../models/teams.service';
import { AuthenticationService } from '../login/authentication.service';
import { LaTeam, LaUser } from '../models';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  @Input() userCanEdit = true;
  adminList: Array<LaTeam>;
  leaderList: Array<LaTeam>;
  memberList: Array<LaTeam>;
  godmodeTeamList: Array<LaTeam>;
  godmodeUsersList: Array<LaUser>;

  constructor(
    private lService: TeamsService,
    private aService: AuthenticationService) {

    EmitterService.registerCommand(this, 'RefreshTeams', this.doRefresh);

    EmitterService.processCommands(this);
  }

  public isFirstInList(item, list) {
    return item === list && list[0];
  }

  public doRefreshMembership() {
    const member = this.aService.currentUserValue.email;
    const s1 = this.lService.getTeamMembersFor$(member).subscribe(data => {
      this.memberList = data;
      s1.unsubscribe();
    });
  }

  public doRefreshLeadership() {
    const leader = this.aService.currentUserValue.email;
    const s1 = this.lService.getTeamForLeader$(leader).subscribe(data => {
      this.leaderList = data;
      s1.unsubscribe();
    });
  }

  public doRefreshAdmin() {
    const admin = this.aService.currentUserValue.isAdmin();
    if (admin === true) {
      const leader = this.aService.currentUserValue.email;
      const s1 = this.lService.getAdminTeam$(leader).subscribe(data => {
        this.adminList = data;
        s1.unsubscribe();
      });
    }
  }

  public doRefreshGodmodeTeams() {
    const admin = this.aService.currentUserValue.isAdmin();
    if (admin === true) {
      const s1 = this.lService.getAllTeam$().subscribe(data => {
        this.godmodeTeamList = data;
        s1.unsubscribe();
      });
    }
  }

  public doRefreshGodmodeUsers() {
    const admin = this.aService.currentUserValue.isAdmin();
    if (admin === true) {
      const s1 = this.aService.getAllUsers$().subscribe(data => {
        this.godmodeUsersList = data;
        s1.unsubscribe();
      });
    }
  }

  public doRefresh() {
    this.doRefreshAdmin();
    this.doRefreshLeadership();
    this.doRefreshMembership();
    this.doRefreshGodmodeTeams();
    this.doRefreshGodmodeUsers();
  }

  ngOnInit() {
    this.doRefresh();
  }



}
