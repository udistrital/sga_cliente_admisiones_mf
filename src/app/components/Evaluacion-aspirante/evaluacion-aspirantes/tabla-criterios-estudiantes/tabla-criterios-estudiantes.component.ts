import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';

@Component({
  selector: 'tabla-criterios-estudiantes',
  templateUrl: './tabla-criterios-estudiantes.component.html',
  styleUrls: ['./tabla-criterios-estudiantes.component.scss']
})
export class TablaCriteriosEstudiantesComponent implements OnInit {
  @Input() key: number = 0;
  @Input() periodo: number | null = null;
  @Input() proyecto: number | null = null;

  criterios: any[] = [];
  evaluaciones: any[] = [];
  page: number = 1; // Página actual
  pageSize: number = 5; // Tamaño inicial de página
  pageSizes: number[] = [5, 10, 15, 30, 10000]; // Opciones de tamaño de página
  isLoading: boolean = true; // Estado de carga
  isError: boolean = false; // Estado de error en la petición
  errorMessage: string = ''; // Mensaje de error en caso de falla

  constructor(private http: HttpClient, public translate: TranslateService, private sgaAdmisionesMid: SgaAdmisionesMid) {}

  ngOnInit(): void {
    if (this.periodo && this.proyecto) {
      this.fetchData();
    } else {
      this.isLoading = false;
    }
  }

  ngOnChanges(): void {
    if (this.periodo && this.proyecto) {
      this.fetchData();
    }
  }

  fetchData(): void {
    if (!this.periodo || !this.proyecto) {
      return;
    }

    this.isLoading = true;
    this.isError = false;
    this.errorMessage = '';

    const endPoint = `admision/aspirantes/evaluados?id_periodo=${this.periodo}&id_proyecto=${this.proyecto}&id_nivel=2`;
    this.sgaAdmisionesMid.get(endPoint).subscribe(
      (response: any) => {
        if (response.Success && response.Data) {
          this.criterios = response.Data.criterios;
          this.evaluaciones = response.Data.evaluaciones;
        } else {
          this.isError = true;
          this.errorMessage = this.translate.instant('admision.no_datos');
        }
        this.isLoading = false;
      },
      (error:any) => {
        this.isError = true;
        this.errorMessage = this.translate.instant('admision.error_cargar_datos', { error: error.message });
        this.isLoading = false;
      }
    );
  }

  getNota(evaluacion: any, criterioId: number): number | string {
    if (!evaluacion || !evaluacion.criterios) {
        return '-';
    }
    const criterioEvaluacion = evaluacion.criterios.find((c: any) => c.criterioId === criterioId);
    return criterioEvaluacion ? (criterioEvaluacion.NotaRequisito * 100)/criterioEvaluacion.porcentajeGeneral : '-';
  }

  getAsistencia(evaluacion: any, criterioId: number): string {
    if (!evaluacion || !evaluacion.criterios) {
        return '-';
    }
    const criterioEvaluacion = evaluacion.criterios.find((c: any) => c.criterioId === criterioId);
    if (criterioEvaluacion && 'asistencia' in criterioEvaluacion) {
        return criterioEvaluacion.asistencia ? this.translate.instant('admision.si') : this.translate.instant('admision.no');
    }
    return '-';
  }

  onPageSizeChange(event: any): void {
    this.pageSize = event.target.value;
    this.page = 1; // Reiniciar a la primera página cuando se cambia el tamaño de la página
  }
}