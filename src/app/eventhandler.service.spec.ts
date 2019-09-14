import { TestBed } from '@angular/core/testing';

import { EventhandlerService } from './eventhandler.service';

describe('EventhandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventhandlerService = TestBed.get(EventhandlerService);
    expect(service).toBeTruthy();
  });
});
