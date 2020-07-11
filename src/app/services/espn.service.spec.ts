import { TestBed } from '@angular/core/testing';

import { EspnService } from './espn.service';

describe('EspnService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EspnService = TestBed.get(EspnService);
    expect(service).toBeTruthy();
  });
});
