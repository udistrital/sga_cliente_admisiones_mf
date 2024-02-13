import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';


const routes: Routes = [
  {
    path: "", // cambiar la ruta del modulo
    loadChildren: () => import ('./codificacion-module/codificacion.module').then(m => m.CodificacionModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/admisiones/" }],
})
export class AppRoutingModule { 


}
