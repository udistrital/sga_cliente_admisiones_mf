import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudListadosOficializadosComponent } from './crud-listados-oficializados.component';

describe('CrudListadosOficializadosComponent', () => {
  let component: CrudListadosOficializadosComponent;
  let fixture: ComponentFixture<CrudListadosOficializadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudListadosOficializadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudListadosOficializadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
