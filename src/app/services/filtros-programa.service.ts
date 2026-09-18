import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProyectoAcademicoService } from './proyecto_academico.service';
import { OikosService } from './oikos.service';
import { ImplicitAutenticationService } from './implicit_autentication.service';
import { UserService } from './users.service';
import { SgaAdmisionesMid } from './sga_admisiones_mid.service';
import { DependenciasVinculacionTercero } from '../models/admision/dependencia_vinculacion_tercero';
import { RespFormat } from '../models/respuesta/response-format';
import { OpcionPrograma } from '../models/proyecto_academico/filtros-programa.models';

export function idAcademico(valor: any): number {
  return Number(valor?.Id ?? valor ?? 0);
}

export function nivelPrograma(programa: any): any {
  let nivel = programa.NivelFormacionId;
  const visitados = new Set<number>();
  while (nivel?.NivelFormacionPadreId && !visitados.has(idAcademico(nivel))) {
    visitados.add(idAcademico(nivel));
    nivel = nivel.NivelFormacionPadreId;
  }
  return nivel;
}

export function esAdministradorProgramas(roles: unknown): boolean {
  const globales = ['ADMIN_SGA', 'VICERRECTOR', 'ASESOR_VICE', 'ADMISIONES_REG'];
  return Array.isArray(roles) && roles.some(rol =>
    globales.includes(String(rol).split('/').pop()!.trim().toUpperCase()));
}

@Injectable({ providedIn: 'root' })
export class FiltrosProgramaService {
  constructor(
    private proyectos: ProyectoAcademicoService,
    private oikos: OikosService,
    private auth: ImplicitAutenticationService,
    private usuarios: UserService,
    private admisiones: SgaAdmisionesMid,
  ) {}

  async cargar(): Promise<{ programas: any[]; facultades: OpcionPrograma[] }> {
    const roles = await this.auth.getRole();
    const respuesta = await firstValueFrom(this.proyectos.get('proyecto_academico_institucion?query=Activo:true&limit=0'));
    let programas = this.lista(respuesta).filter(p => idAcademico(p) > 0 && idAcademico(p.FacultadId) > 0);
    if (!esAdministradorProgramas(roles)) {
      const tercero = await this.usuarios.getPersonaId();
      if (!tercero) {
        programas = [];
      } else {
        const vinculaciones = await firstValueFrom(this.admisiones.get<RespFormat<DependenciasVinculacionTercero>>(
          'admision/dependencia_vinculacion_tercero/' + tercero));
        const dependencias = new Set((vinculaciones?.Data?.DependenciaId || []).map(Number));
        programas = programas.filter(p => dependencias.has(idAcademico(p.DependenciaId)));
      }
    }
    const ids = [...new Set(programas.map(p => idAcademico(p.FacultadId)))];
    const facultades = await Promise.all(ids.map(async Id => {
      const respuesta: any = await firstValueFrom(this.oikos.get('dependencia/' + Id));
      return { Id, Nombre: (respuesta?.Data || respuesta).Nombre };
    }));
    return {
      programas: programas.sort((a, b) => a.Nombre.localeCompare(b.Nombre)),
      facultades: facultades.sort((a, b) => a.Nombre.localeCompare(b.Nombre)),
    };
  }

  private lista(respuesta: any): any[] {
    return Array.isArray(respuesta) ? respuesta : Array.isArray(respuesta?.Data) ? respuesta.Data : [];
  }
}
