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
import { TipoInscripcionComponent } from './components/tipo-inscripcion/tipo-inscripcion.component';
import { TipoCuposComponent } from './components/tipo-cupos/tipo-cupos.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { AuthGuard } from 'src/_guards/auth.guard';
import { CodificacionComponent } from './components/codificacion-module/components/codificacion/codificacion.component';
import { ReporteCodificacionComponent } from './components/codificacion-module/components/reporte-codificacion/reporte-codificacion.component';

const rawRoutes: Routes = [
  {
    path: 'codificacion/crear',
    component: CodificacionComponent,
    data: { configuracionAdmision: true, requiereEscritura: false, menuUrl: '/admisiones/codificacion/crear' },
  },
  {
    path: 'codificacion/reporte',
    component: ReporteCodificacionComponent,
    data: { configuracionAdmision: true, requiereEscritura: false, menuUrl: '/admisiones/codificacion/reporte' },
  },
  {
    path:"administrar-criterios", 
    component: AdministradorCriteriosComponent,
    data: { configuracionAdmision: true, menuUrl: '/admisiones/administrar-criterios' },
  },
  {
    path:"criterios", 
    component: CriterioAdmisionComponent,
    data: { configuracionAdmision: true, menuUrl: '/admisiones/criterios' },
  },
  {
    path:"asignacion-cupos", 
    component: AsignacionCuposComponent,
    data: { configuracionAdmision: true, requiereEscritura: false, menuUrl: '/admisiones/asignacion-cupos' },
  },
  {
    path:"asignacion-cupos/comentarios-cupos", 
    component: ComentariosCuposComponent,
    data: { configuracionAdmision: true, requiereEscritura: false, menuUrl: '/admisiones/asignacion-cupos' },
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
    component: ListadoAspiranteComponent,
    data: {
      menuUrl: '/admisiones/listado-aspirantes',
    },
  },
  {
    path:"lista-proyectos-aspirantes", 
    component: ListaProyectosAspirantesComponent
  },
  {
    path:"asignar-descuento-documento", 
    component: AsignarDocumentosDescuentosComponent,
    data: { configuracionAdmision: true, menuUrl: '/admisiones/asignar-descuento-documento' },
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
    component: DefSuiteInscripProgramaComponent,
    data: { configuracionAdmision: true, menuUrl: '/admisiones/suite-programa' },
  },
  {
    path:"liquidacion-recibos-posgrado", 
    component: LiquidacionRecibosComponent,
  },
  {
    path:"liquidacion-recibos-pregrado", 
    component: LiquidacionPregrado,
  },
  {
    path:"liquidacion-historico", 
    component: LiquidacionHistoricoComponent,
  },
  {
    path: 'reportes-inscritos',
    component: RepotesInscripcionesComponent,
    data: {
      menuUrl: '/admisiones/reportes-inscritos',
      configuracionAdmision: true,
      requiereEscritura: false,
    },
  },
  {
    path: 'listado-pregrado',
    component: ListadoAspirantesPregradoComponent,
    data: {
      menuUrl: '/admisiones/listado-pregrado',
    },
  },
  {
    path:"snp", 
    component: CargueSnpComponent,
  },
  {
    path:"listados-oficializados", 
    component: ListadosOficializadosComponent
  },
  {
    path:"listado-oficializados", 
    component: ListadoOficializadosComponent,
  },
  {
    path:"listado-admitidos", 
    component: ListadoAdmitidosComponent,
  },
  {
    path:"inscripcion-proyectos-curriculares", 
    component: PreinscripcionProyectosCurricularesComponent,
  },
  {
    path: 'lista-tipo-inscripcion',
    component: TipoInscripcionComponent,
    data: {
      catalogoTiposInscripcion: true,
      requiereEscritura: false,
      menuUrl: '/admisiones/lista-tipo-inscripcion',
    },
  },
  {
    path: 'lista-tipo-cupos',
    component: TipoCuposComponent,
    data: {
      catalogoTiposCupos: true,
      requiereEscritura: false,
      menuUrl: '/admisiones/lista-tipo-cupos',
    },
  },
  {
    path:"reportes", 
    component: ReportesComponent,
    data: { 
      configuracionAdmision: true, 
      requiereEscritura: false, 
      menuUrl: '/admisiones/reportes' },
  },
];

const routes: Routes = rawRoutes.map((route) => ({
  ...route,
  canActivate: [AuthGuard],
}));

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
