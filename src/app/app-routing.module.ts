import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AdministradorCriteriosComponent } from './components/administrar-criterios-admisiones/administrador-criterios/administrador-criterios.component';
import { AsignacionCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/asignacion_cupos.component';
import { CriterioAdmisionComponent } from './components/crieterios-admisiones-proyectos/criterio_admision/criterio_admision.component';
import { EvaluacionDocumentosInscritosComponent } from './components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component';
//import { EvaluacionAspirantesComponent } from './components/evaluacion-aspirantes/evaluacion-aspirantes.component';
import { ListadoAspiranteComponent } from './components/listado-aspirantes/listado_aspirantes/listado_aspirante.component';
import { AdministracionCuentaBancariaComponent } from './components/administracion-cuenta-bancaria/administracion-cuenta-bancaria.component';
import { ComentariosCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/comentarios-cupos/comentarios-cupos.component';
//import { EvaluacionAspirantesComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component';


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
    path:"asignacion-cupos/comentarios-cupos", 
    component: ComentariosCuposComponent
  },
  {
    path:"documentos-inscritos", 
    component: EvaluacionDocumentosInscritosComponent
  },
  {
    path:"administracion-cuenta", 
    component: AdministracionCuentaBancariaComponent
  },
  //{
   // path:"evaluacion-aspirantes", 
    //component: EvaluacionAspirantesComponent
  //},
  {
    path:"listado-aspirantes", 
    component: ListadoAspiranteComponent
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
