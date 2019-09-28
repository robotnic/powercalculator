import { TestBed } from '@angular/core/testing';

import { ChartvisibilityService } from './chartvisibility.service';

describe('ChartvisibilityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChartvisibilityService = TestBed.get(ChartvisibilityService);
    expect(service).toBeTruthy();
  });
});
