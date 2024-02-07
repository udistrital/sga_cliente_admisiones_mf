import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { CodificacionComponent } from './components/codificacion/codificacion.component';

const routes: Routes = [
  {path: '', component: CodificacionComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/admisiones/" }],
})
export class AppRoutingModule { 


}
