import { TestBed } from '@angular/core/testing';

import { RideManagerService } from './ride-manager.service';

describe('RideManagerService', () => {
  let service: RideManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
