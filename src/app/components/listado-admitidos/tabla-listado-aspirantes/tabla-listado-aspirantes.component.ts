import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { TercerosService } from 'src/app/services/terceros.service';

@Component({
  selector: 'app-tabla-listado-aspirantes',
  templateUrl: './tabla-listado-aspirantes.component.html',
  styleUrls: ['./tabla-listado-aspirantes.component.scss']
})
export class TablaListadoAspirantesComponent {

  @Input() aspirantes: any[] = [];
  columnsInscritos = ['n', 'credencial', 'nombre', 'apellido', 'documento', 'snp', "icfes", "ponderado", "inscripcion", "estado"];
  datasourceInscritos !: MatTableDataSource<any>;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  
  loading!: boolean;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private terceroService: TercerosService,
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,
    private inscripcionService: InscripcionService,
  ) { }

  async ngOnChanges() {
    this.loading = true;
    await this.consultarDatos();
    this.loading = false;
  }

  async consultarDatos() {
    const data: any[] = [];
    let index = 0;
    for (const aspirante of this.aspirantes) {
      const persona: any = await this.consultarTercero(aspirante.PersonaId)
      const detallesEvaluacion: any = await this.consultarDetalleEvaluacion(aspirante.Id);
      const detalleIcfes = detallesEvaluacion.filter((item: any) => item.RequisitoProgramaAcademicoId.RequisitoId.CodigoAbreviacion === "ICFES")

      if (detallesEvaluacion === "No existe data") {
        continue;
      }
      
      const pregrado: any = await this.consultarInscripcionPregrado(aspirante.Id)

      if (detalleIcfes.length > 0) {
        let jsonObjectDataIcfes = JSON.parse(detalleIcfes[0].DetalleCalificacion);
        const item = {
          n: index + 1,
          credencial: "No disponible",
          nombre: `${persona.PrimerNombre} ${persona.SegundoNombre}`,
          apellido: `${persona.PrimerApellido} ${persona.SegundoApellido}`,
          documento: persona.NumeroIdentificacion,
          snp: pregrado[0].CodigoIcfes,
          icfes: jsonObjectDataIcfes.global ? jsonObjectDataIcfes.global : jsonObjectDataIcfes.GLOBAL,
          ponderado: aspirante.NotaFinal,
          inscripcion: aspirante.TipoInscripcionId.Nombre,
          estado: aspirante.EstadoInscripcionId.Nombre
        }
        data.push(item);
      }
      index ++;
    }
    this.datasourceInscritos = new MatTableDataSource(data);
    this.datasourceInscritos.paginator = this.paginator1;
  }
  
  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.terceroService.get('personas/' + personaId).subscribe((res: any) => {
        resolve(res);
      },
        (error: any) => {
          this.loading = false;
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('admision.tercero_error'));
          reject(false);
        });
    });
  }

  consultarDetalleEvaluacion(inscripcionId: any) {
    return new Promise((resolve, reject) => {
      this.EvalaucionInscripcionServices.get(`detalle_evaluacion?query=InscripcionId:${inscripcionId},Activo:true&sortby=Id&order=asc&limit=0`).subscribe((res: any) => {
        resolve(res);
      },
        (error: any) => {
          if (error === undefined) {
            resolve("No existe data")
          }
          // this.loading = false;
          // console.error(error);
          // this.popUpManager.showErrorAlert(this.translate.instant('admision.detalle_evaluacion_error'));
          // reject(false);
        }
      );
    });
  }

  consultarInscripcionPregrado(inscripcionId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(`inscripcion_pregrado?query=Activo:true,InscripcionId.Id:${inscripcionId}&sortby=Id&order=asc&limit=0`).subscribe((res: any) => {
        resolve(res);
      },
        (error: any) => {
          this.loading = false;
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('admision.inscripcion_pregrado_error'));
          reject(false);
        }
      );
    });
  }

}