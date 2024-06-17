import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { UserService } from 'src/app/services/users.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-view-inscripcion',
  templateUrl: './view-inscripcion.component.html',
  styleUrls: ['./view-inscripcion.component.scss']
})
export class ViewInscripcionComponent implements OnInit {

  persona_id!: string | null;
  periodo_id!: number;
  programa_id!: number;
  inscripcion_id!: number;
  inscripcion: any;

  @Output('estadoCarga') estadoCarga: EventEmitter<any> = new EventEmitter(true);
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: ""
  }

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private parametrosService: ParametrosService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private programaService: ProyectoAcademicoService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.inscripcion = {
      Periodo: '',
      Estado: '',
      Programa: '',
    }
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.programa_id = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!);
    this.persona_id = this.userService.getId();
    this.inscripcion_id = parseInt(sessionStorage.getItem('IdInscripcion')!);
    this.periodo_id = this.userService.getPeriodo();
    this.loadInscripcion();
  }

  loadInscripcion() {
    this.infoCarga.nCargas = 3;
    this.inscripcion.Programa = sessionStorage.getItem('ProgramaAcademico');
    this.inscripcionService.get('inscripcion?query=Id:' + this.inscripcion_id).subscribe(
      (response: any) => {
        if (Object.keys(response[0]).length > 0) {
        this.inscripcion.Estado = response[0].EstadoInscripcionId.Nombre;
        this.estadoCarga.emit({EstadoInscripcion: this.inscripcion.Estado});
        this.inscripcion.TipoInscripcion = response[0].TipoInscripcionId.Nombre;
        this.inscripcion.FechaInscribe = response[0].FechaModificacion;
        this.inscripcion.Enfasis = "";
        this.programaService.get('enfasis/'+response[0].EnfasisId).subscribe(
          (respEnf: any) => {
            if(respEnf.Status != "404") {
              this.inscripcion.Enfasis = respEnf.Nombre;
              this.addCargado(1);
            } else {
              this.infoFalla();
            }
          }, error => {
            this.infoFalla();
          }
        );
        this.inscripcion.idRecibo = response[0].ReciboInscripcion;
        this.addCargado(1);
        } else {
          this.infoFalla();
        }
      },
      (error: HttpErrorResponse) => {
        this.infoFalla();
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
      },
    );
    this.parametrosService.get('periodo/' + this.periodo_id).subscribe(
      (resp: any) => {
        this.inscripcion.Periodo = resp.Data.Nombre;
        this.addCargado(1);
      },
      (error: HttpErrorResponse) => {
        this.infoFalla();
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
      },
    )
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje = this.infoCarga.nCargado/this.infoCarga.nCargas;
    if (this.infoCarga.porcentaje >= 1) {
      this.infoCarga.status = "completed";
      let fechaRaw = new Date(new Date(this.inscripcion.FechaInscribe).getTime()+5*3600*1000);
      this.infoCarga.outInfo = {
        id: this.inscripcion_id,
        programa_id: this.programa_id,
        nombrePrograma: this.inscripcion.Programa,
        enfasis: this.inscripcion.Enfasis,
        fechaInsripcion: fechaRaw.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        periodo: this.inscripcion.Periodo,
        idRecibo: this.inscripcion.idRecibo,
      }
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}
