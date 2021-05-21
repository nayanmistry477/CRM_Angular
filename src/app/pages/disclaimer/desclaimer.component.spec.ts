import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesclaimerComponent } from './desclaimer.component';

describe('DesclaimerComponent', () => {
  let component: DesclaimerComponent;
  let fixture: ComponentFixture<DesclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesclaimerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
