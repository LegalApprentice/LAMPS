import { Injectable } from '@angular/core';
import { Toast, IPayloadWrapper } from '../shared';
import { HttpClient } from '@angular/common/http';

import { AuthenticationService } from '../login/authentication.service';

import { LaTeamMember, LaTeam } from '.';
import { environment } from '../../environments/environment';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LaUser } from './la-user';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  get API_URL(): string {
    return environment.libraryURL;
  }

  private _currentTeam: LaTeam;

  public setActiveTeam(team: LaTeam): LaTeam {
    this._currentTeam = team;
    if ( team ) {
      Toast.success(`${team.teamName} is the active team`, team.workspace);
    }
    return this._currentTeam;
  }

  public get activeTeam(): LaTeam {
    return this._currentTeam;
  }

  public get currentWorkspace(): string {
    return this.activeTeam ? this.activeTeam.workspace : 'guest';
  }

  public get currentPattern(): string {
    return this.activeTeam && this.activeTeam.pattern ? this.activeTeam.pattern : 'case-{name}-{version}';
  }




  constructor(
    private http: HttpClient,
    private aService: AuthenticationService) {
  }

  public processTeamUsers(list: Array<any>): Array<LaUser> {
    const memberList = new Array<LaUser>();

    list.forEach( item => {
      const obj = new LaUser(item);
      memberList.push(obj);
    });
    return memberList;
  }

  public processTeamMembers(list: Array<any>): Array<LaTeamMember> {
    const memberList = new Array<LaTeamMember>();


    list.forEach( item => {
      const obj = new LaTeamMember(item);
      memberList.push(obj);
    });

    // presort by leader and then name
    memberList.sort((a, b) => b.memberCompare(a));
    return memberList;
  }

  public processTeams(list: Array<LaTeamMember>): Array<LaTeam> {
    const teamList = new Array<LaTeam>();
    const lookup:  { [name: string]: LaTeam } = {};

    list.forEach( item => {
      const teamName = item.teamName;
      let team = lookup[teamName];

      if ( !team ) {
        team = new LaTeam({
          teamName,
          leader: item.leader,
          pattern : item.pattern,
          workspace: item.workspace
        });
        lookup[teamName] = team;
        if ( teamName === 'Leaders') {
          if ( this.aService.currentUserValue.isAdmin()) {
            teamList.push(team);
          }
        } else {
          teamList.push(team);
        }
      }

      team.addMember(item);
    });

    return teamList;
  }



  public establishTeamMember$(member: LaTeamMember): Observable<Array<LaTeamMember>> {
    const rest = '/Teams/EstablishTeamMember';
    const url = `${this.API_URL}${rest}`;

    return this.http.post<IPayloadWrapper<any>>(url, member).pipe(
      map(res => {
        Toast.success(`${res.length} item updated!`, rest);
        return res.payload;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public establishTeam$(member: LaTeamMember): Observable<Array<LaTeamMember>> {
    const rest = '/Teams/EstablishTeam';
    const url = `${this.API_URL}${rest}`;

    return this.http.post<IPayloadWrapper<any>>(url, member).pipe(
      map(res => {
        Toast.success(`${res.length} team established!`, rest);
        return res.payload;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getAdminTeam$(leader: string): Observable<Array<LaTeam>> {
    const rest = '/Teams/AdminTeam';
    const url = `${this.API_URL}${rest}/${leader}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        let memberList = this.processTeamMembers(res.payload);
        memberList = memberList.filter( obj => obj.teamName == 'Leaders');

        const teamList = this.processTeams(memberList);
        Toast.success(`${res.length} items loaded!`, rest);
        return teamList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getAllTeam$(): Observable<Array<LaTeam>> {
    const rest = '/Teams/AllTeamMembers';
    const url = `${this.API_URL}${rest}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        let memberList = this.processTeamMembers(res.payload);
        memberList = memberList.filter( obj => obj.teamName != 'Leaders');

        const teamList = this.processTeams(memberList);
        teamList.forEach ( item => item.godMode = true);
        Toast.success(`${res.length} items loaded!`, rest);
        return teamList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getTeamForLeader$(leader: string): Observable<Array<LaTeam>> {
    const rest = '/Teams/TeamMembersForLeader';
    const url = `${this.API_URL}${rest}/${leader}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        let memberList = this.processTeamMembers(res.payload);
        memberList = memberList.filter( obj => obj.teamName !== 'Leaders');

        const teamList = this.processTeams(memberList);
        Toast.success(`${res.length} items loaded!`, rest);
        return teamList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getActiveTeamFor$(member: string): Observable<Array<LaTeam>> {
    const rest = '/Teams/TeamMembersForMember';
    const url = `${this.API_URL}${rest}/${member}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        let memberList = this.processTeamMembers(res.payload);
        memberList = memberList.filter( obj => obj.teamName != 'Leaders');

        const teamList = this.processTeams(memberList);
        const team = teamList[0];
        team && this.setActiveTeam(team);
        Toast.success(`${res.length} items loaded!`, rest);


        return this.activeTeam;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getTeamMembersFor$(member: string): Observable<Array<LaTeam>> {
    const rest = '/Teams/TeamMembersForMember';
    const url = `${this.API_URL}${rest}/${member}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        let memberList = this.processTeamMembers(res.payload);
        memberList = memberList.filter( obj => obj.teamName != 'Leaders');

        const teamList = this.processTeams(memberList);
        Toast.success(`${res.length} items loaded!`, rest);
        return teamList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getTeamDetailsForTeam$(teamName: string): Observable<Array<LaUser>> {
    const rest = '/Teams/TeamDetailsForTeam';
    const url = `${this.API_URL}${rest}/${teamName}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        const userList = this.processTeamUsers(res.payload);
        Toast.success(`${res.length} items loaded!`, rest);
        return userList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public deleteTeamMember$(guidKey: string): Observable<Array<LaTeamMember>> {
    const rest = '/Teams/DeleteTeamMember';
    const url = `${this.API_URL}${rest}/${guidKey}`;

    return this.http.delete<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        Toast.success(`${res.length} item deleted!`, rest);
        return res.payload;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public deleteTeam$(teamName: string): Observable<Array<LaTeamMember>> {
    const rest = '/Teams/DeleteTeam';
    const name = encodeURIComponent(teamName);
    const url = `${this.API_URL}${rest}/${name}`;

    return this.http.delete<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        Toast.success(`${res.length} team deleted!`, rest);
        return res.payload;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }



}
