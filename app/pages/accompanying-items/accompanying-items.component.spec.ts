import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccompanyingItemsComponent } from './accompanying-items.component';

describe('AccompanyingItemsComponent', () => {
  let component: AccompanyingItemsComponent;
  let fixture: ComponentFixture<AccompanyingItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccompanyingItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccompanyingItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
