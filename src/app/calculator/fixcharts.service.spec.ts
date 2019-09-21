import { TestBed } from '@angular/core/testing';

import { FixchartsService } from './fixcharts.service';

describe('FixchartsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FixchartsService = TestBed.get(FixchartsService);
    expect(service).toBeTruthy();
  });
});
