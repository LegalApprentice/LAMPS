import { Injectable } from '@angular/core';
import { Toast, EmitterService, IPayloadWrapper } from './shared';
import { HttpClient } from '@angular/common/http';

import { LaAtom } from './shared';
import { environment } from '../environments/environment';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class HealthService {
  API_URL: string = environment.loginURL;


  list: Array<LaAtom>;

  constructor(private http: HttpClient) {

  }

  public consumeDataModel(list: Array<any>) {
    this.list = new Array<LaAtom>();

    list.forEach( item => {
      const obj = new LaAtom(item);
      this.list.push(obj);
    });
    return this;
  }

  public getHealth$(): Observable<Array<LaAtom>> {
    const rest = '/api/Health';
    const url = `${this.API_URL}${rest}`;

    return this.http.get<IPayloadWrapper<any>>(url).pipe(
      map(res => {
        this.consumeDataModel(res.payload);
        Toast.success(`${res.length} loaded!`, rest);
        return this.list;
      }),
      catchError(error => {
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(error.message, url);
        return of<any>(msg);
      })
    );
  }
}
