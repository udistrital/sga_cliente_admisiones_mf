import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodificacionComponent } from './components/codificacion/codificacion.component';
import { ReporteCodificacionComponent } from './components/reporte-codificacion/reporte-codificacion.component';

const routes: Routes = [
  {
    path: "codificacion",
    component: CodificacionComponent
  },
  {
    path: "reporte-codificacion",
    component: ReporteCodificacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodificacionRoutingModule { }
