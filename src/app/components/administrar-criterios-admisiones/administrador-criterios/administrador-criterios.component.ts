import { MatSort } from '@angular/material/sort';
import { Criterio } from 'src/app/models/admision/criterio';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DialogoCriteriosComponent } from '../dialogo-criterios/dialogo-criterios.component';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';

@Component({
  selector: 'ngx-administrador-criterios',
  templateUrl: './administrador-criterios.component.html',
  styleUrls: ['./administrador-criterios.component.scss'],
})
export class AdministradorCriteriosComponent implements OnInit {

  criterios!: Criterio[];
  criterioSettings: any;
  subcriterioSettings: any;
  criterioSource!: MatTableDataSource<Criterio>
  subcriterioSource!: MatTableDataSource<any>
  subcriterio!: MatTableDataSource<any>
  dialogConfig!: MatDialogConfig;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  criterioColumn = ['nombre', 'descripcion', 'asistencia', 'acciones'];
  constructor(

    private dialog: MatDialog,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private admisiones: EvaluacionInscripcionService,

  ) {

    this.subcriterio != new MatTableDataSource()
    this.subcriterioSource = new MatTableDataSource()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

    })
  }

  ngOnInit() {
    this.criterios = [];
    this.admisiones.get('requisito?limit=0&query=Activo:true').subscribe(
      (response: any) => {
        this.criterios = <Criterio[]>response.filter((c: any) => c['RequisitoPadreId'] === null);
        this.criterios.forEach(criterio => {
          this.admisiones.get('requisito?limit=0&query=Activo:true,RequisitoPadreId.Id:' + criterio.Id).subscribe(
            (response: any) => {
              if (response.length > 0 && Object.keys(response[0]).length > 0) {
                criterio.Subcriterios = <Criterio[]>response;
              } else {
                criterio.Subcriterios = [];
              }
            },
            (error: any) => {
              criterio.Subcriterios = [];
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
            },
          );
        });
        this.criterioSource = new MatTableDataSource(this.criterios)

        setTimeout(() => {
          this.criterioSource.paginator = this.paginator;
          this.criterioSource.sort = this.sort;
        }, 300);
      },
      (error: any) => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      },
    );
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '800px';
    this.dialogConfig.height = '380px';
    this.dialogConfig.data = {};
  }

  applyFilterProces(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.criterioSource.filter = filterValue.trim().toLowerCase();
    if (this.criterioSource.paginator) {
      this.criterioSource.paginator.firstPage();
    }
  }


  agregarCriterio() {
    this.dialogConfig.data = {};
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio !== undefined) {
        this.admisiones.post('requisito', criterio).subscribe(
          (response: any) => {
            if(criterio.Subcriterios && criterio.Subcriterios.length > 0){
              criterio.Subcriterios.forEach((subcriterio:any) => {
                subcriterio.RequisitoPadreId = { Id: response.Id };
                this.admisiones.post('requisito', subcriterio).subscribe(
                  (response: any) => {
                  },
                  (error:any) => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_registro_criterio'));
                  },
                );
              });
            }
            const newCriterio: Criterio = <Criterio>response;
            newCriterio.Subcriterios = [];
            this.criterios.push(newCriterio);
            // this.criterioSource.load(this.criterios);
            this.criterioSource = new MatTableDataSource(this.criterios)
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_exito'));
          },
          (error: any) => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_registro_criterio'));
          },
        );
      }
    });
  }

  editarCriterio(event: any) {
    this.dialogConfig.data = { oldCriterio: event.data };
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio !== undefined) {
        this.admisiones.put('requisito', criterio).subscribe(
          (response: any) => {
            const updatedCriterio: Criterio = <Criterio>response;
            // this.criterioSource.update(event.data, updatedCriterio);
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_modificado'));
          },
          (error: any) => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_modificar_criterio'));
          },
        );
      }
    });
  }

  inactivarCriterio(event: any) {
    this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_inactivar_criterio')).then(
      (willDelete: any) => {
        if (willDelete.value) {
          const criterio = <Criterio>event.data;
          criterio.Activo = false;
          this.admisiones.put('requisito', criterio).subscribe(
            (response: any) => {
              this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_inactivado'));
              this.ngOnInit();
            },
            (error: any) => {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_inactivar_criterio'));
            },
          );
        }
      },
    );
  }

  agregarSubcriterio(event: any, criterio: Criterio) {
    this.dialogConfig.data = { sub: true };
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    criterioDialog.afterClosed().subscribe((subCriterio: Criterio) => {
      if (subCriterio !== undefined) {
        subCriterio.RequisitoPadreId = { Id: criterio.Id };
        this.admisiones.post('requisito', subCriterio).subscribe(
          (response: any) => {
            const newSubcriterio: Criterio = <Criterio>response;
            criterio.Subcriterios.push(newSubcriterio);
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_exito'));
          },
          (error: any) => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_registro_criterio'));
          },
        );
      }
    });
  }

  editarSubcriterio(event: any) {
    this.dialogConfig.data = { oldCriterio: event.data, sub: true };
    const subcriterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    subcriterioDialog.afterClosed().subscribe((subcriterio: Criterio) => {
      if (subcriterio !== undefined) {
        this.admisiones.put('requisito', subcriterio).subscribe(
          (response: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_modificado'));
            this.ngOnInit()
          },
          (error: any) => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_modificar_criterio'));
          },
        );
      }
    });
  }

}
