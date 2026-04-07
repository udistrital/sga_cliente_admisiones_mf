import { Component, Input, Output, EventEmitter, ViewChild, SimpleChanges, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TiposCuposComponent } from '../tipos-cupos/tipos-cupos.component';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SoporteCupoInscripcionComponent } from '../soporte-cupo-inscripcion/soporte-cupo-inscripcion.component';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';


@Component({
  selector: "crud-asignacion-cupo",
  templateUrl: "./crud-asignacion_cupo.component.html",
  styleUrls: ["./crud-asignacion_cupo.component.scss"],
})
export class CrudAsignacionCupoComponent implements AfterViewInit {

  cupo: any;
  cuposAdmitidos: number = 0;
  cuposOpcionados: number = 0;
  cuposDisponibles: number = 0;
  show_posgrado: boolean = false;
  show_calculos_cupos: boolean = false;
  show_listado: boolean = false;
  base64String!: string;
  errorMessage!: string;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado', 'tipo', 'cuposhabilitados', "cuposopcionados", "cuposDisponibles", "soporte", 'acciones'];
  loading: boolean = false;

  formModel: any = {
    CuposAsignados: null,
    CuposOpcionados: null,
  };
  errors: any = {};


  @Input() info_periodo: any;
  @Input() info_proyectos: any;
  @Input() info_nivel!: boolean;
  @Input() tipo_inscripcion!: any;
  @Input() autoPrecargaCupos: boolean = true;
  @Input() inicializarCerosSinCupos: boolean = true;
  @Input() mostrarAlertaSinCupos: boolean = true;
  @Input() endpointCupos: string = 'cupos';
  @Output() eventChange = new EventEmitter();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  constructor(
    private readonly newNuxeoService: NewNuxeoService,
    private readonly popUpManager: PopUpManager,
    private readonly dialogService: MatDialog,
    private readonly translate: TranslateService,
    private readonly inscripcion: InscripcionService,
    private readonly inscripcionMidService: InscripcionMidService,
    private readonly evaluacionService: EvaluacionInscripcionService,
    private readonly sgaAdmisionesMid: SgaAdmisionesMid

  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  obtenerCupos() {
    if (!this.info_periodo?.Id || !this.info_proyectos?.Id) {
      this.dataSource.data = [];
      this.formModel.CuposAsignados = null;
      this.formModel.CuposOpcionados = null;
      return EMPTY;
    }

    return this.evaluacionService.get('cupos_por_dependencia/?query=DependenciaId:' + Number(this.info_proyectos.Id) + ',PeriodoId:' + Number(this.info_periodo.Id)).pipe(
      tap((response: any) => {
        const data = Array.isArray(response) ? response : (response?.Data ?? []);
        if (data.length === 0) {
          this.dataSource.data = [];
          if (this.mostrarAlertaSinCupos && response?.Message) {
            this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), response.Message);
          }
          return;
        }
        this.cuposAdmitidos = 0
        this.cuposOpcionados = 0
        this.cuposDisponibles = 0
        data.forEach((element: any) => {
          this.cuposAdmitidos = this.cuposAdmitidos + element.CuposHabilitados
          this.cuposOpcionados = this.cuposOpcionados + element.CuposOpcionados
          this.cuposDisponibles = this.cuposDisponibles + element.CuposDisponibles
        });
        this.formModel.CuposAsignados = this.cuposAdmitidos;
        this.formModel.CuposOpcionados = this.cuposOpcionados;
        this.dataSource.data = data;
      }),
      catchError(() => {
        this.popUpManager.showErrorAlert(this.translate.instant('cupos.errorCupos'));
        return EMPTY;
      })
    );
  }

  submitForm() {
    this.errors = {};
    const cuposAsignados = Number(this.formModel.CuposAsignados);
    const cuposOpcionados = Number(this.formModel.CuposOpcionados || 0);

    if (Number.isNaN(cuposAsignados) || cuposAsignados < 0 || cuposAsignados > 999) {
      this.errors.CuposAsignados = this.translate.instant('cupos.cargar_cantidad_cupos');
      return;
    }
    if (!this.show_posgrado && (Number.isNaN(cuposOpcionados) || cuposOpcionados < 0 || cuposOpcionados > 999)) {
      this.errors.CuposOpcionados = this.translate.instant('cupos.cargar_cantidad_cupos');
      return;
    }

    this.cuposAdmitidos = cuposAsignados;
    this.cuposOpcionados = this.show_posgrado ? 0 : cuposOpcionados;
    this.cuposDisponibles = Math.max(cuposAsignados - this.cuposOpcionados, 0);
    this.show_calculos_cupos = true;
    this.show_listado = true;

    const cuposEspeciales = this.show_posgrado
      ? {
        ComunidadesNegras: '0',
        DesplazadosVictimasConflicto: '0',
        ComunidadesIndiginas: '0',
        MejorBachiller: '0',
        Ley1084: '0',
        ProgramaReincorporacion: '0',
      }
      : {
        ComunidadesNegras: String(Math.trunc((this.cuposAdmitidos / 40) * 2)),
        DesplazadosVictimasConflicto: String(Math.trunc((this.cuposAdmitidos / 40) * 1)),
        ComunidadesIndiginas: String(Math.trunc((this.cuposAdmitidos / 40) * 2)),
        MejorBachiller: String(Math.trunc((this.cuposAdmitidos / 40) * 1)),
        Ley1084: '1',
        ProgramaReincorporacion: '1',
      };

    const payload = {
      CuposAsignados: this.cuposAdmitidos,
      CuposOpcionados: this.cuposOpcionados,
      CuposEspeciales: cuposEspeciales,
      Proyectos: [this.info_proyectos],
      Periodo: this.info_periodo,
    };

    this.loading = true;
    this.sgaAdmisionesMid.post('admision/cupos', payload).pipe(
      tap((response: any) => {
        if (response?.Status !== 200) {
          throw new Error('error_guardar_documento');
        }
        this.popUpManager.showSuccessAlert(this.translate.instant('cupos.documento_guardado'));
        this.eventChange.emit(true);
      }),
      switchMap(() => this.obtenerCupos()),
      catchError(() => {
        this.popUpManager.showErrorAlert(this.translate.instant('cupos.error_guardar_documento'));
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  CargarSoporte(data: any) {
    const dialogRef = this.dialogService.open(SoporteCupoInscripcionComponent, {
      width: '800px',
      data
    });
    dialogRef.afterClosed().subscribe({
      next: (result: any) => {
        data.base64 = result.result.base64;
        data.Comentario = result.result.comentario;
        data.TipoInscripcionId = this.dataSource.data[0].TipoInscripcionId
        data.PeriodoId = this.dataSource.data[0].PeriodoId
        data.ProyectoAcademicoId = this.dataSource.data[0].ProyectoAcademicoId
      },
    });
  }

  TiposCupos() {
    const dialogRef = this.dialogService.open(TiposCuposComponent, {
      width: '1500px',
      data: this.dataSource.data
    });
    dialogRef.afterClosed().subscribe({
      next: (result: any) => {
        this.logicaTablaCloseModal(result.result)
      },
    });

  }

  logicaTablaCloseModal(result: any) {
    this.dataSource.data.forEach((element: any) => {
      const exist = result.some((item: any) => item.Id === element.CupoId);
      if (exist == false) {
        this.dataSource.data.splice(this.dataSource.data.indexOf(element), 1)
        this.dataSource.paginator = this.paginator;
      }
    });

    result.forEach((element: any) => {
      const exist = this.dataSource.data.some((item: any) => item.CupoId === element.Id);
      if (exist == false) {
        const registro = {
          Nombre: element.Nombre,
          Descripcion: element.Descripcion,
          Tipo: element.Tipo,
          Activo: true,
          // NombreInscripcion: this.dataSource.data[0].NombreInscripcion,
          NombreInscripcion: (this.dataSource.data[0] && this.dataSource.data[0].NombreInscripcion) ? this.dataSource.data[0].NombreInscripcion : this.tipo_inscripcion.Nombre,
          CuposHabilitados: element.CuposHabilitados,
          CuposOpcionados: element.CuposOpcionados,
          CupoId: element.Id,
          PeriodoId: this.info_periodo.Id,
          ProyectoAcademicoId: this.info_proyectos.Id,
          TipoInscripcionId: this.tipo_inscripcion.Id
        }
        this.dataSource.data.push(registro)
        this.dataSource.paginator = this.paginator;
      }
    });
  }


  EliminarCupo(cupo: any) {
    const data = {
      Activo: false,
      CupoId: cupo.CupoId,
      CuposHabilitados: cupo.CuposHabilitados,
      CuposOpcionados: cupo.CuposOpcionados,
      cuposDisponibles: cupo.cuposDisponibles,
      NombreInscripcion: cupo.NombreInscripcion,
      Nombre: cupo.Nombre,
      PeriodoId: cupo.PeriodoId,
      Descripcion: cupo.Descripcion,
      ProyectoAcademicoId: cupo.ProyectoAcademicoId,
      TipoInscripcionId: { Id: cupo.TipoInscripcionId },
    }
    this.inscripcion.put(`cupo_inscripcion/` + cupo.Id, data).subscribe({
      next: (response: any) => {
        if (response) {
          this.popUpManager.showErrorAlert(this.translate.instant('cupos.cupoEliminado'));
          this.dataSource.data = [];
          this.obtenerCupos().subscribe();
        }
      },
    });
  }

  onAction(event: any) {
    if (event.action == 'eliminar') {
      if (event.data.Id == undefined) {
        this.dataSource.data = this.dataSource.data.filter((item: any) => item.Nombre !== event.data.Nombre);
      } else {
        this.EliminarCupo(event.data)
      }
    }
    if (event.action == 'soporte') {
      this.CargarSoporte(event.data)

    }
  }

  guardarDocumento() {
    this.dataSource.data.forEach((element: any, index: any) => {
      const file: any[] = [];;
      if (element.Id == undefined) {
        file.push({
          IdDocumento: 74,
          base64: element.base64,
          nombre: element.Nombre,
          descripcion: element.Descripcion
        })
      }
      this.newNuxeoService.uploadFiles(file).subscribe({
        next: (response: any) => {
          if (response[0].Status == "200") {
            //element.Enlace = response[0].res.Enlace
            this.dataSource.data[index].Enlace = response[0].res.Enlace
          }
        },
      });
    });
  }


  async guardarCupos() {
    this.loading = true;
    let Validar = true;
    this.dataSource.data.forEach((element: any) => {
      if (element.Id == undefined) {
        if (element.base64 == undefined || element.Comentario == undefined || element.base64 == "" || element.Comentario == "") {
          Validar = false;
          this.popUpManager.showErrorAlert(this.translate.instant('cupos.cargar_soporte'));
          this.loading = false;
          return;
        }

        if (element.CuposOpcionados == undefined || element.CuposHabilitados == undefined || element.CuposDisponibles == undefined || element.cuposOpcionados == 0 || element.cuposHabilitados == 0 || element.CuposDisponibles == 0) {
          Validar = false;
          this.popUpManager.showErrorAlert(this.translate.instant('cupos.cargar_cantidad_cupos'));
          this.loading = false;
          return;
        }
      }
    });
    if (Validar) {
      await this.guardarDocumento();
      setTimeout(() => {
        this.inscripcionMidService.post('cupos', this.dataSource.data).subscribe({
          next: (response: any) => {
            console.log(this.dataSource.data)
            if (response.Status == 200) {
              this.popUpManager.showSuccessAlert(this.translate.instant('cupos.documento_guardado'));
              this.dataSource.data = [];
              this.obtenerCupos().subscribe();
            }
            this.loading = false;
          },
          error: (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('cupos.error_guardar_documento'));
            this.loading = false;
          },
        });
      }, 3000);
    } else {
      this.loading = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.show_posgrado = !!this.info_nivel;
    if (this.autoPrecargaCupos) {
      this.obtenerCupos().subscribe();
    }
  }

}
