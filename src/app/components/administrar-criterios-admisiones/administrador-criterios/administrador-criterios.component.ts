import { inject } from '@angular/core';
import { AccesoConfiguracionAdmisionService, PERMISOS_CONFIGURACION } from 'src/app/services/acceso-configuracion-admision.service';
import { MatSort } from "@angular/material/sort";
import { Criterio } from "src/app/models/admision/criterio";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { PopUpManager } from "src/app/managers/popUpManager";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialogConfig, MatDialog } from "@angular/material/dialog";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { DialogoCriteriosComponent } from "../dialogo-criterios/dialogo-criterios.component";
import { EvaluacionInscripcionService } from "src/app/services/evaluacion_inscripcion.service";
import { EMPTY, catchError, forkJoin, Observable } from "rxjs";

@Component({
    selector: "ngx-administrador-criterios",
    templateUrl: "./administrador-criterios.component.html",
    styleUrls: ["./administrador-criterios.component.scss"],
    standalone: false
})
export class AdministradorCriteriosComponent implements OnInit {
  readonly acceso = inject(AccesoConfiguracionAdmisionService).crear(PERMISOS_CONFIGURACION.criterios);
  criterios!: Criterio[];
  criterioSettings: any;
  subcriterioSettings: any;
  criterioSource!: MatTableDataSource<Criterio>;
  subcriterioSource!: MatTableDataSource<any>;
  subcriterio!: MatTableDataSource<any>;
  dialogConfig!: MatDialogConfig;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  get criterioColumn() {
    return ['nombre', 'descripcion', 'asistencia',
      ...(this.acceso.permite('editar_criterio_admision') || this.acceso.permite('desactivar_criterio_admision') ? ['acciones'] : [])];
  }
  get subcriterioColumn() {
    return ['nombre', 'descripcion', 'asistencia',
      ...(this.acceso.permite('editar_subcriterio_admision') || this.acceso.permite('desactivar_subcriterio_admision') ? ['acciones'] : [])];
  }
  constructor(
    private dialog: MatDialog,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private admisiones: EvaluacionInscripcionService,
    private cdr: ChangeDetectorRef
  ) {
    this.subcriterio != new MatTableDataSource();
    this.subcriterioSource = new MatTableDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  ngOnInit() {
    this.criterios = [];
    this.admisiones.get("requisito?limit=0&query=Activo:true").subscribe(
      (response: any) => {
        this.criterios = <Criterio[]>(
          response.filter((c: any) => c["RequisitoPadreId"] === null)
        );
        this.criterios.forEach((criterio) => {
          this.admisiones
            .get(
              "requisito?limit=0&query=Activo:true,RequisitoPadreId.Id:" +
                criterio.Id
            )
            .subscribe(
              (response: any) => {
                if (
                  response.length > 0 &&
                  Object.keys(response[0]).length > 0
                ) {
                  criterio.Subcriterios = <Criterio[]>response;
                } else {
                  criterio.Subcriterios = [];
                }
              },
              (error: any) => {
                criterio.Subcriterios = [];
                this.popUpManager.showErrorToast(
                  this.translate.instant("admision.error_cargar")
                );
              }
            );
        });
        this.criterioSource = new MatTableDataSource(this.criterios);

        setTimeout(() => {
          this.criterioSource.paginator = this.paginator;
          this.criterioSource.sort = this.sort;
        }, 300);
      },
      (error: any) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("admision.error_cargar")
        );
      }
    );
    this.dialogConfig = new MatDialogConfig();
  }

  applyFilterProces(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.criterioSource.filter = filterValue.trim().toLowerCase();
    if (this.criterioSource.paginator) {
      this.criterioSource.paginator.firstPage();
    }
  }

  agregarCriterio() {
    if (!this.acceso.validar('crear_criterio_admision')) return;
    // Verifica el tamaño de la pantalla
    if (window.innerWidth < 600) {
      // Configuración para dispositivos móviles
      this.dialogConfig.width = "90%";
      this.dialogConfig.height = "80%";
    } else {
      // Configuración para pantallas más grandes
      this.dialogConfig.width = "600px";
      this.dialogConfig.maxHeight = "80%";
    }
    this.dialogConfig.data = {};
    this.dialogConfig.data.acceso = this.acceso;
    this.dialogConfig.data.permiso = 'crear_criterio_admision';
    const criterioDialog = this.dialog.open(
      DialogoCriteriosComponent,
      this.dialogConfig
    );
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio) {
        if (!this.acceso.validar('crear_criterio_admision')) return;
        this.admisiones
          .post("requisito", criterio)
          .pipe(
            catchError((error) => {
              this.popUpManager.showErrorToast(
                this.translate.instant("admision.error_registro_criterio")
              );
              return EMPTY;
            })
          )
          .subscribe((response: any) => {
            const subcriteriosRequest: Observable<any>[] = [];

            if (criterio.Subcriterios && criterio.Subcriterios.length > 0) {
              criterio.Subcriterios.forEach((subcriterio: any) => {
                subcriterio.RequisitoPadreId = { Id: response.Id };
                subcriteriosRequest.push(
                  this.admisiones.post("requisito", subcriterio)
                );
              });
            }

            const updateTable = (subcriterios: Criterio[] = []) => {
              const newCriterio: Criterio = { ...response, Subcriterios: subcriterios };
              this.criterios.unshift(newCriterio);
              this.criterioSource.data = this.criterios;
              this.cdr.detectChanges();
              this.popUpManager.showSuccessAlert(
                this.translate.instant("admision.criterio_exito")
              );
            };

            if (subcriteriosRequest.length > 0) {
              forkJoin(subcriteriosRequest)
                .pipe(
                  catchError((error) => {
                    this.popUpManager.showErrorToast(
                      this.translate.instant("admision.error_registro_criterio")
                    );
                    // El padre ya existe aunque falle alguno de sus hijos.
                    // Recargar evita ocultarlo e inducir una creación duplicada.
                    this.ngOnInit();
                    return EMPTY;
                  })
                )
                .subscribe((subcriterios) => {
                  updateTable(subcriterios);
                });
            } else {
              // Si no hay subcriterios, simplemente actualiza la tabla
              updateTable();
            }
          });
      }
    });
  }

  editarCriterio(event: any) {
    if (!this.acceso.validar('editar_criterio_admision')) return;
    this.dialogConfig.data = { oldCriterio: event.data };
    this.dialogConfig.data.acceso = this.acceso;
    this.dialogConfig.data.permiso = 'editar_criterio_admision';
    const criterioDialog = this.dialog.open(
      DialogoCriteriosComponent,
      this.dialogConfig
    );
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio) {
        if (!this.acceso.validar('editar_criterio_admision')) return;
        this.admisiones.put("requisito", criterio).subscribe(
          (response: any) => {
            Object.assign(event.data, criterio, response, {
              Subcriterios: event.data.Subcriterios ?? [],
            });
            this.criterioSource.data = [...this.criterios];
            this.cdr.detectChanges();
            this.popUpManager.showSuccessAlert(
              this.translate.instant("admision.criterio_modificado")
            );
          },
          (error: any) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("admision.error_modificar_criterio")
            );
          }
        );
      }
    });
  }

  inactivarCriterio(event: any) {
    if (!this.acceso.validar('desactivar_criterio_admision')) return;
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant("admision.seguro_inactivar_criterio")
      )
      .then((willDelete: any) => {
        if (willDelete.value) {
          if (!this.acceso.validar('desactivar_criterio_admision')) return;
          const criterio = <Criterio>event.data;
          this.criterios;
          criterio.Activo = false;

          this.admisiones.put("requisito", criterio).subscribe(
            (response: any) => {
              this.popUpManager.showSuccessAlert(
                this.translate.instant("admision.criterio_inactivado")
              );

              // Actualizar el array `criterios`
              const index = this.criterios.findIndex(
                (c) => c.Id === criterio.Id
              );
              if (index !== -1) {
                this.criterios.splice(index, 1); // Eliminamos el criterio del array
              }

              // Actualizar el `matTableDataSource`
              this.criterioSource.data = this.criterios;

              // Reasignar el paginator para asegurar la actualización
              this.criterioSource.paginator = this.paginator;
            },
            (error: any) => {
              this.popUpManager.showErrorToast(
                this.translate.instant("admision.error_inactivar_criterio")
              );
            }
          );
        }
      });
  }

  agregarSubcriterio(event: any, criterio: Criterio) {
    if (!this.acceso.validar('crear_subcriterio_admision')) return;
    this.dialogConfig.data = { sub: true };
    this.dialogConfig.data.acceso = this.acceso;
    this.dialogConfig.data.permiso = 'crear_subcriterio_admision';
    const criterioDialog = this.dialog.open(
      DialogoCriteriosComponent,
      this.dialogConfig
    );
    criterioDialog.afterClosed().subscribe((subCriterio: Criterio) => {
      if (subCriterio) {
        if (!this.acceso.validar('crear_subcriterio_admision')) return;
        subCriterio.RequisitoPadreId = { Id: criterio.Id };
        this.admisiones.post("requisito", subCriterio).subscribe(
          (response: any) => {
            const newSubcriterio: Criterio = <Criterio>response;
            criterio.Subcriterios = [newSubcriterio, ...(criterio.Subcriterios ?? [])];
            const foundCriterio = this.criterios.find(
              (c) => c.Id === criterio.Id
            );
            if (foundCriterio) {
              foundCriterio.Subcriterios = [...criterio.Subcriterios];
            }
            this.cdr.detectChanges(); // Forzar la detección de cambios
            this.popUpManager.showSuccessAlert(
              this.translate.instant("admision.criterio_exito")
            );
          },
          (error: any) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("admision.error_registro_criterio")
            );
          }
        );
      }
    });
  }

  editarSubcriterio(event: any) {
    if (!this.acceso.validar('editar_subcriterio_admision')) return;
    this.dialogConfig.data = { oldCriterio: event.data, sub: true };
    this.dialogConfig.data.acceso = this.acceso;
    this.dialogConfig.data.permiso = 'editar_subcriterio_admision';
    const subcriterioDialog = this.dialog.open(
      DialogoCriteriosComponent,
      this.dialogConfig
    );
    subcriterioDialog.afterClosed().subscribe((subcriterio: Criterio) => {
      if (subcriterio) {
        if (!this.acceso.validar('editar_subcriterio_admision')) return;
        this.admisiones.put("requisito", subcriterio).subscribe(
          (response: any) => {
            Object.assign(event.data, subcriterio, response);
            const padre = this.criterios.find(c =>
              c.Subcriterios?.some(sub => sub.Id === subcriterio.Id)
            );
            if (padre) padre.Subcriterios = [...padre.Subcriterios];
            this.criterioSource.data = [...this.criterios];
            this.cdr.detectChanges();
            this.popUpManager.showSuccessAlert(
              this.translate.instant("admision.criterio_modificado")
            );
          },
          (error: any) => {
            this.popUpManager.showErrorToast(
              this.translate.instant("admision.error_modificar_criterio")
            );
          }
        );
      }
    });
  }

  eliminarSubcriterio(criterio: Criterio, subCriterio: Criterio) {
    if (!this.acceso.validar('desactivar_subcriterio_admision')) return;
    subCriterio.Activo = false;
    this.admisiones.put("requisito", subCriterio).subscribe(
      (response: any) => {
        if (response.Id) {
          // Encuentra el índice del subcriterio a eliminar
          const index = criterio.Subcriterios.findIndex(sc => sc.Id === subCriterio.Id);
          if (index > -1) {
            // Elimina el subcriterio del array
            criterio.Subcriterios.splice(index, 1);
          }
          const foundCriterio = this.criterios.find(
            (c) => c.Id === criterio.Id
          );
          if (foundCriterio) {
            foundCriterio.Subcriterios = [...criterio.Subcriterios];
          }
          this.cdr.detectChanges(); // Forzar la detección de cambios
          this.popUpManager.showSuccessAlert(
            this.translate.instant("GLOBAL.confirmarEliminar")
          );
        }
      },
      (error: any) => {
        this.popUpManager.showErrorToast(
          this.translate.instant("GLOBAL.error")
        );
      }
    );
  }
}
