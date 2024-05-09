import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DetallesPago, ConceptosBase, ConceptosDescuentos, Cuotas } from './form-listado-liquidacion'; // Importa los modelos de datos
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ParametrosService } from 'src/app/services/parametros.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { SgaAdmisionesMid } from 'src/app/services/sga_admisiones_mid.service';
import { UserService } from 'src/app/services/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectChange } from '@angular/material/select';
import { LiquidacionService } from 'src/app/services/liquidacion.service';



interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'udistrital-liquidacion-recibos',
  templateUrl: './liquidacion-recibos.component.html',
  styleUrls: ['./liquidacion-recibos.component.scss']
})
export class LiquidacionRecibosComponent {
  dataSource = new MatTableDataSource<any>();

  displayedColumns: string[] = ['seleccionHeader', 'detallesPagoHeader', 'conceptosBaseHeader', 'conceptosDescuentosHeader', 'fechaPagoCoutasHeader', 'porcentajeCoutasHeader']; // HEADERS
  detallesPagoColumns: string[] = ['codigo', 'cedula', 'nombreApellido', 'creditos', 'cuotas']; // Columnas para DETALLES DEL PAGO
  conceptosBaseColumns: string[] = ['seguroEstudiantil', 'carneEstudiantil', 'sistematizacion']; // Columnas para CONCEPTOS BASE
  conceptosDescuentosColumns: string[] = ['votacion', 'monitor', 'egresado', 'docente', 'beneficiario', 'beca', 'mejorECAES', 'gradoHonor', 'segundoHermano', 'secretariaEducacion', 'doctoradoInterinstitucio']; // Columnas para CONCEPTOS DESCUENTOS
  porcentajeCoutasColumns: string[] = ['fechaCuotaUno', 'fechaCuotaDos', 'fechaCuotaTres', 'primeraCuota', 'segundaCuota', 'terceraCuota']; // Columnas para PORCENTAJE DE CUOTAS

  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorSemestre: ['', Validators.required]
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true; //////////////////////////////////////////////////////
  inscripcion_id!: number;
  info_persona_id!: number;
  info_ente_id!: number;
  estado_inscripcion!: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion!: Inscripcion;
  preinscripcion!: boolean;
  step = 0;
  cambioTab = 0;
  nForms!: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;


  total: boolean = false;

  proyectos: any[] = [];
  criterios = [];
  periodos: any[] = [];
  niveles!: NivelFormacion[];
  nivelSelect!: NivelFormacion[];

  selectedProyecto: any;

  selectedPeriodo: any;

  show_cupos = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;

  info_persona!: boolean;
  loading!: boolean;
  ultimo_select!: number;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected!: any[] | undefined;
  criterio_selected!: any[];
  selectTipoIcfes: any;
  selectTipoEntrevista: any;
  selectTipoPrueba: any;
  selectTabView: any;
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  admitido: any;
  admitidos: any[] = [];
  selectednivel: any = 2;
  esPosgrado: boolean = false;
  liquidaciones: any[] = [];
  recibos: any[] = [];

  constructor(private _formBuilder: FormBuilder, private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private userService: UserService,
    private sgaAdmisiones: SgaAdmisionesMid,
    private liquidacionService: LiquidacionService,
    private autenticationService: ImplicitAutenticationService,) {
    const detallesPago: DetallesPago[] = [
      { codigo: '123', cedula: '1234567890', nombreApellido: 'Juan Perez', creditos: 10, cuotas: 3 },
      { codigo: '456', cedula: '0987654321', nombreApellido: 'Maria Rodriguez', creditos: 15, cuotas: 3 },
      { codigo: '789', cedula: '1357924680', nombreApellido: 'Pedro Gomez', creditos: 20, cuotas: 3 },
    ];

    const conceptosBase: ConceptosBase[] = [
      { seguroEstudiantil: true, carneEstudiantil: false, sistematizacion: true },
      { seguroEstudiantil: false, carneEstudiantil: true, sistematizacion: false },
      { seguroEstudiantil: true, carneEstudiantil: true, sistematizacion: true },
    ];

    const conceptosDescuentos: ConceptosDescuentos[] = [
      { votacion: true, monitor: false, egresado: true, docente: false, beneficiario: true, beca: false, mejorECAES: true, gradoHonor: false, segundoHermano: true, secretariaEducacion: false, doctoradoInterinstitucio: true },
      { votacion: false, monitor: true, egresado: false, docente: true, beneficiario: false, beca: true, mejorECAES: false, gradoHonor: true, segundoHermano: false, secretariaEducacion: true, doctoradoInterinstitucio: false },
      { votacion: true, monitor: true, egresado: true, docente: true, beneficiario: true, beca: true, mejorECAES: true, gradoHonor: true, segundoHermano: true, secretariaEducacion: true, doctoradoInterinstitucio: true },
    ];

    const cuotas: Cuotas[] = [
      { primeraCuota: 33, segundaCuota: 33, terceraCuota: 33, fechaCuotaUno: '01/04/2024', fechaCuotaDos: '01/05/2024', fechaCuotaTres: '01/06/2024' },
      { primeraCuota: 33, segundaCuota: 33, terceraCuota: 33, fechaCuotaUno: '01/04/2024', fechaCuotaDos: '01/05/2024', fechaCuotaTres: '01/06/2024' },
      { primeraCuota: 33, segundaCuota: 33, terceraCuota: 33, fechaCuotaUno: '01/04/2024', fechaCuotaDos: '01/05/2024', fechaCuotaTres: '01/06/2024' },
    ];

    const combinedData = detallesPago.map((detalles, index) => ({
      detallesPago: detalles,
      conceptosBase: conceptosBase[index],
      conceptosDescuentos: conceptosDescuentos[index],
      porcentajeCoutas: cuotas[index],
    }));



    this.dataSource.data = combinedData;
    this.cargarProyectos();
    this.cargarPeriodo();
  }

  ngOnInit() {
    this.cargarProyectos();
    this.cargarPeriodo();

    const validatorProyectoControl = this.firstFormGroup.get('validatorProyecto');
    const validatorPeridoControl = this.firstFormGroup.get('validatorPeriodo');

    if (validatorProyectoControl) {
      validatorProyectoControl.valueChanges.subscribe(value => {
        this.selectedProyecto = value;
        console.log('ID seleccionado:', this.selectedProyecto.Id);
      });
    } else {
      console.error('El control "validatorProyecto" es nulo.');
    }
    if (validatorPeridoControl) {
      validatorPeridoControl.valueChanges.subscribe(value => {
        this.selectedPeriodo = value;
        console.log('ID seleccionado:', this.selectedPeriodo.Id);
      });
    } else {
      console.error('El control "validatorProyecto" es nulo.');
    }
  }

  ngOnChanges() {

  }

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  cargarDatos() {
    this.cargarAdmitidos(this.selectedPeriodo.Id, this.selectedProyecto.Id);
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
              console.log("proyectos", this.proyectos)
            } else {
              const id_tercero = this.userService.getPersonaId();
              console.log('admision/dependencia_vinculacion_tercero/' + id_tercero)
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
    console.log(proyecto)
    console.log(this.selectednivel)
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
          console.log("periodos", this.periodos);
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  cargarAdmitidos(id_periodo: undefined, id_proyecto: undefined) {
    return new Promise((resolve, reject) => {
      //const url = `liquidacion/?id_periodo=${id_periodo}&id_proyecto=${id_proyecto}`;
      const url = `liquidacion/?id_periodo=9&id_proyecto=32`;
      this.sgaAdmisiones.get(url).subscribe(
        (response: { Data: any; }) => {
          console.log('Datos cargados:', response);
          const data = response.Data;
          console.log('Data:', data);
          this.admitidos = data;
          console.log('Data:', this.admitidos);
          this.admitidos.forEach(row => {
            row.Seguro = true;
            row.Carne = true;
            row.Sistematizacion = true;
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

  toggleDescuento(event: MatSelectChange, row: any, descuento: number) {
    if (event.value === 'true') {
      if (!row.Descuentos.includes(descuento)) {
        row.Descuentos.push(descuento);
      }
    } else {
      const index = row.Descuentos.indexOf(descuento);
      if (index !== -1) {
        row.Descuentos.splice(index, 1);
      }
    }
  }
  calcularValorMatricula(row: any): void {
    const tarifaPorCredito = 100000;
    row.valorMatricula = row.creditos * tarifaPorCredito;
    this.actualizarValorRecibo(row);
  }

  actualizarValorRecibo(row: any): void {
    row.valorRecibo = row.valorMatricula;
  }

  actualizarValoresCuotas(row: any): void {
    if (row.cuotas == 1) {
      row.valorCuota1 = row.valorMatricula;
      row.valorCuota2 = 0;
      row.valorCuota3 = 0;
    } else if (row.cuotas == 2) {
      row.valorCuota1 = row.valorMatricula * 0.6;
      row.valorCuota2 = row.valorMatricula * 0.4;
      row.valorCuota3 = 0;
    } else if (row.cuotas == 3) {
      row.valorCuota1 = row.valorMatricula * 0.4;
      row.valorCuota2 = row.valorMatricula * 0.3;
      row.valorCuota3 = row.valorMatricula * 0.3;
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
      row.Descuentos.forEach((descuento: any) => {
        switch (descuento) {
          case 1:
            liqDetalle.push({ tipo_concepto_id: 1, valor: 0.1 }); // Certificado electoral
            break;
          case 2:
            liqDetalle.push({ tipo_concepto_id: 2, valor: 0.5 }); // Monitorias
            break;
          case 3:
            liqDetalle.push({ tipo_concepto_id: 3, valor: 0.5 }); // Representante de consejo superior y/o académico
            break;
          case 4:
            liqDetalle.push({ tipo_concepto_id: 4, valor: 1 }); // Mejor saber- pro (ECAES)
            break;
          case 5:
            liqDetalle.push({ tipo_concepto_id: 5, valor: 1 }); // Pariente de personal de planta UD
            break;
          case 6:
            liqDetalle.push({ tipo_concepto_id: 6, valor: 0.3 }); // Egresado UD
            break;
          case 7:
            liqDetalle.push({ tipo_concepto_id: 7, valor: 1 }); // Beca de secretaría de educación
            break;
          default:
            break;
        }
      });
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
    console.log(this.liquidaciones)
    for (const liquidacion of this.liquidaciones) {
      console.log(liquidacion)
      this.liquidacionService.post('liquidacion/', liquidacion)
        .subscribe(
          (res: any) => {
            const r = <any>res;
            console.log(res);
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
      if (row.Seguro) {
        reciboConceptos.push({ Ref: 2, Descripcion:"SEGURO",Valor: 111 }); //No exixte parametro para seguro 
      }
      if (row.Carne) {
        reciboConceptos.push({ Ref: 3, Descripcion:"CARNET",Valor: 111 }); //No exixte parametro para carné
      }
      if (row.Sistematizacion) {
        reciboConceptos.push({ Ref: 4, Descripcion:"SISTEMATIZACIÓN",Valor: 111 }); //No exixte parametro para sistematización 
      }
      row.Descuentos.forEach((descuento: any) => {
        switch (descuento) {
          case 1:
            reciboObs.push({ Ref: 1, Descripcion:"Certificado electoral" }); // Certificado electoral
            break;
          case 2:
            reciboObs.push({ Ref: 2, Descripcion:"Certificado electoral" }); // Monitorias
            break;
          case 3:
            reciboObs.push({ Ref: 3, Descripcion:"Representante de consejo superior y/o académico" }); // Representante de consejo superior y/o académico
            break;
          case 4:
            reciboObs.push({ Ref: 4, Descripcion:"Mejor saber- pro (ECAES)" }); // Mejor saber- pro (ECAES)
            break;
          case 5:
            reciboObs.push({ Ref: 5, Descripcion:"Pariente de personal de planta UD" }); // Pariente de personal de planta UD
            break;
          case 6:
            reciboObs.push({ Ref: 6, Descripcion:"Egresado UD" }); // Egresado UD
            break;
          case 7:
            reciboObs.push({ Ref: 7, Descripcion:"Beca de secretaría de educación" }); // Beca de secretaría de educación
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
        Periodo: this.selectedPeriodo,
        Dependencia: {
          Tipo: "Proyecto Curricular",
          Nombre: this.selectedProyecto
        },
        Conceptos: reciboConceptos,
        Observaciones: reciboObs,
        Fecha1: "30/02/2023",
        Fecha2: "30/02/2023",
        Recargo: 1.5,
        Comprobante: "0666"
      };
      this.recibos.push(recibo);
    });
    console.log(this.recibos)
  }


  descargar = (data: any) => {
    console.log('Descargando...');
  }

  eliminar = (data: any) => {
    console.log('Eliminando...');
  }

  editar = (data: any) => {
    console.log('Editando...');
  }


}
