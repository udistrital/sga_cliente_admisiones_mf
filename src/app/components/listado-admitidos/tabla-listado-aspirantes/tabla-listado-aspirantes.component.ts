import { Component, Input } from '@angular/core';
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

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private terceroService: TercerosService,
    private EvalaucionInscripcionServices: EvaluacionInscripcionService,
  ) { }

  ngOnInit() {
    this.consultarPersona();
  }

  consultarPersona() {
    const data: any[] = [];

    this.aspirantes.forEach((aspirante, index) => {
      this.terceroService.get(`tercero?query=Id:${aspirante.PersonaId}`).subscribe((response: any) => {
        response.forEach((element: any) => {
          this.terceroService.get(`datos_identificacion?query=TerceroId.Id:${element.Id}`).subscribe((dataDocumento: any) => {
            this.EvalaucionInscripcionServices.get(`detalle_evaluacion?query=InscripcionId:${aspirante.Id}`).subscribe((evaluacion: any) => {
              evaluacion.forEach((requisito: any) => {
                if (requisito.RequisitoProgramaAcademicoId.RequisitoId.Nombre === "ICFES") {
                  let jsonObjectDataIcfes = JSON.parse(requisito.DetalleCalificacion);
                  data.push({
                    n: index + 1,
                    credencial: "No disponible",
                    nombre: `${element.PrimerNombre} ${element.SegundoNombre}`,
                    apellido: `${element.PrimerApellido} ${element.SegundoApellido}`,
                    documento: dataDocumento[0].Numero,
                    snp: jsonObjectDataIcfes.areas[0].CODREGSNP,
                    icfes: jsonObjectDataIcfes.areas[0].GLOBAL,
                    ponderado: aspirante.NotaFinal,
                    inscripcion: aspirante.TipoInscripcionId.Nombre,
                    estado: aspirante.EstadoInscripcionId.Nombre
                  });
                  this.datasourceInscritos = new MatTableDataSource(data);
                }
              });
            }, error => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            });
          }, error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          });

        });

      }, error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      });

    });
  }

}
