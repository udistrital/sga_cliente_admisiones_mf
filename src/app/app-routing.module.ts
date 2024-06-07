import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AdministradorCriteriosComponent } from './components/administrar-criterios-admisiones/administrador-criterios/administrador-criterios.component';
import { AsignacionCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/asignacion_cupos.component';
import { CriterioAdmisionComponent } from './components/crieterios-admisiones-proyectos/criterio_admision/criterio_admision.component';
import { EvaluacionDocumentosInscritosComponent } from './components/evalucion-documentos-inscritos/evaluacion-documentos-inscritos/evaluacion-documentos-inscritos.component';
import { EvaluacionAspirantesComponent } from './components/Evaluacion-aspirante/evaluacion-aspirantes/evaluacion-aspirantes.component'; 
import { ListadoAspiranteComponent } from './components/listado-aspirantes/listado_aspirantes/listado_aspirante.component';
import { AdministracionCuentaBancariaComponent } from './components/administracion-cuenta-bancaria/administracion-cuenta-bancaria.component';
import { ComentariosCuposComponent } from './components/asignacion-cupos-proyectos/asignacion_cupos/comentarios-cupos/comentarios-cupos.component';
import { AsignarDocumentosDescuentosComponent } from './components/asignar-documentos-descuentos/asignar_documentos_descuentos/asignar_documentos_descuentos.component';
import { TransferenciaComponent } from './components/transferencia/transferencia/transferencia.component';
import { SolicitudTransferenciaComponent } from './components/transferencia/solicitud-transferencia/solicitud-transferencia.component';
import { DefSuiteInscripProgramaComponent } from './components/suite-programa/def_suite_inscrip_programa/def-suite-inscrip-programa.component';
import { ListadoHistoricoComponent } from './components/listado-historico/listado-historico.component';
import { LiquidacionRecibosComponent } from './components/liquidacion-recibos/liquidacion-recibos.component';
import { LiquidacionRecibosComponent as LiquidacionPregrado } from './components/liquidacion/liquidacion-recibos/liquidacion-recibos.component';
import { CodificacionModule } from './components/codificacion-module/codificacion.module';
import { ListaProyectosAspirantesComponent } from './components/lista-proyectos-aspirantes/lista-proyectos-aspirantes.component';
import { LiquidacionHistoricoComponent } from './components/liquidacion/liquidacion-historico/liquidacion-historico.component';
import { SoporteConfiguracionComponent } from './components/soporte-configuracion/soporte-configuracion.component';
import { RepotesInscripcionesComponent } from './components/repotes-inscripciones/repotes-inscripciones.component';
import { ListadoAspirantesPregradoComponent } from './components/listado-aspirantes-pregrado/listado-aspirantes-pregrado.component';
import { CargueSnpComponent } from './components/cargue-snp/cargue-snp.component';
import { EvalucionAspirantePregradoComponent } from './components/evalucion-aspirante-pregrado/evalucion-aspirante.component';
import { ListadosOficializadosComponent } from './components/listados-oficializados/listados-oficializados.component';


const routes: Routes = [
  {
    path: "codificacion", // cambiar la ruta del modulo
    loadChildren: () => import ('./components/codificacion-module/codificacion.module').then(m => m.CodificacionModule),
  },
  {
    path:"administrar-criterios", 
    component: AdministradorCriteriosComponent
  },
  {
    path:"criterios", 
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
    path:"evaluacion-documentos-inscritos", 
    component: EvaluacionDocumentosInscritosComponent
  },
  {
    path:"administracion-cuenta", 
    component: AdministracionCuentaBancariaComponent
  },
  {
    path:"evaluacion-aspirantes", 
    component: EvaluacionAspirantesComponent
  },
  {
    path:"evaluacion-aspirantes-pregrado", 
    component: EvalucionAspirantePregradoComponent
  },
  {
    path:"listado-aspirantes", 
    component: ListadoAspiranteComponent
  },
  {
    path:"lista-proyectos-aspirantes", 
    component: ListaProyectosAspirantesComponent
  },
  {
    path:"asignar-descuento-documento", 
    component: AsignarDocumentosDescuentosComponent
  },
  {
    path:"transferencias/:process", 
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
  {
    path:"liquidacion-recibos-posgrado", 
    component: LiquidacionRecibosComponent ,
  },
  {
    path:"liquidacion-recibos-pregrado", 
    component: LiquidacionPregrado,
  },
  {
    path:"liquidacion-historico", 
    component: LiquidacionHistoricoComponent ,
  },
  // {
  //   path:"soporte-configuracion", 
  //   component: SoporteConfiguracionComponent ,
  // },
    {path:"reportes-inscritos", 
    component: RepotesInscripcionesComponent ,
  },
  {
    path:"listado-pregrado", 
    component: ListadoAspirantesPregradoComponent ,
  },
  {
    path:"snp", 
    component: CargueSnpComponent ,
  },
  {
    path:"listados-oficializados", 
    component: ListadosOficializadosComponent
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
