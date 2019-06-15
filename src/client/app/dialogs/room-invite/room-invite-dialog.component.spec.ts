import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInviteDialogComponent } from './room-invite-dialog.component';

describe('RoomInviteDialogComponent', () => {
  let component: RoomInviteDialogComponent;
  let fixture: ComponentFixture<RoomInviteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomInviteDialogComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomInviteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
