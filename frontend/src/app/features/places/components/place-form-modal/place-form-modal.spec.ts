import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceFormModal } from './place-form-modal';

describe('PlaceFormModal', () => {
  let component: PlaceFormModal;
  let fixture: ComponentFixture<PlaceFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceFormModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
