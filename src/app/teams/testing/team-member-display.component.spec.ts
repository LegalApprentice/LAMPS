import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMemberDisplayComponent } from '../team-member-display.component';

describe('TeamMemberDisplayComponent', () => {
  let component: TeamMemberDisplayComponent;
  let fixture: ComponentFixture<TeamMemberDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamMemberDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMemberDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
