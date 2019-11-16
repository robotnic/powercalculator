import { TestBed } from '@angular/core/testing';

import { TablecalcService } from './tablecalc.service';

describe('TablecalcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TablecalcService = TestBed.get(TablecalcService);
    expect(service).toBeTruthy();
  });
});
