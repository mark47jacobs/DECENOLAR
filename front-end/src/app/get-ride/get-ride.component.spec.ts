import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetRideComponent } from './get-ride.component';

describe('GetRideComponent', () => {
  let component: GetRideComponent;
  let fixture: ComponentFixture<GetRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetRideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
