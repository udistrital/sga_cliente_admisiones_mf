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

@Component({
  selector: 'app-liquidacion-recibos',
  templateUrl: './liquidacion-recibos.component.html',
  styleUrls: ['./liquidacion-recibos.component.scss']
})

export class LiquidacionRecibosComponent {

  @Input()
  recibosUrl!: string;

  selectedProyecto: any;
  selectedPeriodo: any;
  proyectos: any[] = [];
  periodos: any[] = [];
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

  constructor(private _formBuilder: FormBuilder, private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private userService: UserService,
    private sgaAdmisiones: SgaAdmisionesMid,
    private liquidacionService: LiquidacionService,
    private autenticationService: ImplicitAutenticationService,
    private inscripcionService: InscripcionService,
    private notificacionService: NotificacionesMidService) {

    this.cargarProyectos();
    this.cargarPeriodo();
  }


  tablaRecibo:boolean=true
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorSemestre: ['', Validators.required]
  });


  ngOnInit() {
    this.cargarProyectos();
    this.cargarPeriodo();
    this.generarRegistros();
    this.calculoMatricula();

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
  }

  cargarProyectos() {
    this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
      (response: any) => {
        this.autenticationService.getRole().then(
          // (rol: Array <String>) => {
          (rol: any) => {
            let r = rol.find((role: any) => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
            if (r) {
              this.proyectos = <any[]>response.filter(
                (proyecto: any) => this.filtrarProyecto(proyecto),
              );
            } else {
              const id_tercero = this.userService.getPersonaId();
              this.sgaAdmisiones.get('admision/dependencia_vinculacion_tercero/' + id_tercero).subscribe(
                (respDependencia: any) => {
                  const dependencias = <Number[]>respDependencia.Data.DependenciaId;
                  this.proyectos = <any[]>response.filter(
                    (proyecto: any) => dependencias.includes(proyecto.Id)
                  );
                  if (dependencias.length > 1) {
                    this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('admision.multiple_vinculacion'));//+". "+this.translate.instant('GLOBAL.comunicar_OAS_error'));
                    //this.proyectos.forEach(p => { p.Id = undefined })
                  }
                },
                (error: any) => {
                  this.popUpManager.showErrorAlert(this.translate.instant('admision.no_vinculacion_no_rol') + ". " + this.translate.instant('GLOBAL.comunicar_OAS_error'));
                }
              );
            }
          }
        );
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }
  filtrarProyecto(proyecto: any) {
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
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

  mostrarTabla() {
    this.tabla = true;
    this.cargarAdmitidos(this.selectedPeriodo,this.selectednivel)
    this.calculoMatricula();
  }
  

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
      "Area Rural": 20,
      "Ciudad menor de 100mil habitantes": 45,
      "Ciudad mayor de 100mil habitantes": 70
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
      "Estrato 1 y 2 o rural": 0.6,
      "Estrato 3 y 4 ciudad < 100 mil hab, no estratificada": 0.9,
      "Estrato 5 y 6, > 100 mil habitantes no estratificada": 1,

    },
    B2: {
      "Fuera del Perimetro Urbano": 0.9,
      "Dentro del Perimetro Urbano": 1,

    },
    B3: {
      "Vive solo o es casado": 0.85,
      "Otros": 1,
    },
    B4: {
      "Trabaja": 0.9,
      "No trabaja": 1,
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
 
  displayedColumns: string[] = ['seleccion', 'codigo', 'documento', 'nombres', 'apellidos', 'A1', 'puntaje1', 'A2', 'puntaje2', 'A3', 'puntaje3', 'B1', 'puntaje4', 'B2', 'puntaje5', 'B3', 'puntaje6', 'B4', 'puntaje7', 'G1', 'G2', 'G3', 'G4', 'total', 'acciones'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<liquidacion>;

  generarRegistros() {
    for (let i = 0; i < 20; i++) {
      const liquidaciondata: liquidacion = {
        seleccion: true,
        codigo: i + 1,
        documetno: 100000000 + i,
        nombres: "Nombre" + (i + 1),
        apellidos: "Apellido" + (i + 1),
        A: {
          A1: "1",
          puntajeA1: this.variableA.A1["1"],
          A2: "Entre 0 y,004",
          puntajeA2: this.variableA.A2["Entre 0 y,004"],
          A3: "Entre 0 y 2",
          puntajeA3: this.variableA.A3["Entre 0 y 2"],
        },
        B: {
          B1: "Estrato 1 y 2 o rural",
          puntajeB1: this.variableB.B1["Estrato 1 y 2 o rural"],
          B2: "Fuera del Perimetro Urbano",
          puntajeB2: this.variableB.B2["Fuera del Perimetro Urbano"],
          B3: "Vive solo o es casado",
          puntajeB3: this.variableB.B3["Vive solo o es casado"],
          B4: "Trabaja",
          puntajeB4: this.variableB.B4["Trabaja"],
        },
        general: {
          pbm: 10,
        },
        estado_edicion: false,
        inscripcionId: 0,
        personaId: 0
      };
      this.data.push(liquidaciondata);
      this.dataSource = new MatTableDataSource(this.data);

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, 300);

    }

  }

  obtenerClaves(variableA: A, variableB: B) {
    const { A1, A2, A3 } = variableA
    const { B1, B2, B3, B4 } = variableB
    const calves = Object.keys(A1)
    const calves2 = Object.keys(A2)
    const calves3 = Object.keys(A3)
    const calves4 = Object.keys(B1)
    const calves5 = Object.keys(B2)
    const calves6 = Object.keys(B3)
    const calves7 = Object.keys(B4)
    calves.forEach(llave => this.llavesA1.push(llave))
    calves2.forEach(llave => this.llavesA2.push(llave))
    calves3.forEach(llave => this.llavesA3.push(llave))
    calves4.forEach(llave => this.llavesB1.push(llave))
    calves5.forEach(llave => this.llavesB2.push(llave))
    calves6.forEach(llave => this.llavesB3.push(llave))
    calves7.forEach(llave => this.llavesB4.push(llave))
    this.valorA1 = Object.values(this.variableA.A1);
    this.valorA2 = Object.values(this.variableA.A2);
    this.valorA3 = Object.values(this.variableA.A3);
    this.valorA1 = Object.values(this.variableB.B1);
    this.valorA2 = Object.values(this.variableB.B2);
    this.valorA3 = Object.values(this.variableB.B3);
    this.valorA3 = Object.values(this.variableB.B4);

  }



  actualizarpuntaje(element: liquidacion, caso: string) {
    switch (caso) {
      case 'A1':
        element.A.puntajeA1 = this.variableA.A1[element.A.A1];
        break;
      case 'A2':
        element.A.puntajeA2 = this.variableA.A2[element.A.A2];;
        break;
      case 'A3':
        element.A.puntajeA3 = this.variableA.A3[element.A.A3];;
        break;
      case 'B1':
        element.B.puntajeB1 = this.variableB.B1[element.B.B1];;
        break;
      case 'B2':
        element.B.puntajeB2 = this.variableB.B2[element.B.B2];;
        break;
      case 'B3':
        element.B.puntajeB3 = this.variableB.B3[element.B.B3];;
        break;
      case 'B4':
        element.B.puntajeB4 = this.variableB.B4[element.B.B4];;
        break;
    }
    this.calculoPBM(element)
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

  cargarAdmitidos(id_periodo: undefined, id_proyecto: undefined) {
    return new Promise((resolve, reject) => {
      //const url = `liquidacion/?id_periodo=${id_periodo}&id_proyecto=${id_proyecto}`;
      const url = `liquidacion/?id_periodo=9&id_proyecto=32`;
  
      this.sgaAdmisiones.get(url).subscribe(
        (response: { Data: any; }) => {
          console.log('Datos cargados:', response);
          const data = response.Data;
          this.admitidos = data;
          this.admitidos.forEach(element => {
            element.Seguro = true;
            element.Carne = true;
            element.Sistematizacion = true;
            element.a1='1';
            element.a2='1';
            element.a3='1';
            element.b1='1';
            element.b2='1';
            element.b3='1';
            element.b4='1';
            element.pbm=10;
            element.Correo = "pruebas@udistrital.edu.co";
            this.calculoMatricula();
          });
          resolve(data); // Resuelve la promesa con los datos cargados
        },
        (error: any) => {
          console.error('Error al cargar datos:', error);
          reject(error); // Rechaza la promesa con el error
        }
      );
    });
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
        liqDetalle.push({ tipo_concepto_id: 111, valor: -1}); //No exixte parametro para pbm
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

  calculoMatricula(){
    this.admitidos.forEach(element => {
      element.totalMatricula = element.pbm*1000;
    });
  }

  generarRecibos() {
    this.admitidos.forEach(row => {
      const reciboConceptos = [];
      const reciboObs: { Ref: any; Descripcion: string; }[] = [];
      reciboConceptos.push({ Ref: "1", Descripcion: "MATRICULA", Valor: row.totalMatricula });
      if (row.Seguro) {
        reciboConceptos.push({ Ref: "2", Descripcion:"SEGURO",Valor: 111 }); //No exixte parametro para seguro 
      }
      if (row.Carne) {
        reciboConceptos.push({ Ref: "3", Descripcion:"CARNET",Valor: 111 }); //No exixte parametro para carné
      }
      if (row.Sistematizacion) {
        reciboConceptos.push({ Ref: "4", Descripcion:"SISTEMATIZACIÓN",Valor: 111 }); //No exixte parametro para sistematización 
      }
      if (row.pbm) {
        reciboConceptos.push({ Ref: "1", Descripcion:"MATRICULA",Valor: 111 }); //No exixte parametro para sistematización 
      }
      row.Descuentos.forEach((descuento: any) => {
        switch (descuento) {
          case 1:
            reciboObs.push({ Ref: "1", Descripcion:"Certificado electoral" }); // Certificado electoral
            break;
          case 2:
            reciboObs.push({ Ref: "2", Descripcion:"Certificado electoral" }); // Monitorias
            break;
          case 3:
            reciboObs.push({ Ref: "3", Descripcion:"Representante de consejo superior y/o académico" }); // Representante de consejo superior y/o académico
            break;
          case 4:
            reciboObs.push({ Ref: "4", Descripcion:"Mejor saber- pro (ECAES)" }); // Mejor saber- pro (ECAES)
            break;
          case 5:
            reciboObs.push({ Ref: "5", Descripcion:"Pariente de personal de planta UD" }); // Pariente de personal de planta UD
            break;
          case 6:
            reciboObs.push({ Ref: "6", Descripcion:"Egresado UD" }); // Egresado UD
            break;
          case 7:
            reciboObs.push({ Ref: "7", Descripcion:"Beca de secretaría de educación" }); // Beca de secretaría de educación
            break;
          default:
            break;
        }
      });
      const recibo = {
        Nombre: row.Nombre+row.PrimerApellido+row.SegundoApellido,
        Tipo: "Estudiante",
        CodigoEstudiante: row.Codigo,
        Documento: row.Documento,
        Periodo: this.selectedPeriodo.Nombre,
        Dependencia: {
          Tipo: "Proyecto Curricular",
          Nombre: this.selectedProyecto.Nombre
        },
        Conceptos: reciboConceptos,
        Observaciones: reciboObs,
        Fecha1: "30/02/2023",
        Fecha2: "30/02/2023",
        Recargo: 1.5,
        Comprobante: "0666",
        Correo: row.Correo
      };
      this.recibos.push(recibo);
    });
    console.log(this.recibos)
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
            //console.log('Recibo generado', response.success);
            const byteArray = atob(response.data);
            const byteNumbers = new Array(byteArray.length);
            for (let j = 0; j < byteArray.length; j++) {
              byteNumbers[j] = byteArray.charCodeAt(j);
            }
            const file = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
            const fileName = `recibo_${recibo.CodigoEstudiante}_${this.selectedPeriodo.Id}_${this.selectedProyecto.Id}_${i}.pdf`;
            const fileWithFileName = new File([file], fileName, { type: file.type });
            this.pdfs.push(fileWithFileName);

            // Esto es específicamente para las notificaciones por correo; toda la info del estudiante debería estar contenida acá
            const notificacion = {
              data: response.data,
              fileName: fileName,
              correo: recibo.Correo,
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
        console.log('Recibos generados');
        this.generados = true;
      })
      .catch((error) => {
        console.error('Error generando recibos:', error);
      });
  }

  notificarGeneracionRecibos() {
    console.log('Notificando generación de recibos...');
    console.log('Notificaciones:', this.notificaciones);

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
              BccAddresses: [],
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
              console.log('Notificación enviada:', response.success);
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








