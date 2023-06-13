import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Toast } from '../shared/emitter.service';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LaUser, Login } from '../models';
import { IPayloadWrapper } from '@app/shared';


const CURRENTUSER = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  get API_URL(): string {
    return environment.loginURL;
  }

  private currentUserSubject: BehaviorSubject<LaUser>;

  //https://stackoverflow.com/questions/53618872/angular-6-unable-to-set-content-type-of-http-header-correctly


  constructor(private http: HttpClient) {
    try {
      const storedUser = JSON.parse(localStorage.getItem(CURRENTUSER));
      const user = storedUser ? new LaUser(storedUser) : null;
      this.currentUserSubject = new BehaviorSubject<LaUser>(user);
    } catch (ex) { }
  }

  public get currentUserValue(): LaUser {
    return this.currentUserSubject.value;
  }


  public get isCurrentUserAdmin(): boolean {
    return this.currentUserValue ? this.currentUserValue.isAdmin() : false;
  }



  public processUsers(payload: Array<any>): Array<LaUser> {
    const list = new Array<LaUser>();

    payload.forEach(item => {
      const obj = new LaUser(item);
      list.push(obj);
    });

    return list;
  }

  localLogin(username: string): LaUser{
    const user = new LaUser({
      username
    });

    this.currentUserSubject = new BehaviorSubject<LaUser>(user);
    localStorage.setItem(CURRENTUSER, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  login(login: Login, done: () => void): Observable<LaUser> {
    const url = `${this.API_URL}/Users/Authenticate`;
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };


    return this.http.post<IPayloadWrapper<any>>(url, login, options).pipe(
      map(result => {
        done && done();

        if (result.hasError) {
          Toast.error(result.message);
          return of<any>();
        }

        // login successful if there's a jwt token in the response
        const user = this.processUsers(result.payload)[0];
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(CURRENTUSER, JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }
        return of<any>();
      }),
      catchError(error => {
        done && done();
        if (error && error.hasError) {
          Toast.error(error.message);
        } else {
          Toast.error(error);
        }
        return of<any>();
      })
    );
  }

  register(user: LaUser, done: () => void): Observable<LaUser> {
    const url = `${this.API_URL}/Users/Register`;
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    if (environment.isLegalMarker) {
      done && done();
    }

    return this.http.post<IPayloadWrapper<any>>(url, user, options).pipe(
      map(result => {
        done && done();

        if (result.hasError) {
          Toast.error(result.message);
          return of<any>();
        }

        // Toast.success("Registration successful");
        const user = this.processUsers(result.payload)[0];
        return user;
      }),
      catchError(error => {
        done && done();
        if (error && error.hasError) {
          Toast.error(error.message);
        } else {
          Toast.error(error);
        }
        return of<any>();
      })
    );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem(CURRENTUSER);
    this.currentUserSubject.next(null);
  }

  public getAllUsers$(): Observable<Array<LaUser>> {
    const rest = '/Users/AllUsers';
    const url = `${this.API_URL}${rest}`;
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.get<IPayloadWrapper<any>>(url, options).pipe(
      map(res => {
        const memberList = this.processUsers(res.payload);

        // Toast.success(`${res.length} items loaded!`, rest);
        return memberList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getIsUserAdmin$(user: LaUser): Observable<boolean> {
    const rest = '/Users/IsAdmin';
    const url = `${this.API_URL}${rest}`;
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    const data = user && user.asJson();
    return this.http.post<IPayloadWrapper<any>>(url, data, options).pipe(
      map(res => {
        const answer = res.payload[0];
        if (answer.status) {
          user.markAsAdmin();
        }
        return answer.status;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

  public getDeleteUser$(user: LaUser): Observable<LaUser> {
    const rest = '/Users/Delete/';
    const name = encodeURIComponent(user.email);
    const url = `${this.API_URL}${rest}${name}`;
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete<IPayloadWrapper<any>>(url, options).pipe(
      map(res => {
        const memberList = this.processUsers(res.payload);

        Toast.success(`${res.length} items deleted!`, rest);
        return memberList;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, url);
        return of<any>();
      })
    );
  }

}
