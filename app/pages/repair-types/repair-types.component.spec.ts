import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairTypesComponent } from './repair-types.component';

describe('RepairTypesComponent', () => {
  let component: RepairTypesComponent;
  let fixture: ComponentFixture<RepairTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepairTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
