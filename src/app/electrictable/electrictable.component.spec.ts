import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectrictableComponent } from './electrictable.component';

describe('ElectrictableComponent', () => {
  let component: ElectrictableComponent;
  let fixture: ComponentFixture<ElectrictableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectrictableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectrictableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
