import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService } from '../services/users.service';

@Directive({
    selector: '[isGranted]'
})
export class IsGrantedDirective {
    @Input() set isGranted(roles: string[]) {
        this.checkAuthorization(roles);
    }

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private userService: UserService
    ) {}

    private async checkAuthorization(roles: string[]) {
        try {
            // Verificar si el servicio de usuario tiene los roles necesarios
            const esAutorizado = await this.userService.esAutorizado(roles);
            if (esAutorizado) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            } else {
                this.viewContainer.clear();
            }
        } catch (error) {
            console.error('Error verificando roles:', error);
            this.viewContainer.clear();
        }
    }
}