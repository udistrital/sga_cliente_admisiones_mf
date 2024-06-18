import { AsignarDocumentosDescuentosComponent } from './components/asignar-documentos-descuentos/asignar_documentos_descuentos/asignar_documentos_descuentos.component';
import { DocProgramaObligatorioComponent } from './components/asignar-documentos-descuentos/doc-programa-obligatorio/doc-programa-obligatorio.component';
import { SelectDescuentoProyectoComponent } from './components/asignar-documentos-descuentos/select-descuento-proyecto/select-descuento-proyecto.component';
import { SelectDocumentoProyectoComponent } from './components/asignar-documentos-descuentos/select-documento-proyecto/select-documento-proyecto.component';
import { ListDocumentoProyectoComponent } from './components/asignar-documentos-descuentos/list-documento-proyecto/list-documento-proyecto.component';
import { CrudDocumentoProyectoComponent } from './components/asignar-documentos-descuentos/crud-documento-proyecto/crud-documento-proyecto.component';
import { ListadoHistoricoComponent } from './components/listado-historico/listado-historico.component';
import { LiquidacionRecibosComponent } from './components/liquidacion-recibos/liquidacion-recibos.component';
import { LiquidacionRecibosComponent as LiquidacionPregrado } from './components/liquidacion/liquidacion-recibos/liquidacion-recibos.component';
import { SolicitudDescuento } from './models/descuento/solicitud_descuento';
import { SolicitudTransferenciaComponent } from './components/transferencia/solicitud-transferencia/solicitud-transferencia.component';
import { DefSuiteInscripProgramaComponent } from './components/suite-programa/def_suite_inscrip_programa/def-suite-inscrip-programa.component';
import { TransferenciaComponent } from './components/transferencia/transferencia/transferencia.component';
import { DialogoDocumentosTransferenciasComponent } from './components/transferencia/dialogo-documentos-transferencias/dialogo-documentos-transferencias.component';
import { CustomizeButtonComponent } from './components/transferencia/customize-button/customize-button.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { RequestManager } from './managers/requestManager';
import { HttpErrorManager } from './managers/errorManager';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { EvaluacionInscripcionService } from './services/evaluacion_inscripcion.service';
import { ParametrosService } from './services/parametros.service';
import { SgaMidService } from './services/sga_mid.service';
import { CheckboxAssistanceComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/checkbox-assistance/checkbox-assistance.component';
import { AdministradorCriteriosComponent } from './components/administrar-criterios-admisiones/administrador-criterios/administrador-criterios.component';
import { DialogoCriteriosComponent } from './components/administrar-criterios-admisiones/dialogo-criterios/dialogo-criterios.component';
import { AsignacionCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/asignacion_cupos.component';
import { CrudAsignacionCupoComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/crud-asignacion_cupo/crud-asignacion_cupo.component';
import { DialogPreviewFileComponent } from './components/asignacion-cupos-proyectos/dialog-preview-file/dialog-preview-file.component';
import { DinamicformComponent } from './components/asignacion-cupos-proyectos/dinamicform/dinamicform.component';
import { CriterioAdmisionComponent } from './components/crieterios-admisiones-proyectos/criterio_admision/criterio_admision.component';
import { DialogoDocumentosComponent } from './components/evalucion-documentos-inscritos/dialogo-documentos/dialogo-documentos.component';
import { EvaluacionDocumentosInscritosComponent } from './components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component';
import { EvaluacionAspirantesComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component';
import { DocumentoService } from './services/documento.service';
import { NotificacionesMidService } from './services/notificaciones_mid.service';
import { PerfilComponent } from './components/evalucion-documentos-inscritos/perfil/perfil.component';
import { ViewInscripcionComponent } from './components/evalucion-documentos-inscritos/view-inscripcion/view-inscripcion.component';
import { ViewInfoPersonaComponent } from './components/evalucion-documentos-inscritos/view-info-persona/view-info-persona.component';
import { ViewFormacionAcademicaComponent } from './components/evalucion-documentos-inscritos/view-formacion_academica/view-formacion_academica.component';
import { ViewIdiomasComponent } from './components/evalucion-documentos-inscritos/view-idiomas/view-idiomas.component';
import { ViewExperienciaLaboralComponent } from './components/evalucion-documentos-inscritos/view-experiencia_laboral/view-experiencia_laboral.component';
import { ViewProduccionAcademicaComponent } from './components/evalucion-documentos-inscritos/view-produccion_academica/view-produccion_academica.component';
import { ViewDocumentoProgramaComponent } from './components/evalucion-documentos-inscritos/view-documento_programa/view-documento_programa.component';
import { ViewDescuentoAcademicoComponent } from './components/evalucion-documentos-inscritos/view-descuento_academico/view-descuento_academico.component';
import { CampusMidService } from './services/campus_mid.service';
import { ViewPropuestaGradoComponent } from './components/evalucion-documentos-inscritos/view-propuesta_grado/view-propuesta_grado.component';
import { StoreModule } from '@ngrx/store';
import { rootReducer } from './store/rootReducer';
import { ListadoAspiranteComponent } from './components/listado-aspirantes/listado_aspirantes/listado_aspirante.component';
import { ListService } from './store/services/list.service';
import { AdministracionCuentaBancariaComponent } from './components/administracion-cuenta-bancaria/administracion-cuenta-bancaria.component';
import { ComentariosCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/comentarios-cupos/comentarios-cupos.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { CodificacionModule } from './components/codificacion-module/codificacion.module';
import { ListaProyectosAspirantesComponent } from './components/lista-proyectos-aspirantes/lista-proyectos-aspirantes.component';
import { MatSortModule } from '@angular/material/sort';
import { RepotesInscripcionesComponent } from './components/repotes-inscripciones/repotes-inscripciones.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SafeUrlPipe } from './core/pipes/safe-url.pipe';
import { ReporteVisualizerComponent } from './components/reporte-visualizer/reporte-visualizer.component';
import { LiquidacionHistoricoComponent } from './components/liquidacion/liquidacion-historico/liquidacion-historico.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LiquidacionTableComponent } from './components/liquidacion/liquidacion-table/liquidacion-table.component';
import { SoporteConfiguracionComponent } from './components/soporte-configuracion/soporte-configuracion.component';
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from "src/environments/environment";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';
import { HttpClient } from '@angular/common/http';
import { SgaAdmisionesMid } from './services/sga_admisiones_mid.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InscripcionMidService } from './services/sga_inscripcion_mid.service';
import { TerceroMidService } from './services/sga_tercero_mid.service';
import { ListadoAspirantesPregradoComponent } from './components/listado-aspirantes-pregrado/listado-aspirantes-pregrado.component';
import { CargueSnpComponent } from './components/cargue-snp/cargue-snp.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { EvalucionAspirantePregradoComponent } from './components/evalucion-aspirante-pregrado/evalucion-aspirante.component';
import { ListadosOficializadosComponent } from './components/listados-oficializados/listados-oficializados.component';
import { CrudListadosOficializadosComponent } from './components/crud-listados-oficializados/crud-listados-oficializados.component';



export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl + 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LiquidacionPregrado,
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
    CustomizeButtonComponent,
    AsignacionCuposComponent,
    ListadoHistoricoComponent,
    LiquidacionRecibosComponent,
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
    ListaProyectosAspirantesComponent,
    LiquidacionRecibosComponent,
    LiquidacionHistoricoComponent,
    LiquidacionTableComponent,
    SoporteConfiguracionComponent,
    ListadoAspiranteComponent,
    AdministracionCuentaBancariaComponent,
    ComentariosCuposComponent,
    ListadoAspirantesPregradoComponent,
    CargueSnpComponent,
    SoporteConfiguracionComponent,
    EvalucionAspirantePregradoComponent,
    ListadosOficializadosComponent,
    CrudListadosOficializadosComponent
  ],
  imports: [
    CodificacionModule,
    NgxDocViewerModule,
    FormsModule,
    CommonModule,
    BrowserModule,
    MatTabsModule,
    MatIconModule,
    MatStepperModule,
    MatStepperModule,
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
    MatSortModule,
    MatAutocompleteModule,
    MatGridListModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    NgxExtendedPdfViewerModule,
    StoreModule.forRoot(rootReducer),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    CodificacionModule,
    SpinnerUtilModule,
  ],

  providers: [
    MatSnackBar,
    ListService,
    SgaMidService,
    TerceroMidService,
    InscripcionMidService,
    RequestManager,
    SgaAdmisionesMid,
    DocumentoService,
    CampusMidService,
    ParametrosService,
    NotificacionesMidService,
    EvaluacionInscripcionService,
  ],
  bootstrap: [AppComponent],
})

export class AppModule { }
