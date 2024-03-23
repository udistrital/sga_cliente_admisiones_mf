import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from "src/environments/environment";
import { CodificacionModule } from "./codificacion-module/codificacion.module";
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    `${environment.apiUrl}assets/i18n/`,
    ".json"
  );
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    CodificacionModule,
    SpinnerUtilModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilInterceptor, multi: true}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
