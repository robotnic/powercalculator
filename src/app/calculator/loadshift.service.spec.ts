import { TestBed } from '@angular/core/testing';

import { LoadshiftService } from './loadshift.service';

describe('LoadshiftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadshiftService = TestBed.get(LoadshiftService);
    expect(service).toBeTruthy();
  });
});
