import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AdministradorCriteriosComponent } from './components/administrar-criterios-admisiones/administrador-criterios/administrador-criterios.component';
import { AsignacionCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/asignacion_cupos.component';
import { CriterioAdmisionComponent } from './components/crieterios-admisiones-proyectos/criterio_admision/criterio_admision.component';
import { EvaluacionDocumentosInscritosComponent } from './components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component';
import { EvaluacionAspirantesComponent } from './components/evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component';
import { ListadoAspiranteComponent } from './components/listado-aspirantes/listado_aspirantes/listado_aspirante.component';
import { AsignarDocumentosDescuentosComponent } from './components/asignar-documentos-descuentos/asignar_documentos_descuentos/asignar_documentos_descuentos.component';
import { SolicitudTransferenciaComponent } from './components/transferencia/solicitud-transferencia/solicitud-transferencia.component';
import { DefSuiteInscripProgramaComponent } from './components/suite-programa/def_suite_inscrip_programa/def-suite-inscrip-programa.component';
import { TransferenciaComponent } from './components/transferencia/transferencia/transferencia.component';


const routes: Routes = [
  {
    path:"administrar-criterios", 
    component: AdministradorCriteriosComponent
  },
  {
    path:"admision-criterios", 
    component: CriterioAdmisionComponent
  },
  {
    path:"asignacion-cupos", 
    component: AsignacionCuposComponent
  },
  {
    path:"documentos-inscritos", 
    component: EvaluacionDocumentosInscritosComponent
  },
  {
    path:"evaluacion-aspirantes", 
    component: EvaluacionAspirantesComponent
  },
  {
    path:"listado-aspirantes", 
    component: ListadoAspiranteComponent
  },
  {
    path:"asignar-descuento-documento", 
    component: AsignarDocumentosDescuentosComponent
  },
  {
    path:"transferencia/:process", 
    component: TransferenciaComponent,
  },
  {
    path:"solicitud-transferencia/:id/:process", 
    component: SolicitudTransferenciaComponent,
  },
  {
    path:"suite-programa", 
    component: DefSuiteInscripProgramaComponent ,
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ 
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/admisiones/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch()) ]
})
export class AppRoutingModule { }
