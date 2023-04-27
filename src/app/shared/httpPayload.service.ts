import { Observable, of, Subject, throwError } from 'rxjs';
import { switchMap, catchError, retry } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AjaxResponse } from 'rxjs/ajax';
import { ServiceLocator } from './service-locator';
import { Toast } from './emitter.service'
import { Constructable, FuncAny } from './foTools'
import { LaAtom } from './la-atom'
import { IPayloadWrapper, PayloadWrapper } from './payload';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class HttpPayloadService {

    constructor(private http: HttpClient) { }

    makeHeaders(additionalHeaders?: any, contentType?: any) {
        const token = null; //CurrentUser?.Token.accessToken;
        const json = { 'Content-Type': 'application/json' }
        if (token) {
            const bearerToken = { Authorization: `Bearer ${token}` };
            return { ...bearerToken, ...additionalHeaders, ...contentType, ...json };
        } else {
            return { ...additionalHeaders, ...contentType, ...json };
        }
    }

    mapToModel<T>(type: Constructable<T>, payload: Array<any>, func?: FuncAny): Array<T> {
        const list = payload.map<T>((item) => {
            const data = func ? func(item) : item;
            return new type(data);
        });
        return list;
    }



    esReportSuccess<T>(type: Constructable<T>, successResponse: AjaxResponse<T>, mapFunc?: FuncAny): Observable<PayloadWrapper<T>> {
        const found = new PayloadWrapper<T>();
        const res: any = successResponse.response;
        if ( res.error ) {
            found.hasError = true;
            found.message = res.error;
            return of<PayloadWrapper<T>>(found);
        }

        const hits = res.hits.hits;
        found.payload = this.mapToModel(type, hits, mapFunc);
        return of<PayloadWrapper<T>>(found);
    }

    esSearchReportSuccess<T>(type: Constructable<T>, successResponse: AjaxResponse<T>, mapFunc?: FuncAny): Observable<PayloadWrapper<T>> {
        const found = new PayloadWrapper<T>();
        const res: any = successResponse.response;
        if ( res.error ) {
            found.hasError = true;
            found.message = res.error;
            return of<PayloadWrapper<T>>(found);
        }

        const hits = res.payload;
        found.payload = this.mapToModel(type, hits, mapFunc);
        return of<PayloadWrapper<T>>(found);
    }




     // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }


//   getEmployees<T extends LaAtom>(type: Constructable<T>, serviceOptions: ServiceLocator): Subject<PayloadWrapper<T>> {
//     const subject = new Subject<PayloadWrapper<T>>();
//     const url = serviceOptions.getAPIUrl();

//     this.http
//       .get<T>(url)
//       .pipe(retry(1), catchError(this.handleError));

//     return subject;
//     }

    public get$<T extends LaAtom>(type: Constructable<T>, serviceOptions: ServiceLocator, additionalHeaders?: any, func?: FuncAny): Subject<PayloadWrapper<T>> {
        const subject = new Subject<PayloadWrapper<T>>();
        const url = serviceOptions.getAPIUrl();

        const headers = this.makeHeaders(additionalHeaders);

        this.http.get(url, headers)
            .pipe(
                switchMap((res: any) => {
                    res.payload = this.mapToModel(type, res.payload, func);
                    return of<PayloadWrapper<T>>(res);
                }),
                catchError((error: any) => {
                    //Toast.error(url, 'HTTP Issue');
                    console.log(JSON.stringify(error, undefined, 3));
                    const res = new PayloadWrapper<T>()
                    return of<PayloadWrapper<T>>(res);
                })
            )
            .subscribe(subject);

        return subject;
    }

    public post$<T extends LaAtom, U>(type: Constructable<T>, serviceOptions: ServiceLocator, data: U, func?: FuncAny): Subject<PayloadWrapper<T>> {
        const subject = new Subject<PayloadWrapper<T>>();
        const url = serviceOptions.getAPIUrl();

        const headers = this.makeHeaders();

        console.log('post$ url=', url);
        this.http.post(url, data, headers)
            .pipe(
                switchMap((res: any) => {
                    res.payload = this.mapToModel(type, res.payload, func);
                    return of<PayloadWrapper<T>>(res);
                }),
                catchError((error: any) => {
                    //Toast.error(url, 'HTTP Issue');
                    console.log(JSON.stringify(error, undefined, 3));
                    const res = new PayloadWrapper<T>()
                    return of<PayloadWrapper<T>>(res);
                })
            )
            .subscribe(subject);

        return subject;
    }

    public esGet$<T extends LaAtom>(type: Constructable<T>, serviceOptions: ServiceLocator, func?: FuncAny): Subject<PayloadWrapper<T>> {
        const subject = new Subject<PayloadWrapper<T>>();
        const url = serviceOptions.getAPIUrl();
        //var gourl = "https://localhost:44360" + url;

        const headers = this.makeHeaders();


      console.log('esGet$ url=', url);
      this.http.get(url, headers)
            .pipe(
                switchMap((res: any) => {
                    const hits = res.hits.hits;
                    res.payload = this.mapToModel(type, hits, func);
                    return of<PayloadWrapper<T>>(res);
                }),
                catchError((error: any) => {
                    Toast.error(url, 'HTTP Issue');
                    console.log(JSON.stringify(error, undefined, 3));
                    const res = new PayloadWrapper<T>()
                    return of<PayloadWrapper<T>>(res);
                })
            )
            .subscribe(subject);

        return subject;
    }

    public esPost$<T extends LaAtom, U>(type: Constructable<T>, serviceOptions: ServiceLocator, data: U, additionalHeaders?: any, func?: FuncAny): Subject<PayloadWrapper<T>> {
        const subject = new Subject<PayloadWrapper<T>>();
        const url = serviceOptions.getAPIUrl();

        const headers = this.makeHeaders();

        console.log('esPost$ url=', url);
        this.http.post(url, data, headers)
            .pipe(
                switchMap((res: any) => {
                    res.payload = this.mapToModel(type, res.payload, func);
                    return of<PayloadWrapper<T>>(res);
                }),
                catchError((error: any) => {
                    //Toast.error(url, 'HTTP Issue');
                    console.log(JSON.stringify(error, undefined, 3));
                    const res = new PayloadWrapper<T>()
                    return of<PayloadWrapper<T>>(res);
                })
            )
            .subscribe(subject);

        return subject;
    }
}
