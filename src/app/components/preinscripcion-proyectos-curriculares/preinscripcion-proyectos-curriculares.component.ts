import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { TercerosService } from 'src/app/services/terceros.service';

@Component({
  selector: 'app-preinscripcion-proyectos-curriculares',
  templateUrl: './preinscripcion-proyectos-curriculares.component.html',
  styleUrls: ['./preinscripcion-proyectos-curriculares.component.scss']
})
export class PreinscripcionProyectosCurricularesComponent {

  // *NgIf
  mostrarPreinscripcion = true;
  detallePreinscripcion = false;

  //Variables para el formulario
  sexoValue!: string;
  tipos_documento!: any[];
  telefonoValue!: string;
  selectTipoDocumento!: string;
  numeroDocumentoValue!: string;
  correoElectronicoValue!: string;

  primerNombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  segundoNombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  primerApellido = new FormControl('', [Validators.required, Validators.minLength(2)]);
  segundoApellido = new FormControl('', [Validators.required, Validators.minLength(2)]);
  tipoDocumento = new FormControl('', [Validators.required]);
  numeroDocumento = new FormControl('', [Validators.required, Validators.pattern("^[0-9]{10}$")]);
  fechaExpedicion = new FormControl('', [Validators.required]);
  fechaNacimiento = new FormControl('', [Validators.required]);
  sexo = new FormControl('', [Validators.required]);
  correoElectronico = new FormControl('', [Validators.required, Validators.email]);
  telefono = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]);

  //Tabla de preinscripciones
  datasourcePreinscipcion = new MatTableDataSource<any>;
  displayedColumnsPreinscipcion: string[] = ["recibo", "inscripcion", "nivel", "tipo_inscripcion", "estado_inscripcion", "fecha_generacion", "resultado"];
  @ViewChild(MatPaginator) paginator1!: MatPaginator;

  //Tabla de detalle preinscripciones
  datasourceDetallePreinscipcion = new MatTableDataSource<any>;
  displayedDetalleColumnsPreinscipcion: string[] = ["credencial", "proyecto", "puntaje", "estado"];

  //Consulta Persona
  idPersona: number = 94;

  //Modulo Informacion detallada de la preinscripcion
  periodo!: string;
  nivel!: string;
  tipoInscripcion!: string;



  constructor(
    private tercero: TercerosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private proyectoAcademicoService: ProyectoAcademicoService,
  ) { }

  ngOnInit() {
    this.ConsultaPersona();
    this.ConsultarDocumento();
    this.InformacioComplementaria();
  }

  Regresar() {
    this.detallePreinscripcion = false;
    this.mostrarPreinscripcion = true;
  }

  InformacioComplementaria() {
    this.tercero.get(`info_complementaria_tercero?query=TerceroId.Id:${this.idPersona}`).subscribe((response: any) => {
      if (response != null || response != undefined || response.length != 0) {
        response.forEach((element: any) => {
          if (element.InfoComplementariaId.Id === 51) {
            this.telefono.setValue(element.Dato);
          }
          if (element.InfoComplementariaId.Id === 53) {
            let jsonObject = JSON.parse(element.Dato);
            this.correoElectronico.setValue(jsonObject.Data);
          }

          if (element.InfoComplementariaId.Id === 32) {
            this.sexo.setValue(element.Dato);
          }

          if (element.InfoComplementariaId.Id === 33) {
            this.sexo.setValue(element.Dato);
          }

        });
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
      }
    });
  }

  CambioTipoDocumentoChange() {
    this.tipos_documento.forEach((element: any) => {
      if (element.TipoDocumentoId.Id === this.selectTipoDocumento) {
        this.numeroDocumentoValue = element.Numero;
        this.fechaExpedicion.setValue(element.FechaExpedicion);
      }
    });
  }

  ConsultarDocumento() {
    this.tipos_documento = [];
    this.tercero.get(`datos_identificacion?query=TerceroId.Id:${this.idPersona}`).subscribe(
      (response: any) => {
        if (response != null || response != undefined || response.length != 0) {
          response.forEach((element: any) => {
            this.tipos_documento.push(element);
            this.selectTipoDocumento = this.tipos_documento[0].TipoDocumentoId.Id;
            this.CambioTipoDocumentoChange();
          });
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
        }
      },
      (error) => {
        this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
      }
    );
  };

  ConsultaPersona() {
    this.tercero.get(`tercero?query=Id:${this.idPersona}`).subscribe(
      (response: any) => {
        if (response != null || response != undefined || response.length != 0) {
          this.primerNombre.setValue(response[0].PrimerNombre);
          this.segundoNombre.setValue(response[0].SegundoNombre);
          this.primerApellido.setValue(response[0].PrimerApellido);
          this.segundoApellido.setValue(response[0].SegundoApellido);
          this.fechaNacimiento.setValue(response[0].FechaNacimiento);
          this.ListadoPreinscripciones(response[0].Id);
          this.sexo.disable();
          this.telefono.disable();
          this.primerNombre.disable();
          this.segundoNombre.disable();
          this.primerApellido.disable();
          this.segundoApellido.disable();
          this.fechaNacimiento.disable();
          this.numeroDocumento.disable();
          this.fechaExpedicion.disable();
          this.correoElectronico.disable();
          this.tipoDocumento.disable();
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
        }
      },
      (error) => {
        this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
      }
    );
  }


  ListadoPreinscripciones(idPersona: number) {
    this.inscripcionService.get(`inscripcion?query=PersonaId:${idPersona}`).subscribe(
      (response: any) => {
        if (response != null || response != undefined || response.length != 0) {
          response.forEach((element: any, index: number) => {
            let id = element.ProgramaAcademicoId;
            this.proyectoAcademicoService.get("tr_proyecto_academico").subscribe((proyectoResponse: any) => {
              if (proyectoResponse != null || proyectoResponse != undefined || proyectoResponse.length != 0) {
                const proyectoAcademico = proyectoResponse.filter((proyecto: any) => proyecto.ProyectoAcademico.Id === id);
                response[index].ProyectoAcademico = proyectoAcademico[0].ProyectoAcademico; // Guardar el proyecto académico en el registro de response
                this.datasourcePreinscipcion = new MatTableDataSource(response);
                this.datasourcePreinscipcion.paginator = this.paginator1;
              } else {
                this.detallePreinscripcion = false;
                this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
              }
            });
          });
        } else {
          this.detallePreinscripcion = false;
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
        }
      }
    );
  }

  ConsultarPeriodo(IdPeriodo: number) {
    this.parametrosService.get(`periodo/?query=Id:${IdPeriodo}`)
      .subscribe((response: any) => {
        if (response.Status == "200") {
          this.periodo = response.Data[0]["Nombre"];
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
        }

      });
  }

  InformacionDetalladaPreinscripciones(idInscripcion: number) {
    this.inscripcionService.get(`inscripcion?query=Id:${idInscripcion}`).subscribe(
      (response: any) => {
        if (response != null || response != undefined || response.length != 0) {
          this.detallePreinscripcion = true;
          this.mostrarPreinscripcion = false;
          let id = response[0].ProgramaAcademicoId;
          this.proyectoAcademicoService.get("tr_proyecto_academico").subscribe((proyectoResponse: any) => {
            if (proyectoResponse != null || proyectoResponse != undefined || proyectoResponse.length != 0) {
              const proyectoAcademico = proyectoResponse.filter((proyecto: any) => proyecto.ProyectoAcademico.Id === id);
              response[0].ProyectoAcademico = proyectoAcademico[0].ProyectoAcademico; // Guardar el proyecto académico en el registro de response
              this.datasourceDetallePreinscipcion = new MatTableDataSource(response);
              this.ConsultarPeriodo(response[0].PeriodoId);
              this.nivel = response[0].ProyectoAcademico.NivelFormacionId.Nombre;
              this.tipoInscripcion = response[0].TipoInscripcionId.Nombre;
            } else {
              this.detallePreinscripcion = false;
              this.mostrarPreinscripcion = true;
              this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            }
          });
        } else {
          this.detallePreinscripcion = false;
          this.mostrarPreinscripcion = true;
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
        }
      }
    );
  }
}


