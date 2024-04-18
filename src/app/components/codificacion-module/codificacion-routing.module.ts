import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodificacionComponent } from './components/codificacion/codificacion.component';
import { ReporteVisualizerComponent } from "../reporte-visualizer/reporte-visualizer.component";
import { RepotesInscripcionesComponent } from "../repotes-inscripciones/repotes-inscripciones.component";

const routes: Routes = [
  {
    path: "codificacion",
    component: RepotesInscripcionesComponent
  },
  {
    path: "reporte-codificacion",
    component: ReporteVisualizerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodificacionRoutingModule { }
