import { Routes } from '@angular/router';
import { RideList } from './features/rides/pages/ride-list/ride-list';

export const routes: Routes = [
    {
        path: 'corridas',
        component: RideList
    },
    {
        path: '',
        redirectTo: 'corridas',
        pathMatch: 'full'
    }
];
