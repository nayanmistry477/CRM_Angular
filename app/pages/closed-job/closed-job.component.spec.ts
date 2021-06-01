import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedJobComponent } from './closed-job.component';

describe('ClosedJobComponent', () => {
  let component: ClosedJobComponent;
  let fixture: ComponentFixture<ClosedJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClosedJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosedJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
