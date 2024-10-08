import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';
import { getCookie } from 'src/utils/cookie';


@Component({
  selector: 'sga-admisiones-mf',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sga-cliente-admisiones-mf';
  whatLang$ = fromEvent(window, 'lang');
 
  ngOnInit(): void {
    this.validateLang();
  }
 
  constructor(
    private translate: TranslateService
  ) {}
 
  validateLang() {
    let lang = getCookie('lang') || 'es';
    this.whatLang$.subscribe((x:any) => {
      lang = x['detail']['answer'];
      this.translate.use(lang)
    });
    this.translate.use(getCookie('lang') || 'es');
  }
}


