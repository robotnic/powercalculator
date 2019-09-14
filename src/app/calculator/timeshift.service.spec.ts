import { TestBed } from '@angular/core/testing';

import { TimeshiftService } from './timeshift.service';

describe('TimeshiftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeshiftService = TestBed.get(TimeshiftService);
    expect(service).toBeTruthy();
  });
});
