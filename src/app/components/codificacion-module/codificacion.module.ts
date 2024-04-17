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
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from '@angular/material/tooltip'

import { TranslateModule } from "@ngx-translate/core";
import { ReporteCodificacionComponent } from './components/reporte-codificacion/reporte-codificacion.component';

import { SafeUrlPipe } from "../core/pipes/safe-url.pipe";
import { ReporteVisualizerComponent } from './components/reporte-visualizer/reporte-visualizer.component';

@NgModule({
  declarations: [CodificacionComponent, ReporteCodificacionComponent, SafeUrlPipe, ReporteVisualizerComponent],
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
    TranslateModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class CodificacionModule { }
