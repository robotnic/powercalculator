import { TestBed } from '@angular/core/testing';

import { NormalizeService } from './normalize.service';

describe('NormalizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NormalizeService = TestBed.get(NormalizeService);
    expect(service).toBeTruthy();
  });
});
