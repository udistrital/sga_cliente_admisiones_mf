 
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';

 
 
@Injectable({
    providedIn: 'root',
})
 
export class ImplicitAutenticationService {
    environment = environment.TOKEN;
    logoutUrl: any;
    params: any;
    payload: any;
    timeActiveAlert: number = 4000;
    isLogin = false;
 
    private userSubject = new BehaviorSubject({});
    public user$ = this.userSubject.asObservable();
 
    private menuSubject = new BehaviorSubject({});
    public menu$ = this.menuSubject.asObservable();
 
    private logoutSubject = new BehaviorSubject('');
    public logout$ = this.logoutSubject.asObservable();
 
    constructor(){
        const user:any = localStorage.getItem('user');
        this.userSubject.next(JSON.parse(atob(user)));
    }
 
    public getPayload(): any {
        const idToken = window.localStorage.getItem('id_token')?.split('.');
        const payload = idToken!=undefined?JSON.parse(atob(idToken[1])):null;
        return payload;
    }
 
    public getRole() {
        const rolePromise = new Promise((resolve, reject) => {
            this.user$.subscribe((data: any) => {
                const { user, userService } = data;
                const roleUser = typeof user.user.role !== 'undefined' ? user.user.role : [];
                const roleUserService = typeof userService.userService.role !== 'undefined' ? userService.userService.role : [];
                const roles = (roleUser.concat(roleUserService)).filter((data: any) => (data.indexOf('/') === -1));
                resolve(roles);
            });
        });
        return rolePromise;
    }
 
    public getMail() {
        const rolePromise = new Promise((resolve, reject) => {
            this.user$.subscribe((data: any) => {
                const { userService } = data;
                resolve(userService.email);
            });
        });
        return rolePromise;
    }
 
    public getDocument() {
        const rolePromise = new Promise((resolve, reject) => {
            this.user$.subscribe((data: any) => {
                const { userService } = data;
                resolve(userService.documento);
            });
        });
        return rolePromise;
    }

    public logout(action:any): void {
        const state = localStorage.getItem('state');
        const idToken = localStorage.getItem('id_token');
        if (!!state && !!idToken) {
            this.logoutUrl = this.environment.SIGN_OUT_URL;
            this.logoutUrl += '?id_token_hint=' + idToken;
            this.logoutUrl += '&post_logout_redirect_uri=' + this.environment.SIGN_OUT_REDIRECT_URL;
            this.logoutUrl += '&state=' + state;
            this.clearStorage();
            this.logoutSubject.next(action);
            window.location.replace(this.logoutUrl);
        }
    }

    public clearStorage() {
        this.isLogin = false;
        window.localStorage.clear();
        window.sessionStorage.clear();
    }
}