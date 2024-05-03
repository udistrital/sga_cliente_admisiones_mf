import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reporte-visualizer',
  templateUrl: './reporte-visualizer.component.html',
  styleUrls: ['./reporte-visualizer.component.scss']
})
export class ReporteVisualizerComponent {
  constructor(
    public dialogRef: MatDialogRef<ReporteVisualizerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

