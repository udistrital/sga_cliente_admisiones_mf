import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { navigateToUrl } from 'single-spa';
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
  displayedColumnsPreinscipcion: string[] = ["recibo", "inscripcion", "nivel", "tipo_inscripcion", "estado_inscripcion", "activo", "fecha_generacion", "resultado"];

  //Tabla de detalle preinscripciones
  datasourceDetallePreinscipcion = new MatTableDataSource<any>;
  displayedDetalleColumnsPreinscipcion: string[] = ["credencial", "proyecto", "puntaje", "estado"];

  //Consulta Persona
  idPersona: number = 292962;

  //Modulo Informacion detallada de la preinscripcion
  periodo!: string;
  nivel!: string;
  tipoInscripcion!: string;

  loading!: boolean;

  constructor(
    private tercero: TercerosService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private proyectoAcademicoService: ProyectoAcademicoService
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.setearInfoPersona();
    await this.consultarDocumento();
    await this.informacioComplementaria();
    this.loading = false;
  }

  async regresar() {
    this.loading = true;
    this.detallePreinscripcion = false;
    this.mostrarPreinscripcion = true;
    await this.setearInfoPersona();
    this.loading = false;
  }

  async informacioComplementaria() {
    const infoComplementaria: any = await this.recuperarInfoComplementariaTercero(this.idPersona)
    infoComplementaria.forEach((element: any) => {
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
  }

  recuperarInfoComplementariaTercero(id: number) {
    return new Promise((resolve, reject) => {
      this.tercero.get(`info_complementaria_tercero?query=TerceroId.Id:${id}`).subscribe(
          (res: any) => {
            if (res != null || res != undefined || res.length != 0) {
              resolve(res);
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
              this.loading = false;
              reject(false);  
            }
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            this.loading = false;
            reject(false);
          }
        );
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

  async consultarDocumento() {
    this.tipos_documento = [];
    const datosIdentificacion: any = await this.recuperarDatosIdentificacion(this.idPersona);

    for (const dato of datosIdentificacion) {
      this.tipos_documento.push(dato);
      this.selectTipoDocumento = this.tipos_documento[0].TipoDocumentoId.Id;
      this.CambioTipoDocumentoChange();
    }
  }

  recuperarDatosIdentificacion(id: number) {
    return new Promise((resolve, reject) => {
      this.tercero.get(`datos_identificacion?query=TerceroId.Id:${id}`).subscribe(
          (res: any) => {
            if (res != null || res != undefined || res.length != 0) {
              resolve(res);
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
              reject(false);  
            }
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            reject(false);
          }
        );
    });
  }

  async setearInfoPersona() {
    const persona: any = await this.consultarPersona(this.idPersona);
    this.primerNombre.setValue(persona[0].PrimerNombre);
    this.segundoNombre.setValue(persona[0].SegundoNombre);
    this.primerApellido.setValue(persona[0].PrimerApellido);
    this.segundoApellido.setValue(persona[0].SegundoApellido);
    this.fechaNacimiento.setValue(persona[0].FechaNacimiento);
    await this.listadoPreinscripciones(persona[0].Id);
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
  }

  consultarPersona(id: any) {
    return new Promise((resolve, reject) => {
      this.tercero.get(`tercero?query=Id:${id}`).subscribe(
          (res: any) => {
            if (res != null || res != undefined || res.length != 0) {
              resolve(res);
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
              this.loading = false;
              reject(false);  
            }
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            this.loading = false;
            reject(false);
          }
        );
    });    
  }

  async listadoPreinscripciones(idPersona: number) {
    const inscripciones: any = await this.recuperarInscripcionesByPersona(idPersona);
    const proyectosAcademicos: any = await this.recuperarProyectosAcademicos();
    let index = 0;
    
    for (const inscripcion of inscripciones) {
      let id = inscripcion.ProgramaAcademicoId;
      const proyectoAcademico: any = proyectosAcademicos.filter((proyecto: any) => proyecto.ProyectoAcademico.Id === id);
      if (proyectoAcademico.length === 0) {
        continue;
      }
      inscripciones[index].ProyectoAcademico = proyectoAcademico[0].ProyectoAcademico; // Guardar el proyecto académico en el registro de response
      index ++;
    }

    this.datasourcePreinscipcion = new MatTableDataSource(inscripciones);
    this.datasourcePreinscipcion.paginator = this.paginator;
    this.datasourcePreinscipcion.sort = this.sort;
  }

  recuperarInscripcionesByPersona(idPersona: number) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(`inscripcion?query=PersonaId:${idPersona}&sortby=Id&order=asc&limit=0`).subscribe(
        (res: any) => {
          if (res != null || res != undefined || res.length != 0) {
            resolve(res);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            this.loading = false;
            reject(false);
          }
        },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
          this.loading = false;
          reject(false);
        }
      );
    });
  }

  recuperarInscripcionById(id: number) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(`inscripcion?query=Id:${id}&sortby=Id&order=asc&limit=0`).subscribe(
        (res: any) => {
          if (res != null || res != undefined || res.length != 0) {
            resolve(res);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            this.loading = false;
            resolve(false);
          }
        },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
          this.loading = false;
          reject(false);
        }
      );
    });
  }

  recuperarProyectosAcademicos() {
    return new Promise((resolve, reject) => {
      this.proyectoAcademicoService.get("tr_proyecto_academico").subscribe(
        (res: any) => {
          if (res != null || res != undefined || res.length != 0) {
            resolve(res);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            this.loading = false;
            resolve(false);
          }
        },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
          this.loading = false;
          reject(false);
        }
      );
    });
  }

  consultarPeriodo(IdPeriodo: number) {
    return new Promise((resolve, reject) => {
      this.parametrosService.get(`periodo/?query=Id:${IdPeriodo}`).subscribe(
        (res: any) => {
          if (res.Status == "200") {
            resolve(res);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
            this.loading = false;
            reject(false);
          }
        },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('Global.error'));
          this.loading = false;
          reject(false);
        }
      );
    });
  }

  async informacionDetalladaPreinscripciones(idInscripcion: number) {
    this.loading = true;
    const inscripcion: any = await this.recuperarInscripcionById(idInscripcion);
    if (!inscripcion) {
      this.detallePreinscripcion = false;
      this.mostrarPreinscripcion = true;
      return false;
    }

    this.detallePreinscripcion = true;
    this.mostrarPreinscripcion = false;
    let id = inscripcion[0].ProgramaAcademicoId; 
    
    const proyectosAcademicos: any = await this.recuperarProyectosAcademicos();
    if (!proyectosAcademicos) {
      this.detallePreinscripcion = false;
      this.mostrarPreinscripcion = true;
      return false;
    }

    const proyectoAcademico = proyectosAcademicos.filter((proyecto: any) => proyecto.ProyectoAcademico.Id === id);
    inscripcion[0].ProyectoAcademico = proyectoAcademico[0].ProyectoAcademico; // Guardar el proyecto académico en el registro de response
    this.datasourceDetallePreinscipcion = new MatTableDataSource(inscripcion);
    const periodo: any = await this.consultarPeriodo(inscripcion[0].PeriodoId)
    this.periodo = periodo.Data[0]["Nombre"] ? periodo.Data[0]["Nombre"] : 'No especificado';
    this.nivel = inscripcion[0].ProyectoAcademico.NivelFormacionId.Nombre;
    this.tipoInscripcion = inscripcion[0].TipoInscripcionId.Nombre;
    this.loading = false;
    return true;
  }

  esAdmitido(codigoAbreviacion: string) {
    let admitido = false;
    if (codigoAbreviacion === 'ADM' || codigoAbreviacion === 'ADMLEG' || codigoAbreviacion === 'ADMOBS') {
      admitido = true;
    }

    return admitido;
  }

  irPantallaLegalizacion(data: any) {
    const url = `/inscripcion/legalizacion-matricula-aspirante/${data.PersonaId}/${data.PeriodoId}/${data.ProgramaAcademicoId}`;
    navigateToUrl(url);
  }
}


