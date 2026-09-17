import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { FiltrosProgramaService, idAcademico, nivelPrograma } from '../../services/filtros-programa.service';
import { OpcionPrograma, SeleccionPrograma } from '../../models/proyecto_academico/filtros-programa.models';

@Component({
  selector: 'app-filtros-programa',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, TranslateModule],
  templateUrl: './filtros-programa.component.html',
  styles: [':host { display: block; width: 100%; grid-column: 1 / -1; } .filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 16px; }'],
})
export class FiltrosProgramaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() periodos: any[] = [];
  @Input() periodoInicial: any;
  @Input() programaInicial: number | null = null;
  @Input() seleccionActual: SeleccionPrograma | null = null;
  @Input() nivelesPermitidos: string[] = [];
  @Output() seleccion = new EventEmitter<SeleccionPrograma>();
  periodoId: number | null = null;
  facultadId: number | null = null;
  nivelId: number | null = null;
  programaId: number | null = null;
  programas: any[] = [];
  facultadesCatalogo: OpcionPrograma[] = [];
  cargando = true;
  error = false;
  private destruido = false;
  private restaurado = false;

  constructor(private filtros: FiltrosProgramaService) {}

  async ngOnInit() {
    try {
      const catalogo = await this.filtros.cargar();
      if (this.destruido) { return; }
      this.programas = catalogo.programas;
      this.facultadesCatalogo = catalogo.facultades;
      this.restaurarPrograma();
    } catch {
      this.error = true;
      this.programas = [];
      this.facultadesCatalogo = [];
    } finally {
      this.cargando = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.seleccionActual) {
      this.periodoId = idAcademico(this.seleccionActual.periodo) || null;
      this.facultadId = idAcademico(this.seleccionActual.facultad) || null;
      this.nivelId = idAcademico(this.seleccionActual.nivel) || null;
      this.programaId = idAcademico(this.seleccionActual.programa) || null;
      return;
    }
    if (changes['periodoInicial']) {
      const id = idAcademico(this.periodoInicial) || null;
      if (id !== this.periodoId) {
        this.periodoId = id;
        this.facultadId = this.nivelId = this.programaId = null;
      }
    }
    this.restaurarPrograma();
  }

  private restaurarPrograma() {
    if (this.restaurado || !this.programaInicial || !this.periodoId) { return; }
    const programa = this.programasPermitidos.find(p => idAcademico(p) === this.programaInicial);
    if (!programa) { return; }
    this.restaurado = true;
    this.facultadId = idAcademico(programa.FacultadId);
    this.nivelId = idAcademico(this.niveles.find(n =>
      idAcademico(n) === idAcademico(nivelPrograma(programa)) || idAcademico(n) === idAcademico(programa.NivelFormacionId)));
    this.programaId = idAcademico(programa);
    Promise.resolve().then(() => { if (!this.destruido) { this.cambiar('programa'); } });
  }

  ngOnDestroy() { this.destruido = true; }

  get programasPermitidos(): any[] {
    return this.programas.filter(p => this.nivelPermitido(nivelPrograma(p)) || this.nivelPermitido(p.NivelFormacionId));
  }

  private nivelPermitido(nivel: any): boolean {
    const codigo = String(nivel?.CodigoAbreviacion || '').trim().toUpperCase();
    return !!codigo && this.nivelesPermitidos.some(c => c.trim().toUpperCase() === codigo);
  }

  get facultades(): OpcionPrograma[] {
    const ids = new Set(this.programasPermitidos.map(p => idAcademico(p.FacultadId)));
    return this.facultadesCatalogo.filter(f => ids.has(f.Id));
  }

  get niveles(): any[] {
    const niveles = new Map<string, any>();
    this.programasPermitidos.filter(p => idAcademico(p.FacultadId) === this.facultadId).forEach(p => {
      [nivelPrograma(p), p.NivelFormacionId].forEach(n => {
        if (this.nivelPermitido(n)) {
          niveles.set(n.CodigoAbreviacion.trim().toUpperCase(), n);
        }
      });
    });
    return Array.from(niveles.values()).sort((a, b) => a.Nombre.localeCompare(b.Nombre));
  }

  get proyectos(): any[] {
    return this.programasPermitidos.filter(p => idAcademico(p.FacultadId) === this.facultadId &&
      (idAcademico(nivelPrograma(p)) === this.nivelId || idAcademico(p.NivelFormacionId) === this.nivelId));
  }

  cambiar(desde: 'periodo' | 'facultad' | 'nivel' | 'programa') {
    this.restaurado = true;
    if (desde === 'periodo') { this.facultadId = null; }
    if (desde === 'periodo' || desde === 'facultad') { this.nivelId = null; }
    if (desde !== 'programa') { this.programaId = null; }
    this.seleccion.emit({
      periodo: (this.periodos || []).find(p => idAcademico(p) === this.periodoId) || null,
      facultad: this.facultades.find(f => f.Id === this.facultadId) || null,
      nivel: this.niveles.find(n => idAcademico(n) === this.nivelId) || null,
      programa: this.proyectos.find(p => idAcademico(p) === this.programaId) || null,
    });
  }
}
