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
  selectednivel: any = 2;
  esPosgrado: boolean = false;

  constructor(private _formBuilder: FormBuilder, private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private userService: UserService,
    private sgaAdmisiones: SgaAdmisionesMid,
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
    this.loadProyectos();
  }

  ngOnInit(){
    this.loadProyectos();
  }

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];


  loadProyectos() {
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
                console.log("proyectos",this.proyectos)
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
  filtrarProyecto(proyecto:any) {
    console.log(proyecto)
    console.log(this.selectednivel)
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      }else{
        return false
      }
    } else {
      return false
    }
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
