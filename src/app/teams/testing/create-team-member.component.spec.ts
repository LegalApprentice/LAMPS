import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTeamMemberComponent } from '../create-team-member.component';

describe('CreateTeamMemberComponent', () => {
  let component: CreateTeamMemberComponent;
  let fixture: ComponentFixture<CreateTeamMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTeamMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTeamMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
