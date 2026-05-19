import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedTours } from './featured-tours';

describe('FeaturedTours', () => {
  let component: FeaturedTours;
  let fixture: ComponentFixture<FeaturedTours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedTours],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedTours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
