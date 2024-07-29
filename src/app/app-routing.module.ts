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
import { ListadoOficializadosComponent } from './components/listado-oficializados/listado-oficializados.component';
import { ListadoAdmitidosComponent } from './components/listado-admitidos/listado-admitidos/listado-admitidos.component';
import { PreinscripcionProyectosCurricularesComponent } from './components/preinscripcion-proyectos-curriculares/preinscripcion-proyectos-curriculares.component';
import { ListaTipoInscripcionComponent } from './components/tipo-inscripcion/lista-tipo-inscripcion/lista-tipo-inscripcion.component';
import { CreacionTipoInscipcionComponent } from './components/tipo-inscripcion/creacion-tipo-inscipcion/creacion-tipo-inscipcion.component';
import { ListaTipoCuposComponent } from './components/tipo-cupos/lista-tipo-cupos/lista-tipo-cupos.component';
import { CreacionTipoCuposComponent } from './components/tipo-cupos/creacion-tipo-cupos/creacion-tipo-cupos.component';
import { AuthGuard } from 'src/_guards/auth.guard';

const routes: Routes = [
  {
    path: "codificacion", // cambiar la ruta del modulo
    canActivate: [AuthGuard],
    loadChildren: () => import ('./components/codificacion-module/codificacion.module').then(m => m.CodificacionModule),
  },
  {
    path:"administrar-criterios", 
    canActivate: [AuthGuard],
    component: AdministradorCriteriosComponent
  },
  {
    path:"criterios", 
    canActivate: [AuthGuard],
    component: CriterioAdmisionComponent
  },
  {
    path:"asignacion-cupos", 
    canActivate: [AuthGuard],
    component: AsignacionCuposComponent
  },
  {
    path:"asignacion-cupos/comentarios-cupos", 
    canActivate: [AuthGuard],
    component: ComentariosCuposComponent
  },
  {
    path:"evaluacion-documentos-inscritos", 
    canActivate: [AuthGuard],
    component: EvaluacionDocumentosInscritosComponent
  },
  {
    path:"administracion-cuenta", 
    canActivate: [AuthGuard],
    component: AdministracionCuentaBancariaComponent
  },
  {
   path:"evaluacion-aspirantes", 
   canActivate: [AuthGuard],
    component: EvaluacionAspirantesComponent
  },
    {
    path:"evaluacion-aspirantes-pregrado",
    canActivate: [AuthGuard], 
    component: EvalucionAspirantePregradoComponent
  },
  {
    path:"listado-aspirantes", 
    canActivate: [AuthGuard],
    component: ListadoAspiranteComponent
  },
  {
    path:"lista-proyectos-aspirantes", 
    canActivate: [AuthGuard],
    component: ListaProyectosAspirantesComponent
  },
  {
    path:"asignar-descuento-documento", 
    canActivate: [AuthGuard],
    component: AsignarDocumentosDescuentosComponent
  },
  {
    path:"transferencias/:process", 
    canActivate: [AuthGuard],
    component: TransferenciaComponent,
  },
  {
    path:"solicitud-transferencia/:id/:process", 
    canActivate: [AuthGuard],
    component: SolicitudTransferenciaComponent,
  },
  {
    path:"suite-programa", 
    canActivate: [AuthGuard],
    component: DefSuiteInscripProgramaComponent,
  },
  {
    path:"liquidacion-recibos-posgrado", 
    canActivate: [AuthGuard],
    component: LiquidacionRecibosComponent,
  },
  {
    path:"liquidacion-recibos-pregrado", 
    canActivate: [AuthGuard],
    component: LiquidacionPregrado,
  },
  {
    path:"liquidacion-historico", 
    canActivate: [AuthGuard],
    component: LiquidacionHistoricoComponent,
  },
   {
     path:"soporte-configuracion", 
     canActivate: [AuthGuard],
     component: SoporteConfiguracionComponent ,
   },
    {path:"reportes-inscritos", 
      canActivate: [AuthGuard],
    component: RepotesInscripcionesComponent,
  },
  {
    path:"listado-pregrado", 
    canActivate: [AuthGuard],
    component: ListadoAspirantesPregradoComponent,
  },
  {
    path:"snp", 
    canActivate: [AuthGuard],
    component: CargueSnpComponent,
  },
  {
    path:"listados-oficializados", 
    canActivate: [AuthGuard],
    component: ListadosOficializadosComponent
  },
  {
    path:"listado-oficializados", 
    canActivate: [AuthGuard],
    component: ListadosOficializadosComponent,
  },
  {
    path:"listado-admitidos", 
    canActivate: [AuthGuard],
    component: ListadoAdmitidosComponent,
  },
  {
    path:"inscripcion-proyectos-curriculares", 
    canActivate: [AuthGuard],
    component: PreinscripcionProyectosCurricularesComponent,
  },
  {
    path:"lista-tipo-inscripcion", 
    canActivate: [AuthGuard],
    component: ListaTipoInscripcionComponent,
  },
  {
    path:"crear-tipo-inscripcion", 
    canActivate: [AuthGuard],
    component: CreacionTipoInscipcionComponent,
  },
  {
    path:"lista-tipo-cupos", 
    canActivate: [AuthGuard],
    component: ListaTipoCuposComponent,
  },
  {
    path:"crear-tipo-cupos", 
    canActivate: [AuthGuard],
    component: CreacionTipoCuposComponent,
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
