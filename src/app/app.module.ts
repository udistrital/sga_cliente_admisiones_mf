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
import { DialogoCriteriosComponent } from './components/administrarCriteriosDeAdmisiones/dialogo-criterios/dialogo-criterios.component';
import { AdministradorCriteriosComponent } from './components/administrarCriteriosDeAdmisiones/administrador-criterios/administrador-criterios.component';
import { EvaluacionInscripcionService } from './services/evaluacion_inscripcion.service';
import { AsignacionCuposComponent } from './components/AsignacionDeCuposPorProyectos/asignacion_cupos/asignacion_cupos.component';
import { CrudAsignacionCupoComponent } from './components/AsignacionDeCuposPorProyectos/asignacion_cupos/crud-asignacion_cupo/crud-asignacion_cupo.component';
import { CriterioAdmisionComponent } from './components/crieteriosDeAdmisionesPorProyectos/criterio_admision/criterio_admision.component';
import { ParametrosService } from './services/parametros.service';
import { SgaMidService } from './services/sga_mid.service';
import { DinamicformComponent } from './components/AsignacionDeCuposPorProyectos/dinamicform/dinamicform.component';
import { DialogPreviewFileComponent } from './components/AsignacionDeCuposPorProyectos/dialog-preview-file/dialog-preview-file.component';
import { EvaluacionAspirantesComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component';
import { CheckboxAssistanceComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/checkbox-assistance/checkbox-assistance.component';



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
    CheckboxAssistanceComponent


    
    

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
   SgaMidService
   
   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
