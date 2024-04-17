import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { ViewCell } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'checkbox-assistance',
  templateUrl: './checkbox-assistance.component.html',
  styleUrls: ['./checkbox-assistance.component.scss']
})
export class CheckboxAssistanceComponent implements  OnInit{

  Assistance: any;

  @Input() value!: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() row: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.Assistance = true;
  }

  funcion(event:any): void{
    this.save.emit(event.target.checked);
    if (event.target.checked) {
      this.row.emit(this.rowData);
    }
  }

}
