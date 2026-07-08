import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PlatformService } from '../../services/ride-platform.service';
import { RideService } from '../../services/ride.service';

import { RideForm } from './ride-form';

describe('RideForm', () => {
  let component: RideForm;
  let fixture: ComponentFixture<RideForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideForm],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: PlatformService,
          useValue: {
            findAll: () => of([]),
          },
        },
        {
          provide: RideService,
          useValue: {
            findById: () => of(null),
            create: () => of({}),
            update: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RideForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
