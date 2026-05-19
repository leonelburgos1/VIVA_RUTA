import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceFilters } from './place-filters';

describe('PlaceFilters', () => {
  let component: PlaceFilters;
  let fixture: ComponentFixture<PlaceFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
