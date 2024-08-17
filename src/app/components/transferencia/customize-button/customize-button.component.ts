import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'customize-button',
  templateUrl: './customize-button.component.html',
  styleUrls: ['./customize-button.component.scss']
})
export class CustomizeButtonComponent implements  OnInit{

  @Input() value: any;
  @Input() rowData: any;
  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
  }

  clickEvent(){
    this.save.emit(this.rowData);
  }
  
  showExpired(){

  }
}
