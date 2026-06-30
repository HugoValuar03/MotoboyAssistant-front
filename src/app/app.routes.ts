import { Routes } from '@angular/router';
import { RideList } from './features/rides/pages/ride-list/ride-list';
import { RideForm } from './features/rides/pages/ride-form/ride-form';

export const routes: Routes = [
    {
        path: 'corridas',
        component: RideList
    },
    {
        path: 'corridas/form',
        component: RideForm
    },
    {
        path: '',
        redirectTo: 'corridas',
        pathMatch: 'full'
    }
];
