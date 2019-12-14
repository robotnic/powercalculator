import { TestBed } from '@angular/core/testing';

import { CalcschedulerService } from './calcscheduler.service';

describe('CalcschedulerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalcschedulerService = TestBed.get(CalcschedulerService);
    expect(service).toBeTruthy();
  });
});
