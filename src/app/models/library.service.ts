import { Injectable } from '@angular/core';
import { Toast, IPayloadWrapper, PayloadWrapper } from '../shared';

import { AuthenticationService } from '../login/authentication.service';


import { LaCaseDirectoryItem, LaDownloadedCase, LaUploadedCase } from '.';
import { environment } from '../../environments/environment';

import { Observable, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpPayloadService } from '@app/shared/httpPayload.service';
import { LibraryServiceLocator, SearchServiceLocator } from '@app/shared/service-locator';


@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  constructor(
    private payloadService: HttpPayloadService,
    private aService: AuthenticationService) {
  }

  public uploadCase$(caseModel: LaUploadedCase): Subject<Array<LaCaseDirectoryItem>> {

    const localSubject = new Subject<Array<LaCaseDirectoryItem>>();
    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'caseUpload$',
      endpoint: `/Cases/UploadCase`
    });

    const httpSubject = this.payloadService.get$(LaCaseDirectoryItem, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          localSubject.next(result.payload);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    })
    return localSubject;
  }


  public downloadCase$(workspace: string, filename: string): Subject<LaDownloadedCase> {

    const localSubject = new Subject<LaDownloadedCase>();
    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'caseDownload$',
      endpoint: `/Cases/DownloadCase`
    });

    const httpSubject = this.payloadService.get$(LaDownloadedCase, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          localSubject.next(result.payload[0]);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    })
    return localSubject;

    // return this.http.post<IPayloadWrapper<any>>(url, { workspace, filename }).pipe(
    //   map(res => {
    //     const caseData: any = res.payload[0];
    //     // Toast.success(`${res.length} case opened from server`, rest);
    //     return [new LaDownloadedCase(caseData)];
    //   }),
    //   catchError(error => {
    //     const msg = JSON.stringify(error, undefined, 3);
    //     Toast.error(msg, url);
    //     return of<any>();
    //   })
    // );
  }


  public getCaseDirectory$(): Subject<Array<LaCaseDirectoryItem>> {

    const localSubject = new Subject<Array<LaCaseDirectoryItem>>();
    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'getCaseDirectory$',
      endpoint: `/Cases/ActiveCases`
    });

    const httpSubject = this.payloadService.get$(LaCaseDirectoryItem, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          result.payload = result.payload.sort((a, b) => b.caseCompare(a));
          localSubject.next(result.payload);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    })
    return localSubject;

    // return this.http.get<IPayloadWrapper<any>>(url).pipe(
    //   map(res => {
    //     const caseList = this.consumeDataModel(res.payload);
    //     // Toast.success(`${res.length} items loaded!`, rest);
    //     return caseList;
    //   }),
    //   catchError(error => {
    //     const msg = JSON.stringify(error, undefined, 3);
    //     Toast.error(msg, url);
    //     return of<any>();
    //   })
    // );
  }

  public caseHistory$(workspace: string, filename: string): Subject<Array<LaCaseDirectoryItem>> {    
    const localSubject = new Subject<Array<LaCaseDirectoryItem>>();
    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'caseHistory$',
      endpoint: `/Cases/CaseHistory`
    });

    const httpSubject = this.payloadService.get$(LaCaseDirectoryItem, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          result.payload = result.payload.sort((a, b) => b.caseCompare(a));
          localSubject.next(result.payload);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    })
    return localSubject;

    // return this.http.post<IPayloadWrapper<any>>(url, { workspace, filename }).pipe(
    //   map(res => {
    //     const caseList = this.consumeDataModel(res.payload);
    //     //  Toast.success(`${res.length} items loaded!`, rest);
    //     return caseList;
    //   }),
    //   catchError(error => {
    //     const msg = JSON.stringify(error, undefined, 3);
    //     Toast.error(msg, url);
    //     return of<any>();
    //   })
    // );
  }

  public getCasesInWorkspace$(workspace: string): Subject<Array<LaCaseDirectoryItem>> {
    const localSubject = new Subject<Array<LaCaseDirectoryItem>>();
    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'getCasesInWorkspace$',
      endpoint: `/Cases/ActiveCasesInWorkspace`
    });

    const httpSubject = this.payloadService.get$(LaCaseDirectoryItem, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          result.payload = result.payload.sort((a, b) => b.caseCompare(a));
          localSubject.next(result.payload);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    })
    return localSubject;

    // return this.http.get<IPayloadWrapper<any>>(url).pipe(
    //   map(res => {
    //     const caseList = this.consumeDataModel(res.payload);
    //     // Toast.success(`${res.length} items loaded!`, rest);
    //     return caseList;
    //   }),
    //   catchError(error => {
    //     const msg = JSON.stringify(error, undefined, 3);
    //     Toast.error(msg, url);
    //     return of<any>();
    //   })
    // );
  }

  public getAllActiveCases$(): Subject<Array<LaCaseDirectoryItem>> {

    const localSubject = new Subject<Array<LaCaseDirectoryItem>>();
    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'getAllActiveCases$',
      endpoint: `/Cases/ActiveCases`
    });

    
    const httpSubject = this.payloadService.get$(LaCaseDirectoryItem, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          result.payload = result.payload.sort((a, b) => b.caseCompare(a));
          localSubject.next(result.payload);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    })
    return localSubject;

    // return this.http.get<IPayloadWrapper<any>>(url).pipe(
    //   map(res => {
    //     const caseList = this.consumeDataModel(res.payload);

    //     // Toast.success(`${res.length} items loaded!`, rest);
    //     return caseList;
    //   }),
    //   catchError(error => {
    //     const msg = JSON.stringify(error, undefined, 3);
    //     Toast.error(msg, url);
    //     return of<any>();
    //   })
    // );
  }

  public getAllCases$(): Subject<Array<LaCaseDirectoryItem>> {

    const localSubject = new Subject<Array<LaCaseDirectoryItem>>();

    const serviceOptions = new LibraryServiceLocator({
      serviceKey: 'getAllCases$',
      endpoint: `/Cases/AllCases`
    });

    const httpSubject = this.payloadService.get$(LaCaseDirectoryItem, serviceOptions);
    httpSubject.subscribe({
      next: (result) => {
        if (result.hasError) {
          localSubject.error(result.message);
        } else {
          result.payload = result.payload.sort((a, b) => b.caseCompare(a));
          localSubject.next(result.payload);
        }
      },
      error: (error) => localSubject.error(error),
      complete: () => console.info('complete')
    });
    return localSubject;
  }


}

