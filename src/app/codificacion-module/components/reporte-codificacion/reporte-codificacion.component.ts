import { Component, OnInit } from '@angular/core';
import { SgaParametrosService } from '../../services/sga_parametros.service';
import { PeriodoAcademico } from '../../models/types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SgaOikosService } from '../../services/sga_oikos.service';
import { SgaProyectoAcademicoService } from '../../services/sga_proyecto_academico.service';

@Component({
  selector: 'app-reporte-codificacion',
  templateUrl: './reporte-codificacion.component.html',
  styleUrls: ['./reporte-codificacion.component.scss']
})
export class ReporteCodificacionComponent implements OnInit {


  reporteForm: FormGroup;
  periodosAcademicos: PeriodoAcademico[] = [];
  facultades: any[] = [];
  proyectos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private sgaParametrosService: SgaParametrosService,
    private sgaOikosService: SgaOikosService,
    private sgaProyectoAcademicoService: SgaProyectoAcademicoService,

  ) {
    this.reporteForm = this.fb.group({
      periodoAcademico: ["", Validators.required],
      facultad: ["", Validators.required],
      proyectoCurricular: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.caragarPeriodos()
    this.caragarFacultades()
  }

  caragarPeriodos() {
    this.sgaParametrosService.get('periodo?query=&limit=0&sortby=Nombre&order=asc').subscribe(
      (Response: any) => {
        this.periodosAcademicos = Response.Data
        console.log(this.periodosAcademicos)
      }
    )
  }

  caragarFacultades() {
    this.sgaOikosService.get('dependencia?query=&limit=0&sortby=Nombre&order=asc').subscribe(
      (Response: any) => {
        this.facultades = Response
        console.log(this.facultades)
      }
    )
  }

  caragarProyectosAcademicos(idFacultad: number) {
    this.sgaProyectoAcademicoService.get(`proyecto_academico_institucion?query=FacultadId:${idFacultad}&limit=0&sortby=Nombre&order=asc`).subscribe(
      (Response: any) => {
        this.proyectos = Response
      }
    )
  }

  onFacultadChange(event: any) {
    const facultadId = event.value;
    this.caragarProyectosAcademicos(facultadId)
  }

  onSubmit() {
    if (this.reporteForm.valid) {
      // Perform form submission logic here
      console.log('Form submitted successfully!');
    } else {
      // Display an error message or handle invalid form state
      console.log('Please fill in all required fields.');
    }
  }

}
