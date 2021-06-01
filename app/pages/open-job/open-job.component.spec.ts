import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenJobComponent } from './open-job.component';

describe('OpenJobComponent', () => {
  let component: OpenJobComponent;
  let fixture: ComponentFixture<OpenJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
