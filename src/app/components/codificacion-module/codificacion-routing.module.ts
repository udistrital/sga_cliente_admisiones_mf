import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodificacionComponent } from './components/codificacion/codificacion.component';
import { ReporteCodificacionComponent } from './components/reporte-codificacion/reporte-codificacion.component';
import { AuthGuard } from 'src/_guards/auth.guard';

const rawRoutes: Routes = [
  {
    path: "codificacion/crear",
    component: CodificacionComponent,
  },
  {
    path: "codificacion/reporte",
    component: ReporteCodificacionComponent
  }
];

const routes: Routes = rawRoutes.map((route) => ({
  ...route,
  canActivate: [AuthGuard],
}));

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodificacionRoutingModule { }
