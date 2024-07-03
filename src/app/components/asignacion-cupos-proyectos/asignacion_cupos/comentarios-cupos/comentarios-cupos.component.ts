import { Component, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { DocumentoService } from 'src/app/services/documento.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { environment } from 'src/environments/environment.development';
import { ZipManagerService } from 'src/utils/zip-manager.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AsignacionCupoService } from 'src/app/services/asignacion_cupo.service';

@Component({
  selector: 'app-comentarios-cupos',
  templateUrl: './comentarios-cupos.component.html',
  styleUrls: ['./comentarios-cupos.component.scss']
})
export class ComentariosCuposComponent {
  dataSource: any;
  displayedColumns: string[] = ['Comentario',  'Activo', 'Documento'];
  comentario: any;

  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();
  receivedData: any;

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
    private userService: UserService,
    private http: HttpClient,
    private asignacionCupoService: AsignacionCupoService,
    private zipManagerService: ZipManagerService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit(): void {
    this.asignacionCupoService.datosSeleccionados$.subscribe((datos: any) => {
      this.receivedData = datos;
    });
  }

  obtenerComentarios() {
    this.http.get<any>(`${environment.INSCRIPCION_SERVICE}/documento_cupo?query=ProgramaAcademicoId:${this.receivedData.data.Id}`).subscribe(
      (response) => {
        this.dataSource = response.data
      },
      (error) => {
        console.error('Error al obtener los cupos:', error);
      }
    );
  }

  verSoportes(documento: any){
    documento.Id = documento.DocumentoId;
    this.newNuxeoService.getByIdLocal(documento.DocumentoId)
      .subscribe(file => {
        documento.Documento = file;
        this.revisar_doc.emit(documento);
      }, error => {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  verSoporte(comentario: any){
    this.dataSource=comentario;
  }
}
