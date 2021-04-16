import { TestBed } from '@angular/core/testing';

import { ContractManagerService } from './contract-manager.service';

describe('ContractManagerService', () => {
  let service: ContractManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
