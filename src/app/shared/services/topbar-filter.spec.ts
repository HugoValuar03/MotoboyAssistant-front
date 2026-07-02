import { TestBed } from '@angular/core/testing';

import { TopbarFilter } from './topbar-filter.service';

describe('TopbarFilter', () => {
  let service: TopbarFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TopbarFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
