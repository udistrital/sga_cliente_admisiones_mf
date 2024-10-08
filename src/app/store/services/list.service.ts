import { Injectable } from "@angular/core";
import { IAppState } from "../app.state";
import { Store } from "@ngrx/store";
import { REDUCER_LIST } from "../reducer.constants";
import { TercerosService } from "src/app/services/terceros.service";

@Injectable()
export class ListService {
  constructor(
    private tercerosService: TercerosService,
    private store: Store<IAppState>
  ) {}

  loading: boolean = false;

  public findInfoContacto() {
    this.store.select(<any>REDUCER_LIST.InfoContacto).subscribe((list: any) => {
      if (!list || list.length === 0) {
        this.tercerosService
          .get(
            "info_complementaria/?query=GrupoInfoComplementariaId.Id:10,Activo:true&limit=0"
          )
          .subscribe(
            (result: any) => {
              this.addList(REDUCER_LIST.InfoContacto, result);
            },
            (error) => {
              this.addList(REDUCER_LIST.InfoContacto, []);
            }
          );
      }
    });
  }

  private addList(type: string, object: Array<any>) {
    this.store.dispatch({
      type: type,
      payload: object,
    });
  }
}
