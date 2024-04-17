import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { IdiomaService } from 'src/app/services/idioma.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { UserService } from '../../../services/users.service';
import Swal from 'sweetalert2';
// import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'ngx-view-idiomas',
  templateUrl: './view-idiomas.component.html',
  styleUrls: ['./view-idiomas.component.scss'],
})
export class ViewIdiomasComponent implements OnInit {
  persona_id: number;
  inscripcion!: number;
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    if (info) {
      this.persona_id = info;
      // this.loadInfoIdioma();
      this.loadData();
    }
  };

  @Input('inscripcion_id')
  set dato(info_inscripcion_id: any) {
    if (info_inscripcion_id !== undefined && info_inscripcion_id !== 0 && info_inscripcion_id.toString() !== '') {
      this.inscripcion = info_inscripcion_id;
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  @Output('estadoCarga') estadoCarga: EventEmitter<any> = new EventEmitter(true);
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: ""
  }

  info_idioma: any;
  info_examen: any;

  constructor(
    private translate: TranslateService,
    private users: UserService,
    private inscripcionService: InscripcionService,
    private idiomaService: IdiomaService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.persona_id = parseInt(sessionStorage.getItem('TerceroId')!);
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //this.loadData();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  loadData(): void {
    this.infoCarga.nCargas = 1;
    this.idiomaService.get('conocimiento_idioma?query=Activo:true,TercerosId:' + this.persona_id +
      '&limit=0')
      .subscribe((res:any) => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const data = <Array<any>>res;
          this.info_idioma = data;
          this.addCargado(1);
        } else {
          this.infoFalla();
        }
      },
      (error: HttpErrorResponse) => {
        this.infoFalla();
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.idiomas'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje = this.infoCarga.nCargado/this.infoCarga.nCargas;
    if (this.infoCarga.porcentaje >= 1) {
      this.infoCarga.status = "completed";
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}
