import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';

@Injectable({
  providedIn: 'root'
})
export class ZipManagerService {
  
  private Archivos: any[] = [];
  private CarpetaPrincipal: string = "Compilado Documental";

  constructor(
    private newNuxeoService: NewNuxeoService,
    ) { }

  adjuntarArchivos(file: any[]): number {
    this.Archivos.push(...file);
    return this.Archivos.length
  }

  limpiarArchivos(): string {
    this.Archivos = [];
    return "cleaned"
  }

  listarArchivos(): any[] {
    return [...this.Archivos.map(f => {
      return {
        carpeta: f.carpeta.split('/')[0],
        grupoDoc: f.tabName,
        documentoId: f.DocumentoId,
        nombreDocumento: f.nombreDocumento,
        aprobado: f.estadoObservacion,
        observacion: f.observacion
      }
    })]
  }

  manejarNombresRepetidos(archivos: any[]): any[] {
    const contador: Record<string, number> = {};
    return archivos.map(archivo => {
      const { nombreDocumento, ...file_info} = archivo;
      if (contador[nombreDocumento] === undefined) {
        contador[nombreDocumento] = 1;
        return archivo;
      } else {
        contador[nombreDocumento]++;
        const nombreN = `${nombreDocumento} (${contador[nombreDocumento]})`;
        return { nombreDocumento: nombreN, ...file_info};
      }
    })
  }

  generarZip(nombreCarpeta: string) {
    return new Promise((resolve, reject) => {
      this.CarpetaPrincipal = nombreCarpeta != "" ? nombreCarpeta : this.CarpetaPrincipal;
      let zip = new JSZip();
      this.Archivos = this.manejarNombresRepetidos(this.Archivos);
      this.Archivos.forEach((archivo, index) => {
        let nombre = <string>archivo.nombreDocumento;
        let carpeta = <string>archivo.carpeta;
        nombre = nombre.replace(/[\<\>\:\"\|\?\*\/\.]/g,'');  
        //nombre = nombre.concat('.pdf');
        this.newNuxeoService.getByIdLocal(archivo.DocumentoId)
          .subscribe(file => {
        fetch(file.url)
          .then((res) => res.blob())
          .then((blob) => {
            zip.folder(this.CarpetaPrincipal)?.folder(carpeta)?.file(nombre+file.type, blob, {binary: true});
            if (index === this.Archivos.length - 1) {
              zip.generateAsync({type:"blob"})
                .then((content:any) => {
                  const file = new Blob([content], {type: 'application/zip'});
                  const url = URL.createObjectURL(file);
                  resolve(url);
                })
                .catch((error:any) => reject(error))
            }
          });
        }, error => {
          reject(error);
        })
          
      });
    });
  }
}
