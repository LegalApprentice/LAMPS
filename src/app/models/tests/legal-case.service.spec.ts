import { TestBed } from '@angular/core/testing';

import { LegalCaseService } from '../legal-case.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

describe('LegalCaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule
    ]
  }));

  // xit('should be created', () => {
  //   const service: LegalCaseService = TestBed.get(LegalCaseService);
  //   expect(service).toBeTruthy();
  // });
});
