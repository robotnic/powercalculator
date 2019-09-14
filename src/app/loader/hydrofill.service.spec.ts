import { TestBed } from '@angular/core/testing';

import { HydrofillService } from './hydrofill.service';

describe('HydrofillService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HydrofillService = TestBed.get(HydrofillService);
    expect(service).toBeTruthy();
  });
});
