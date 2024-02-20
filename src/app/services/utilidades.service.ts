import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {

    static userArray: any[];
    static jsonArray: any[];

    constructor(
        private translate: TranslateService,
    ) {
    }

    static getSumArray(array:any): any {
        let sum = 0;
        array.forEach((element:any) => {
            sum += element;
        });
        return sum;
    }

    translateTree(tree: any) {
        const trans = tree.map((n: any) => {
            let node = {};
            node = {
                id: n.Id,
                name: n.Nombre,
            }
            if (n.hasOwnProperty('Opciones')) {
                if (n.Opciones !== null) {
                    const children = this.translateTree(n.Opciones);
                    node = { ...node, ...{ children: children } };
                }
                return node;
            } else {
                return node;
            }
        });
        return trans;
    }


  translateFields(form:any, prefix:any, prefix_placeholder:any) {
    form.campos = form.campos.map((field: any) => {
      return {
        ...field,
        ...{
          label: this.translate.instant(prefix + field.label_i18n),
            placeholder: this.translate.instant(prefix + field.placeholder_i18n)
        }
      }
    });
  }


  getEvaluacionDocumento(MetadatosString: string) {
    let ObjetMetadatos : any= { 
        aprobado: null, 
        estadoObservacion: this.translate.instant('GLOBAL.estado_no_definido'), 
        observacion: ""
    };
    if (MetadatosString !== '') {
        let metadatos = JSON.parse(MetadatosString);
        if (metadatos.hasOwnProperty('aprobado') && metadatos.hasOwnProperty('observacion')) {
            if (metadatos.aprobado) {
                ObjetMetadatos.aprobado = true;
                ObjetMetadatos.estadoObservacion = this.translate.instant('GLOBAL.estado_aprobado');
            } else {
                ObjetMetadatos.aprobado = false;
                ObjetMetadatos.estadoObservacion = this.translate.instant('GLOBAL.estado_no_aprobado');
            }
            ObjetMetadatos.observacion = metadatos.observacion;
        }
    }
    return ObjetMetadatos;
  }

  static hardCopy(Objeto: Object): Object {
    return JSON.parse(JSON.stringify(Objeto));
  }

  static ListaPatrones = {
    correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  }

}
