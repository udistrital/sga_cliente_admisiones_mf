import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorCriteriosComponent } from './administrador-criterios.component';

describe('AdministradorCriteriosComponent', () => {
  let component: AdministradorCriteriosComponent;
  let fixture: ComponentFixture<AdministradorCriteriosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministradorCriteriosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministradorCriteriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
