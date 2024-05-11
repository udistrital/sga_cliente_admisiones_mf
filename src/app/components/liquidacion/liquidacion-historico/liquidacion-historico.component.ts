import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { OikosService } from 'src/app/services/oikos.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';

@Component({
  selector: 'app-liquidacion-historico',
  templateUrl: './liquidacion-historico.component.html',
  styleUrls: ['./liquidacion-historico.component.scss']
})
export class LiquidacionHistoricoComponent {

  // proyectos=[
  //   { "Id": 1, "Nombre": "Proyecto 1" },
  //   { "Id": 2, "Nombre": "Proyecto 2" },
  //   { "Id": 3, "Nombre": "Proyecto 3" },
  // ]

  // nivel_load =[
  //   { "Id": 1, "Nombre": "Nivel 1" },
  //   { "Id": 2, "Nombre": "Nivel 2" },
  //   { "Id": 3, "Nombre": "Nivel 3" }
  // ]

  // periodos=[
  //   { "Nombre": "Periodo 1" },
  //   { "Nombre": "Periodo 2" },
  //   { "Nombre": "Periodo 3" }
  // ]

  datosTabla: any;
  tablahistorico:boolean=true

  proyectoControl = new FormControl('', [Validators.required]);
  facultadControl = new FormControl('', [Validators.required]);
  periodoControl = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);
  // firstFormGroup = this._formBuilder.group({
  //   validatorProyecto: ['', Validators.required],
  //   validatorPeriodo: ['', Validators.required],
  //   validatorFacultad: ['', Validators.required],
  // });

  facultades!: any[]
  proyectosCurriculares!: any[]
  periodos!: any[]

  inscripciones: any = [];

  constructor(
    private _formBuilder: FormBuilder, 
    private oikosService: OikosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private sgamidService: SgaMidService,
    private inscripcionMidService: InscripcionMidService,
  )
  {}

  async ngOnInit() {
    await this.cargarSelects();
  }

  async cargarSelects() {
    await this.cargarFacultades();
    await this.cargarPeriodos();
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          console.log(this.facultades);
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    this.proyectosCurriculares = facultad.Opciones;
  }

  cargarPeriodos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          this.periodos = res.Data;
          console.log(this.periodos);
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.periodo_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  async realizarBusqueda() {
    const proyecto = this.proyectoControl.value;
    const periodo = this.periodoControl.value;

    this.inscripciones = await this.buscarInscripcionesAdmitidosLegalizados(proyecto, periodo)
    console.log("INSCRIPCIONES", this.inscripciones)

    // this.datosTabla["inscripciones"] = this.inscripciones
    // this.datosTabla["editando"] = true

    this.datosTabla = {
      "inscripciones": this.inscripciones,
      "visible": true
    }

    // for (const inscripcion of this.inscripciones) {
    //   const persona: any = await this.consultarTercero(inscripcion.PersonaId);
    //   if (Array.isArray(persona) && persona.length === 0) {
    //     continue;
    //   }
    //   const infoLegalizacion = await this.getLegalizacionMatricula(persona.Id)
    //   if (infoLegalizacion == "No existe legalizacion") {
    //     continue;
    //   }
    //   console.log("INSCRIP:", inscripcion, persona, infoLegalizacion);

    //   const valorLiquidacion = {
    //     "codigo": 1000,
    //     "documento": persona.NumeroIdentificacion,
    //     "nombres": persona.PrimerNombre + "" + persona.SegundoNombre,
    //     "apellidos": persona.PrimerApellido + "" + persona.SegundoApellido,
    //   }
    // }
  }

  buscarInscripcionesAdmitidosLegalizados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:8&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  // async consultarTercero(personaId: any): Promise<any | []> {
  //   try {
  //     const response = await this.sgamidService.get('persona/consultar_persona/' + personaId).toPromise();
  //     return response;
  //   } catch (error) {
  //     // this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.tercero_error'));
  //     console.log(error);
  //     return []; // Return an empty array to indicate an error
  //   }
  // }

  // async getLegalizacionMatricula(personaId: any) {
  //   return new Promise((resolve, reject) => {
  //     //this.loading = true;
  //     this.inscripcionMidService.get('legalizacion/informacion-legalizacion/' + personaId)
  //       .subscribe((res: any) => {
  //         resolve(res.data);
  //       },
  //         (error: any) => {
  //           this.popUpManager.showErrorAlert(
  //             this.translate.instant('admision.legalizacion_error')
  //           );
  //         });
  //   });
  // }

}
