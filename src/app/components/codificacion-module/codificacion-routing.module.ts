import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodificacionComponent } from './components/codificacion/codificacion.component';

const routes: Routes = [
  {
    path: "",
    component: CodificacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodificacionRoutingModule { }
