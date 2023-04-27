import { Injectable } from '@angular/core';
import { Toast, IPayloadWrapper } from '../shared';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthenticationService } from '../login/authentication.service';

import { environment } from '../../environments/environment';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TextExtraction } from '@app/case-converter/pipelineWEB';


@Injectable({
  providedIn: 'root'
})
export class ConvertService {
  get API_URL(): string {
    return environment.converterURL;
  }

  constructor(
    private http: HttpClient,
    private aService: AuthenticationService) {
  }

 

  public postConvertToHTML$(url:string): Observable<any> {
    const rest = `/ToHtml`;
    return this.postConvertTo$(rest,url)
  }

  public postConvertToText$(url:string): Observable<any> {
    const rest = `/ToText`;
    return this.postConvertTo$(rest,url)
  }

  public postConvertToLSJson$(url:string): Observable<any> {
    const rest = `/Tolsjson`;
    return this.postConvertTo$(rest,url)
  }

  public postConvertTo$(rest:string, url:string): Observable<any> {
    const endpoint = `${this.API_URL}${rest}`;
    const body = JSON.stringify({ url: encodeURI(url) });
    //console.log(endpoint, body);

    //Toast.info('starting', endpoint)
    //Toast.info('starting', JSON.stringify(body))

    Toast.info('calling service', endpoint)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<IPayloadWrapper<any>>(endpoint, body, httpOptions).pipe(
      map(res => {
        const lsJson = res.payload;
        return lsJson;
      }),
      catchError(error => {
        Toast.info('catchError', error)
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, endpoint);
        return of<any>();
      })
    );
  }

  public postConvertFromHTML$(text:string): Observable<any> {
    const rest = `/FromHtml`;
    return this.postConvertFrom$(rest,text)
  }

  public postConvertFromText$(caseNumber:string, text:any): Observable<any> {
    //const rest = `/FromText`;
    //return this.postConvertFrom$(rest,text)

    const root = new TextExtraction();
    root.url = caseNumber;
    const result = root.FromTextToLSJson(text)
    const payload = [root.title, result];

    return of<any>(payload);
  }

  public postConvertFrom$(rest:string, text:string): Observable<any> {
    const endpoint = `${this.API_URL}${rest}`;
    const body = { text: text };


    
    //console.log(endpoint, body);

    //Toast.info('starting', endpoint)
    //Toast.info('starting', JSON.stringify(body))

    Toast.info('calling service', endpoint)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<IPayloadWrapper<any>>(endpoint, body, httpOptions).pipe(
      map(res => {
        const lsJson = res.payload;
        return lsJson;
      }),
      catchError(error => {
        Toast.info('catchError', error)
        const msg = JSON.stringify(error, undefined, 3);
        Toast.error(msg, endpoint);
        return of<any>();
      })
    );
  }

}

