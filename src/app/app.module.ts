

import { AsignarDocumentosDescuentosComponent } from './components/asignar-documentos-descuentos/asignar_documentos_descuentos/asignar_documentos_descuentos.component';
import { DocProgramaObligatorioComponent } from './components/asignar-documentos-descuentos/doc-programa-obligatorio/doc-programa-obligatorio.component';
import { SelectDescuentoProyectoComponent } from './components/asignar-documentos-descuentos/select-descuento-proyecto/select-descuento-proyecto.component';
import { SelectDocumentoProyectoComponent } from './components/asignar-documentos-descuentos/select-documento-proyecto/select-documento-proyecto.component';
import { ListDocumentoProyectoComponent } from './components/asignar-documentos-descuentos/list-documento-proyecto/list-documento-proyecto.component';
import { CrudDocumentoProyectoComponent } from './components/asignar-documentos-descuentos/crud-documento-proyecto/crud-documento-proyecto.component';
import { ListadoHistoricoComponent } from './components/listado-historico/listado-historico.component';
import { LiquidacionRecibosComponent } from './components/liquidacion-recibos/liquidacion-recibos.component';
import { SolicitudDescuento } from './models/descuento/solicitud_descuento';
import { SolicitudTransferenciaComponent } from './components/transferencia/solicitud-transferencia/solicitud-transferencia.component';
import { DefSuiteInscripProgramaComponent } from './components/suite-programa/def_suite_inscrip_programa/def-suite-inscrip-programa.component';
import { TransferenciaComponent } from './components/transferencia/transferencia/transferencia.component';
import { DialogoDocumentosTransferenciasComponent } from './components/transferencia/dialogo-documentos-transferencias/dialogo-documentos-transferencias.component';
import { CrudInfoPersonaComponent } from './components/transferencia/crud-info_persona/crud-info_persona.component';
import { CustomizeButtonComponent } from './components/transferencia/customize-button/customize-button.component';
import { SgaAdmisionesMid } from './services/sga_admisiones_mid.service';

import { CheckboxAssistanceComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/checkbox-assistance/checkbox-assistance.component';
import { EvaluacionAspirantesComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatDialogModule } from '@angular/material/dialog';
import { RequestManager } from './managers/requestManager';
import { HttpErrorManager } from './managers/errorManager';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { PopUpManager } from './managers/popUpManager';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from "src/environments/environment";
import { CodificacionModule } from "./codificacion-module/codificacion.module";
import { MatSnackBarModule } from '@angular/material/snack-bar';


import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';
import { HttpClient } from '@angular/common/http';

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
    //EvaluacionAspirantesComponent,
    //CheckboxAssistanceComponent,
    EvaluacionDocumentosInscritosComponent,
    DialogoDocumentosComponent,
    PerfilComponent,
    DinamicformComponent,
    DinamicformComponent,
    ViewIdiomasComponent,
    TransferenciaComponent,
    CrudInfoPersonaComponent,
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
    ListadoAspiranteComponent,
    AdministracionCuentaBancariaComponent,
    ComentariosCuposComponent
  ],
  imports: [
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
    MatAutocompleteModule,
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
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilInterceptor, multi: true}
  ],
  bootstrap: [AppComponent],

  
  export class AppModule { }
