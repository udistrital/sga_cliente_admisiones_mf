import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'doc-programa-obligatorio',
    templateUrl: './doc-programa-obligatorio.component.html',
    styleUrls: ['./doc-programa-obligatorio.component.scss'],
    standalone: false
})
export class DocProgramaObligatorioComponent implements OnInit, OnChanges {

  @Input() puedeEditar = false;
  @Input() value: boolean | any;
  @Input() rowData: any;
  @Output() checkboxVal: EventEmitter<any> = new EventEmitter();

  miniForm!: FormGroup

  constructor() { }

  ngOnChanges() {
    const control = this.miniForm?.get('obligatorio');
    if (this.puedeEditar) control?.enable({ emitEvent: false });
    else control?.disable({ emitEvent: false });
  }

  ngOnInit() {
    this.miniForm = new FormGroup({
      obligatorio: new FormControl({ value: this.value, disabled: !this.puedeEditar })
    });

    this.miniForm.get("obligatorio")!.valueChanges.subscribe((x:any) => {
      if (!this.puedeEditar) return;
      this.checkboxVal.emit({value: x, Data: this.rowData})
   })
  }

}
