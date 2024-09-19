import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { PopUpManager } from "src/app/managers/popUpManager";

@Component({
  selector: "app-subcriterios-dialog",
  templateUrl: "./subcriterios-dialog.component.html",
  styleUrls: ["./subcriterios-dialog.component.scss"],
})
export class SubcriteriosDialogComponent {
  dataSourceSubCriterio: MatTableDataSource<any>;
  title: string = "";

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    public dialogRef: MatDialogRef<SubcriteriosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSourceSubCriterio = new MatTableDataSource(data.subcriterios);
    this.title = data.title.toLowerCase();
  }

  onSave(): void {
    if (this.calcularPorcentajeTotal() === 100) {
      this.dialogRef.close(this.dataSourceSubCriterio.data);
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('admision.error_porcentaje_invalido'));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  calcularPorcentajeTotal(): number {
    let total = 0;
    if (
      !this.dataSourceSubCriterio ||
      !Array.isArray(this.dataSourceSubCriterio.data)
    ) {
      console.error(
        "El dataSourceSubCriterio.data no es un array o no está inicializado."
      );
      return 0;
    }
    this.dataSourceSubCriterio.data.forEach((subcriterio) => {
      total += Number(subcriterio.Porcentaje);
    });
    return total
  }
}
