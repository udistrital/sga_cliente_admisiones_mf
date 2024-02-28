import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CodificacionRoutingModule } from "./codificacion-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { CodificacionComponent } from "./components/codificacion/codificacion.component";

import { ReactiveFormsModule } from "@angular/forms";

import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";

import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [CodificacionComponent],
  imports: [
    CommonModule,
    CodificacionRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
    TranslateModule
  ],
})
export class CodificacionModule {}
