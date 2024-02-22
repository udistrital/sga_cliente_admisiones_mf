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
import { MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import { PopUpManager } from './managers/popUpManager';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import {MatNativeDateModule} from '@angular/material/core';

import { EvaluacionInscripcionService } from './services/evaluacion_inscripcion.service';

import { ParametrosService } from './services/parametros.service';
import { SgaMidService } from './services/sga_mid.service';


import { CheckboxAssistanceComponent } from './components/evaluacion-aspirante/evaluacion-aspirantes/checkbox-assistance/checkbox-assistance.component';
import { AdministradorCriteriosComponent } from './components/administrar-criterios-admisiones/administrador-criterios/administrador-criterios.component';
import { DialogoCriteriosComponent } from './components/administrar-criterios-admisiones/dialogo-criterios/dialogo-criterios.component';
import { AsignacionCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/asignacion_cupos.component';
import { CrudAsignacionCupoComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/crud-asignacion_cupo/crud-asignacion_cupo.component';
import { DialogPreviewFileComponent } from './components/asignacion-cupos-proyectos/dialog-preview-file/dialog-preview-file.component';
import { DinamicformComponent } from './components/asignacion-cupos-proyectos/dinamicform/dinamicform.component';
import { CriterioAdmisionComponent } from './components/crieterios-admisiones-proyectos/criterio_admision/criterio_admision.component';
import { DialogoDocumentosComponent } from './components/evalucion-documentos-inscritos/dialogo-documentos/dialogo-documentos.component';
import { EvaluacionDocumentosInscritosComponent } from './components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component';
import { EvaluacionAspirantesComponent } from './components/evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component';
import { DocumentoService } from './services/documento.service';
import { NotificacionesMidService } from './services/notificaciones_mid.service';
import { PerfilComponent } from './components/evalucion-documentos-inscritos/perfil/perfil.component';
import { ViewInscripcionComponent } from './components/evalucion-documentos-inscritos/view-inscripcion/view-inscripcion.component';
import { ViewInfoPersonaComponent } from './components/evalucion-documentos-inscritos/view-info-persona/view-info-persona.component';
import { ViewFormacionAcademicaComponent } from './components/evalucion-documentos-inscritos/view-formacion_academica/view-formacion_academica.component';
import { ViewIdiomasComponent } from './components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/view-idiomas/view-idiomas.component';
import { ViewExperienciaLaboralComponent } from './components/evalucion-documentos-inscritos/view-experiencia_laboral/view-experiencia_laboral.component';
import { ViewProduccionAcademicaComponent } from './components/evalucion-documentos-inscritos/view-produccion_academica/view-produccion_academica.component';
import { ViewDocumentoProgramaComponent } from './components/evalucion-documentos-inscritos/view-documento_programa/view-documento_programa.component';
import { ViewDescuentoAcademicoComponent } from './components/evalucion-documentos-inscritos/view-descuento_academico/view-descuento_academico.component';
import { CampusMidService } from './services/campus_mid.service';
import { ViewPropuestaGradoComponent } from './components/evalucion-documentos-inscritos/view-propuesta_grado/view-propuesta_grado.component';


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
    PerfilComponent,
    ViewInscripcionComponent,
    ViewInfoPersonaComponent,
    ViewFormacionAcademicaComponent,
    ViewIdiomasComponent,
    ViewExperienciaLaboralComponent,
    ViewProduccionAcademicaComponent,
    ViewDocumentoProgramaComponent,
    ViewDescuentoAcademicoComponent,
    ViewPropuestaGradoComponent
    


    
    

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    MatNativeDateModule,
    MatDialogModule,
    MatInputModule,

    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    MatDatepickerModule,
    MatTabsModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatIconModule,
 
    HttpClientModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory: (createTranslateLoader),
        deps:[HttpClient]
      }
    })
  ],
  providers: [
    MatSnackBar,
   EvaluacionInscripcionService,
   RequestManager,
   ParametrosService,
   SgaMidService,
   DocumentoService,
   NotificacionesMidService,
   CampusMidService
   
   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
