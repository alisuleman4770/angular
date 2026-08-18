import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { SignupPage } from './signup-page/signup-page';
import { DashboardPage } from './dashboard/dashboard';
import { Orders } from './orders/orders';
import { Pos } from './pos/pos';


export const routes: Routes = [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: 'signup',
    component: SignupPage,
  },

  { path: 'dashboard',
    component: DashboardPage },

     {
    path: 'orders',
    component: Orders
  },

  {
  path: 'pos',
  component: Pos
  }


];
