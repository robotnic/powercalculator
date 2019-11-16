import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergytableComponent } from './energytable.component';

describe('EnergytableComponent', () => {
  let component: EnergytableComponent;
  let fixture: ComponentFixture<EnergytableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergytableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergytableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
