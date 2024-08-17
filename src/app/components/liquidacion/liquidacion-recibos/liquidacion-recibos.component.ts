import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { liquidacion } from 'src/app/models/liquidacion/liquidacion';
import { A, B } from 'src/app/models/liquidacion/Variables';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { UserService } from 'src/app/services/users.service';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { LiquidacionService } from 'src/app/services/liquidacion.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectChange } from '@angular/material/select';
import { elementAt } from 'rxjs';
import * as JSZip from 'jszip';
import * as saveAs from 'file-saver';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NotificacionesMidService } from 'src/app/services/notificaciones_mid.service';
import { OikosService } from 'src/app/services/oikos.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';

@Component({
  selector: 'app-liquidacion-recibos',
  templateUrl: './liquidacion-recibos.component.html',
  styleUrls: ['./liquidacion-recibos.component.scss']
})

export class LiquidacionRecibosComponent {
  @Input()
  recibosUrl!: string;
  displayedColumns: string[] = ['seleccion', 'codigo', 'documento', 'nombres', 'apellidos', 'A1', 'puntaje1', 'A2', 'puntaje2', 'A3', 'puntaje3', 'B1', 'puntaje4', 'B2', 'puntaje5', 'B3', 'puntaje6', 'B4', 'puntaje7', 'G1', 'G2', 'G3', 'G4', 'total', 'acciones'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<any>;

  selectedProyecto: any;
  selectedPeriodo: any;
  proyectos: any[] = [];
  periodos: any[] = [];
  facultades!: any[]
  niveles!: NivelFormacion[];
  nivelSelect!: NivelFormacion[];
  selectednivel: any = 1;
  periodo: any;
  tabla: boolean = false;
  liquidaciones: any[] = [];
  admitido: any;
  admitidos: any[] = [];
  recibos: any[] = [];
  pdfs: File[] = [];
  notificaciones: any[] = [];
  generados: boolean = false;
  inscripciones: any = [];
  proyectosPregrado!: any[];

  mostrarFormulario: boolean = false;

  variableA: A = {
    A1: {
      "1": 0,
      "2": 25,
      "3": 45,
      "4": 75,
      "5": 95,
      "6": 100,
      "No Informa": 100,
      "Área rural": 20,
      "Ciudad menor de cien mil habitantes": 45,
      "Ciudad mayor de cien mil habitantes": 70
    },
    A2: {
      "Entre 0 y,004": 15,
      "Entre 0.0041 y 0.08": 20,
      "Entre 0.081 y 0.12": 30,
      "Entre 0.121 y 0.16": 40,
      "Entre 0.161 y 0.2": 50,
      "Entre 0.21 y 0,3": 60,
      "Entre 0.31 y 0.4": 70,
      "Entre 0.41 y 0.5": 80,
      "Entre 0.51 y 0.6": 90,
      "Entre 0.61 y 0.7": 100,
      "Mayor de 0.71": 100,
      "No informa": 100,
    },
    A3: {
      "Entre 0 y 2": 15,
      "Entre 2,1 y 2,5": 25,
      "Entre 2,5 y 3": 30,
      "Entre 3 y 4": 35,
      "Entre 4 y 5": 40,
      "Entre 5 y 5,5": 45,
      "Entre 5,5 y 6": 50,
      "Entre 6 y 6,5": 55,
      "Entre 6,5 y 7": 60,
      "Entre 7 y 7,5": 70,
      "Entre 7,5 y 8": 75,
      "Entre 8 y 9,5": 80,
      "Entre 9,5 y 11": 85,
      "Entre 11 y 14": 90,
      "Entre 14 y 18": 95,
      ">18": 100,
      "No informa": 100,
    }
  }

  variableB: B = {
    B1: {
      "1": 0.6,
      "2": 0.6,
      "3": 0.9,
      "4": 0.9,
      "5": 1,
      "6": 1,
      "Área rural": 0.6,
      "Ciudad menor de cien mil habitantes": 0.9,
      "Ciudad mayor de cien mil habitantes": 1
    },
    B2: {
      "Fuera del perimetro urbano": 0.9,
      "Dentro del perimetro urbano": 1,

    },
    B3: {
      "Vive solo": 0.85,
      "Es casado": 0.85,
      "Otro": 1,
    },
    B4: {
      "Empleado": 0.9,
      "Desempleado": 1,
    }
  }

  data: liquidacion[] = []
  llavesA1: string[] = []
  valorA1: number[] = []
  llavesA2: string[] = []
  valorA2: number[] = []
  llavesA3: string[] = []
  valorA3: number[] = []
  llavesB1: string[] = []
  valorB1: number[] = []
  llavesB2: string[] = []
  valorB2: number[] = []
  llavesB3: string[] = []
  valorB3: number[] = []
  llavesB4: string[] = []
  valorB4: number[] = []
  PBM!: number
  mostrarElementosLiquidacion!: boolean;

  loading: boolean = false;

  tablaRecibo: boolean = true
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  firstFormGroup = this._formBuilder.group({
    validatorFacultad: ['', Validators.required],
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder, private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private userService: UserService,
    private sgaAdmisiones: SgaAdmisionesMid,
    private sgamidService: SgaMidService,
    private liquidacionService: LiquidacionService,
    private inscripcionMidService: InscripcionMidService,
    private autenticationService: ImplicitAutenticationService,
    private inscripcionService: InscripcionService,
    private oikosService: OikosService,
    private notificacionService: NotificacionesMidService) {

  }

  async ngOnInit() {
    this.loading = true;
    await this.cargarFacultades();
    await this.cargarPeriodo();
    await this.cargarProyectosPregrado();

    const validatorProyectoControl = this.firstFormGroup.get('validatorProyecto');
    const validatorPeridoControl = this.firstFormGroup.get('validatorPeriodo');

    if (validatorProyectoControl) {
      validatorProyectoControl.valueChanges.subscribe(value => {
        this.selectedProyecto = value;
      });
    } else {
      console.error('El control "validatorProyecto" es nulo.');
    }
    if (validatorPeridoControl) {
      validatorPeridoControl.valueChanges.subscribe(value => {
        this.selectedPeriodo = value;
      });
    } else {
      console.error('El control "validatorProyecto" es nulo.');
    }
    this.loading = false;
  }

  cargarProyectosPregrado() {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true,NivelFormacionId:1&sortby=Id&order=asc&limit=0')
        .subscribe((res: any) => {
          this.proyectosPregrado = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.facultades_error'));
            this.loading = false;
            console.error(error);
            reject([]);
          });
    });
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    const programas = this.proyectosPregrado.filter((item: any) => item.FacultadId == event.value);
    this.proyectos = programas;
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = res.Data.find((p: any) => p.Activo);
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {

              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  async realizarBusqueda() {
    this.loading = true;
    const proyecto = this.firstFormGroup.get('validatorProyecto')?.value;
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;
    this.inscripciones = await this.buscarInscripcionesAdmitidosLegalizados(proyecto, periodo)
    await this.generarRegistros();
    this.tabla = true;
    this.loading = false;
  }

  buscarInscripcionesAdmitidosLegalizados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=Activo:true,ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:8&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.error(error);
            this.loading = false;
            reject([]);
          });
    });
  }

  async generarRegistros() {
    this.loading = true;
    this.data = [];
  
    for (const inscripcion of this.inscripciones) {
      try {
        const persona: any = await this.consultarTercero(inscripcion.PersonaId);
        if (Array.isArray(persona) && persona.length === 0) {
          continue;
        }
  
        const infoLegalizacion: any = await this.getLegalizacionMatricula(persona.Id);
        if (infoLegalizacion === "No existe legalizacion") {
          continue;
        }
  
        if (!infoLegalizacion || infoLegalizacion.pensionSM11 == null || infoLegalizacion.ingresosSMCostea == null) {
          console.error('Datos incompletos en infoLegalizacion:', infoLegalizacion);
          continue;
        }
  
        const valorStringA2 = this.calcularValorPension(infoLegalizacion.pensionSM11);
        const valorStringA3 = this.calcularValorIngresos(infoLegalizacion.ingresosSMCostea);
  
        const valorLiquidacionData: any = {
          "estado_edicion": false,
          "inscripcionId": inscripcion.Id,
          "personaId": persona.Id,
          "seleccion": true,
          "codigo": 1000,
          "documento": persona.NumeroIdentificacion,
          "nombres": `${persona.PrimerNombre} ${persona.SegundoNombre}`,
          "apellidos": `${persona.PrimerApellido} ${persona.SegundoApellido}`,
          A: {
            A1: infoLegalizacion.estratoCostea,
            puntajeA1: this.variableA.A1[infoLegalizacion.estratoCostea],
            A2: infoLegalizacion.pensionSM11,
            puntajeA2: this.variableA.A2[valorStringA2],
            A3: infoLegalizacion.ingresosSMCostea,
            puntajeA3: this.variableA.A3[valorStringA3],
          },
          B: {
            B1: infoLegalizacion.estratoCostea,
            puntajeB1: this.variableB.B1[infoLegalizacion.estratoCostea],
            B2: infoLegalizacion.ubicacionResidenciaCostea,
            puntajeB2: this.variableB.B2[infoLegalizacion.ubicacionResidenciaCostea],
            B3: infoLegalizacion.nucleoFamiliar,
            puntajeB3: this.variableB.B3[infoLegalizacion.nucleoFamiliar],
            B4: infoLegalizacion.situacionLaboral,
            puntajeB4: this.variableB.B4[infoLegalizacion.situacionLaboral],
          },
          general: {
            pbm: 10,
          },
        };
  
        this.calculoPBM(valorLiquidacionData);
        this.data.push(valorLiquidacionData);
      } catch (error) {
        console.error('Error procesando inscripción:', inscripcion, error);
      }
    }
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  
    this.loading = false;
  }

  async consultarTercero(personaId: any): Promise<any | []> {
    try {
      const response = await this.sgamidService.get('persona/consultar_persona/' + personaId).toPromise();
      return response;
    } catch (error) {
      this.loading = false;
      console.error(error)
      return []; 
    }
  }

  async getLegalizacionMatricula(personaId: any) {
    return new Promise((resolve, reject) => {
      //this.loading = true;
      this.inscripcionMidService.get('legalizacion/informacion-legalizacion/' + personaId)
        .subscribe((res: any) => {
          resolve(res.Data);
        },
          (error: any) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('admision.legalizacion_error')
            );
          });
    });
  }

  calcularValorPension(valorSM: any) {
    let valorString;

    switch (true) {
      case valorSM <= 0.004:
        valorString = "Entre 0 y,004"
        break;
      case valorSM <= 0.08:
        valorString = "Entre 0.0041 y 0.08"
        break;
      case valorSM <= 0.12:
        valorString = "Entre 0.081 y 0.12"
        break;
      case valorSM <= 0.16:
        valorString = "Entre 0.121 y 0.16"
        break;
      case valorSM <= 0.2:
        valorString = "Entre 0.161 y 0.2"
        break;
      case valorSM <= 0.3:
        valorString = "Entre 0.21 y 0,3"
        break;
      case valorSM <= 0.4:
        valorString = "Entre 0.31 y 0.4"
        break;
      case valorSM <= 0.5:
        valorString = "Entre 0.41 y 0.5"
        break;
      case valorSM <= 0.6:
        valorString = "Entre 0.51 y 0.6"
        break;
      case valorSM <= 0.7:
        valorString = "Entre 0.61 y 0.7"
        break;
      case valorSM > 0.7:
        valorString = "Entre 0.61 y 0.7"
        break;
      default:
        valorString = "No informa"
    }

    return valorString;
  }

  calcularValorIngresos(valorSM: any) {
    let valorString;

    switch (true) {
      case valorSM <= 2:
        valorString = "Entre 0 y 2"
        break;
      case valorSM <= 2.5:
        valorString = "Entre 2,1 y 2,5"
        break;
      case valorSM <= 3:
        valorString = "Entre 2,5 y 3"
        break;
      case valorSM <= 4:
        valorString = "Entre 3 y 4"
        break;
      case valorSM <= 5:
        valorString = "Entre 4 y 5"
        break;
      case valorSM <= 5.5:
        valorString = "Entre 5 y 5,5"
        break;
      case valorSM <= 6:
        valorString = "Entre 5,5 y 6"
        break;
      case valorSM <= 6.5:
        valorString = "Entre 6 y 6,5"
        break;
      case valorSM <= 7:
        valorString = "Entre 6,5 y 7"
        break;
      case valorSM <= 7.5:
        valorString = "Entre 7 y 7,5"
        break;
      case valorSM <= 8:
        valorString = "Entre 7,5 y 8"
        break;
      case valorSM <= 9.5:
        valorString = "Entre 8 y 9,5"
        break;
      case valorSM <= 11:
        valorString = "Entre 9,5 y 11"
        break;
      case valorSM <= 14:
        valorString = "Entre 11 y 14"
        break;
      case valorSM <= 18:
        valorString = "Entre 14 y 18"
        break;
      case valorSM > 18:
        valorString = ">18"
        break;
      default:
        valorString = "No informa"
    }

    return valorString;
  }

  calculoPBM(element: liquidacion) {
    const { puntajeA1, puntajeA2, puntajeA3 } = element.A
    const { puntajeB1, puntajeB2, puntajeB3, puntajeB4 } = element.B
    element.general.pbm = (puntajeA1 * 0.35) + (puntajeA2 * 0.25) + (puntajeA3 * 0.4) * (puntajeB1 * puntajeB2 * puntajeB3 * puntajeB4)
  }

  applyFilterProces(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('recibosUrl' in changes) {
      const recibosUrlChange = changes['recibosUrl'];
    }
  }

  guardarLiquidaciones() {
    this.admitidos.forEach(row => {
      const liqDetalle = [];
      if (row.Seguro) {
        liqDetalle.push({ tipo_concepto_id: 111, valor: 111 }); //No exixte parametro para seguro 
      }
      if (row.Carne) {
        liqDetalle.push({ tipo_concepto_id: 111, valor: 111 }); //No exixte parametro para carné
      }
      if (row.Sistematizacion) {
        liqDetalle.push({ tipo_concepto_id: 111, valor: 111 }); //No exixte parametro para sistematización 
      }
      if (row.pbm) {
        if (typeof row.pbm === 'number') {
          liqDetalle.push({ tipo_concepto_id: 111, valor: row.pbm }); //No exixte parametro para pbm
        } else {
          liqDetalle.push({ tipo_concepto_id: 111, valor: -1 }); //No exixte parametro para pbm
        }
      }

      const liquidacion = {
        tercero_id: parseInt(row.Documento, 10),
        periodo_id: this.selectedPeriodo.Id,
        programa_academico_id: this.selectedProyecto.Id,
        tipo_programa_id: this.selectednivel,
        recibo_id: 111, //consecutivo de recibo (?)
        liqDetalle: liqDetalle
      };
      this.liquidaciones.push(liquidacion);
    });
    for (const liquidacion of this.liquidaciones) {
      this.liquidacionService.post('liquidacion/', liquidacion)
        .subscribe(
          (res: any) => {
            const r = <any>res;
          },
          (error: HttpErrorResponse) => {
          }
        );
    }
  }

  generarRecibos() {
    this.admitidos.forEach(row => {
      const reciboConceptos = [];
      const reciboObs: { Ref: any; Descripcion: string; }[] = [];
      reciboConceptos.push({ Ref: "1", Descripcion: "MATRICULA", Valor: row.totalMatricula });
      if (row.Seguro) {
        reciboConceptos.push({ Ref: "2", Descripcion: "SEGURO", Valor: 111 }); //No exixte parametro para seguro 
      }
      if (row.Carne) {
        reciboConceptos.push({ Ref: "3", Descripcion: "CARNET", Valor: 111 }); //No exixte parametro para carné
      }
      if (row.Sistematizacion) {
        reciboConceptos.push({ Ref: "4", Descripcion: "SISTEMATIZACIÓN", Valor: 111 }); //No exixte parametro para sistematización 
      }
      if (row.pbm) {
        reciboConceptos.push({ Ref: "1", Descripcion: "MATRICULA", Valor: 111 }); //No exixte parametro para sistematización 
      }
      row.Descuentos.forEach((descuento: any) => {
        switch (descuento) {
          case 1:
            reciboObs.push({ Ref: "1", Descripcion: "Certificado electoral" }); // Certificado electoral
            break;
          case 2:
            reciboObs.push({ Ref: "2", Descripcion: "Certificado electoral" }); // Monitorias
            break;
          case 3:
            reciboObs.push({ Ref: "3", Descripcion: "Representante de consejo superior y/o académico" }); // Representante de consejo superior y/o académico
            break;
          case 4:
            reciboObs.push({ Ref: "4", Descripcion: "Mejor saber- pro (ECAES)" }); // Mejor saber- pro (ECAES)
            break;
          case 5:
            reciboObs.push({ Ref: "5", Descripcion: "Pariente de personal de planta UD" }); // Pariente de personal de planta UD
            break;
          case 6:
            reciboObs.push({ Ref: "6", Descripcion: "Egresado UD" }); // Egresado UD
            break;
          case 7:
            reciboObs.push({ Ref: "7", Descripcion: "Beca de secretaría de educación" }); // Beca de secretaría de educación
            break;
          default:
            break;
        }
      });
      const recibo = {
        Nombre: row.Nombre + row.PrimerApellido + row.SegundoApellido,
        Tipo: "Estudiante",
        CodigoEstudiante: row.Codigo,
        Documento: row.Documento,
        Periodo: "a",//this.selectedPeriodo.Nombre,
        Dependencia: {
          Tipo: "Proyecto Curricular",
          Nombre: "a",//this.selectedProyecto.Nombre
        },
        Conceptos: reciboConceptos,
        Observaciones: reciboObs,
        Fecha1: "30/02/2023",
        Fecha2: "30/02/2023",
        Recargo: 1.5,
        Comprobante: "0666",
        Correo: row.Correo,
        CorreosAlt: row.Correos
      };
      this.recibos.push(recibo);
    });
    this.pdfs = [];

    const promesas = [];

    /*Este for es para generar los recibos haciendo la petición al mid de 
    inscripciones, pero al generar los pdfs cosa que solo se puede hacer en 
    el cliente se tarda mucho, se bloquearon los botones de descargar y asignar 
    para que se sepa cuando esta listo 
    */

    for (let i = 0; i < this.recibos.length; i++) {
      const recibo = this.recibos[i];
      const promesa = this.inscripcionService.post('recibov2/', recibo)
        .toPromise()
        .then((response: any) => {
          if (response.success && response.data) {
            const byteArray = atob(response.data);
            const byteNumbers = new Array(byteArray.length);
            for (let j = 0; j < byteArray.length; j++) {
              byteNumbers[j] = byteArray.charCodeAt(j);
            }
            const file = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
            const fileName = `recibo_${recibo.CodigoEstudiante}_${9}_${30}_${i}.pdf`;
            //${this.selectedPeriodo.Id}_${this.selectedProyecto.Id}_${i}.pdf`;
            const fileWithFileName = new File([file], fileName, { type: file.type });
            this.pdfs.push(fileWithFileName);

            // Esto es específicamente para las notificaciones por correo; toda la info del estudiante debería estar contenida acá
            const notificacion = {
              data: response.data,
              fileName: fileName,
              correo: recibo.Correo,
              correosAlt: recibo.CorreosAlt,
              nombre: recibo.Nombre,
              codigo: recibo.CodigoEstudiante
            };
            this.notificaciones.push(notificacion);
          }
        })
        .catch((error: HttpErrorResponse) => {
          console.error(error);
        });

      promesas.push(promesa);
    }

    Promise.all(promesas)
      .then(() => {
        this.generados = true;
      })
      .catch((error) => {
        console.error('Error generando recibos:', error);
      });
  }

  notificarGeneracionRecibos() {
    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const mes = String(today.getMonth() + 1).padStart(2, '0');
    const anio = today.getFullYear();

    this.notificaciones.forEach((notificacion) => {
      const data = {
        Source: "notificaciones_sga@udistrital.edu.co", //El correo que envia la notificación
        Template: "TEST_SGA_generacion-recibo", //La plantilla que se va a usar esta es temporal y esta sin imagen 
        Destinations: [
          {
            Destination: {
              BccAddresses: [],//notificacion.correosAlt,
              CcAddresses: [],
              ToAddresses: [
                notificacion.correo
              ]
            },
            ReplacementTemplateData: {
              dia: dia,
              mes: mes,
              anio: anio,
              nombre: notificacion.nombre,
              periodo: this.selectedPeriodo.Nombre
            },
            Attachments: [{
              ContentType: "application/pdf",
              FileName: notificacion.fileName,
              Base64File: notificacion.data
            }
            ]
          }
        ],
        DefaultTemplateData: {
          dia: dia,
          mes: mes,
          anio: anio,
          nombre: notificacion.nombre,
          periodo: this.selectedPeriodo.Nombre
        },
      };

      this.notificacionService.post('email/enviar_templated_email/', data)
        .subscribe(
          (response: any) => {
            if (response.success) {
              console.info('Notificación enviada:', response.success);
            }
          },
          (error: HttpErrorResponse) => {
            console.error('Error al enviar la notificación:', error);
          }
        );
    });
  }

  descargarPDFs(): void {
    const zip = new JSZip();
    this.pdfs.forEach((pdf, index) => {
      zip.file(`pdf_${index + 1}.pdf`, pdf);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'recibos_pdf.zip');
    });
  }

}








