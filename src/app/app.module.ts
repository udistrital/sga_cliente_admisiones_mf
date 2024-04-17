import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { BrowserModule } from "@angular/platform-browser";
import { StoreModule } from "@ngrx/store";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EvaluacionAspirantesComponent } from "./components/Evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component";
import { AdministradorCriteriosComponent } from "./components/administrar-criterios-admisiones/administrador-criterios/administrador-criterios.component";
import { DialogoCriteriosComponent } from "./components/administrar-criterios-admisiones/dialogo-criterios/dialogo-criterios.component";
import { AsignacionCuposComponent } from "./components/asignacion-cupos-proyectos/asignacion_cupos/asignacion_cupos.component";
import { CrudAsignacionCupoComponent } from "./components/asignacion-cupos-proyectos/asignacion_cupos/crud-asignacion_cupo/crud-asignacion_cupo.component";
import { DialogPreviewFileComponent } from "./components/asignacion-cupos-proyectos/dialog-preview-file/dialog-preview-file.component";
import { DinamicformComponent } from "./components/asignacion-cupos-proyectos/dinamicform/dinamicform.component";
import { AsignarDocumentosDescuentosComponent } from "./components/asignar-documentos-descuentos/asignar_documentos_descuentos/asignar_documentos_descuentos.component";
import { CrudDocumentoProyectoComponent } from "./components/asignar-documentos-descuentos/crud-documento-proyecto/crud-documento-proyecto.component";
import { DocProgramaObligatorioComponent } from "./components/asignar-documentos-descuentos/doc-programa-obligatorio/doc-programa-obligatorio.component";
import { ListDocumentoProyectoComponent } from "./components/asignar-documentos-descuentos/list-documento-proyecto/list-documento-proyecto.component";
import { SelectDescuentoProyectoComponent } from "./components/asignar-documentos-descuentos/select-descuento-proyecto/select-descuento-proyecto.component";
import { SelectDocumentoProyectoComponent } from "./components/asignar-documentos-descuentos/select-documento-proyecto/select-documento-proyecto.component";
import { CriterioAdmisionComponent } from "./components/crieterios-admisiones-proyectos/criterio_admision/criterio_admision.component";
import { DialogoDocumentosComponent } from "./components/evalucion-documentos-inscritos/dialogo-documentos/dialogo-documentos.component";
import { EvaluacionDocumentosInscritosComponent } from "./components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component";
import { PerfilComponent } from "./components/evalucion-documentos-inscritos/perfil/perfil.component";
import { ViewDescuentoAcademicoComponent } from "./components/evalucion-documentos-inscritos/view-descuento_academico/view-descuento_academico.component";
import { ViewDocumentoProgramaComponent } from "./components/evalucion-documentos-inscritos/view-documento_programa/view-documento_programa.component";
import { ViewExperienciaLaboralComponent } from "./components/evalucion-documentos-inscritos/view-experiencia_laboral/view-experiencia_laboral.component";
import { ViewFormacionAcademicaComponent } from "./components/evalucion-documentos-inscritos/view-formacion_academica/view-formacion_academica.component";
import { ViewIdiomasComponent } from "./components/evalucion-documentos-inscritos/view-idiomas/view-idiomas.component";
import { ViewInfoPersonaComponent } from "./components/evalucion-documentos-inscritos/view-info-persona/view-info-persona.component";
import { ViewInscripcionComponent } from "./components/evalucion-documentos-inscritos/view-inscripcion/view-inscripcion.component";
import { ViewProduccionAcademicaComponent } from "./components/evalucion-documentos-inscritos/view-produccion_academica/view-produccion_academica.component";
import { ViewPropuestaGradoComponent } from "./components/evalucion-documentos-inscritos/view-propuesta_grado/view-propuesta_grado.component";
import { LiquidacionRecibosComponent } from "./components/liquidacion-recibos/liquidacion-recibos.component";
import { LiquidacionHistoricoComponent } from "./components/liquidacion/liquidacion-historico/liquidacion-historico.component";
import { LiquidacionTableComponent } from "./components/liquidacion/liquidacion-table/liquidacion-table.component";
import { ListadoAspiranteComponent } from "./components/listado-aspirantes/listado_aspirantes/listado_aspirante.component";
import { ListadoHistoricoComponent } from "./components/listado-historico/listado-historico.component";
import { DefSuiteInscripProgramaComponent } from "./components/suite-programa/def_suite_inscrip_programa/def-suite-inscrip-programa.component";
import { CrudInfoPersonaComponent } from "./components/transferencia/crud-info_persona/crud-info_persona.component";
import { CustomizeButtonComponent } from "./components/transferencia/customize-button/customize-button.component";
import { DialogoDocumentosTransferenciasComponent } from "./components/transferencia/dialogo-documentos-transferencias/dialogo-documentos-transferencias.component";
import { SolicitudTransferenciaComponent } from "./components/transferencia/solicitud-transferencia/solicitud-transferencia.component";
import { TransferenciaComponent } from "./components/transferencia/transferencia/transferencia.component";
import { RequestManager } from "./managers/requestManager";
import { CampusMidService } from "./services/campus_mid.service";
import { DocumentoService } from "./services/documento.service";
import { EvaluacionInscripcionService } from "./services/evaluacion_inscripcion.service";
import { NotificacionesMidService } from "./services/notificaciones_mid.service";
import { ParametrosService } from "./services/parametros.service";
import { SgaAdmisionesMid } from "./services/sga_admisiones_mid.service";
import { SgaMidService } from "./services/sga_mid.service";
import { rootReducer } from "./store/rootReducer";
import { ListService } from "./store/services/list.service";
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CheckboxAssistanceComponent } from "./components/Evaluacion-aspirante/evaluacion-aspirantes/checkbox-assistance/checkbox-assistance.component";
import { AdministracionCuentaBancariaComponent } from "./components/administracion-cuenta-bancaria/administracion-cuenta-bancaria.component";



export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'http://localhost:4207/assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,

    DialogoCriteriosComponent,
    AdministradorCriteriosComponent,
    AsignacionCuposComponent,
    CrudAsignacionCupoComponent,
    CriterioAdmisionComponent,
    DinamicformComponent,
    DialogoCriteriosComponent,
    DialogPreviewFileComponent,
    EvaluacionAspirantesComponent,
    CheckboxAssistanceComponent,
    EvaluacionDocumentosInscritosComponent,
    DialogoDocumentosComponent,
    AdministracionCuentaBancariaComponent,
    PerfilComponent,
    DinamicformComponent,
    ListadoHistoricoComponent,
    DinamicformComponent,
    ViewIdiomasComponent,
    TransferenciaComponent,
    CrudInfoPersonaComponent,
    CustomizeButtonComponent,
    AsignacionCuposComponent,
    ListadoHistoricoComponent,
    LiquidacionRecibosComponent,
    ViewInscripcionComponent,
    ViewInfoPersonaComponent,
    DialogoCriteriosComponent,
    DialogoCriteriosComponent,
    CriterioAdmisionComponent,
    ListadoAspiranteComponent,
    DialogoDocumentosComponent,
    DialogPreviewFileComponent,
    CrudAsignacionCupoComponent,
    ViewPropuestaGradoComponent,
    EvaluacionAspirantesComponent,
    ListDocumentoProyectoComponent,
    CrudDocumentoProyectoComponent,
    ViewDocumentoProgramaComponent,
    ViewExperienciaLaboralComponent,
    ViewFormacionAcademicaComponent,
    AdministradorCriteriosComponent,
    ViewDescuentoAcademicoComponent,
    DocProgramaObligatorioComponent,
    SolicitudTransferenciaComponent,
    ViewProduccionAcademicaComponent,
    DefSuiteInscripProgramaComponent,
    SelectDescuentoProyectoComponent,
    SelectDocumentoProyectoComponent,
    AsignarDocumentosDescuentosComponent,
    EvaluacionDocumentosInscritosComponent,
    DialogoDocumentosTransferenciasComponent,
    LiquidacionRecibosComponent,
    LiquidacionHistoricoComponent,
    LiquidacionTableComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    AppRoutingModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    NgxExtendedPdfViewerModule,
    StoreModule.forRoot(rootReducer),

    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    MatSnackBar,
    ListService,
    SgaMidService,
    RequestManager,
    SgaAdmisionesMid,
    DocumentoService,
    CampusMidService,
    ParametrosService,
    NotificacionesMidService,
    EvaluacionInscripcionService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
