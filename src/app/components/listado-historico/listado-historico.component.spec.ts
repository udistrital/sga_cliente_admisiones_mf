import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoHistoricoComponent } from './listado-historico.component';

describe('ListadoHistoricoComponent', () => {
  let component: ListadoHistoricoComponent;
  let fixture: ComponentFixture<ListadoHistoricoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoHistoricoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListadoHistoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
