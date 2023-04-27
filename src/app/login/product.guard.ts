import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


// https://medium.com/@ryanchenkie_40935/angular-authentication-using-route-guards-bf7a4ca13ae3

@Injectable({ providedIn: 'root' })
export class LegalMarkerGuard implements CanActivate {

    constructor(
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //EmitterService.broadcastCommand(this, 'IsLegalMarker');
        return true;
    }
}

@Injectable({ providedIn: 'root' })
export class LegalPadGuard implements CanActivate {

    constructor(
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //EmitterService.broadcastCommand(this, 'isLegalPad');
        return true;
    }
}
