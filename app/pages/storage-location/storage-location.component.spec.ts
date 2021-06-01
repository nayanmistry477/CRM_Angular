import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageLocationComponent } from './storage-location.component';

describe('StorageLocationComponent', () => {
  let component: StorageLocationComponent;
  let fixture: ComponentFixture<StorageLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorageLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
