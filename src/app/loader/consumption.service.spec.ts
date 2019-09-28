import { TestBed } from '@angular/core/testing';

import { ConsumptionService } from './consumption.service';

describe('ConsumptionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConsumptionService = TestBed.get(ConsumptionService);
    expect(service).toBeTruthy();
  });
});
