import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface UserProfile {
  company_id?: number;
  branch_id?: number;
  organization_id?: number;
  username?: string;
  company_name?: string;
  org_slug?: string;
  sub_package?: string;
  org_status?: string;
  email_verified?: boolean;
  trial_ends_at?: string;
  billing_cycle?: 'monthly' | 'annual';
  telephone?: string;
  city?: string;
  addressLine1?: string;
  [key: string]: any;
}

const PRICING = {
  Starter: { monthly: 'Rs 4,500', annual: 'Rs 3,750' },
  Growth: { monthly: 'Rs 9,500', annual: 'Rs 7,900' },
  Pro: { monthly: 'Rs 16,000', annual: 'Rs 13,300' },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardPage implements OnInit {
  user: UserProfile = {};
  originalUser: UserProfile = {};
  fullCompanyData: any = null;

  editMode = false;
  saving = false;
  billingCycle: 'monthly' | 'annual' = 'monthly';
  pricing = PRICING;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const data = localStorage.getItem('user');
    if (!data) {
      this.logout();
      return;
    }

    try {
      this.user = JSON.parse(data);

      // Fetch accurate Company profile data
      this.authService.getCompany().subscribe({
        next: (companyData) => {
          this.fullCompanyData = companyData;
          this.user.company_name = companyData.companyName;
          this.user.telephone = companyData.telephone;
          this.user.city = companyData.city;
          this.user.addressLine1 = companyData.addressLine1;
        },
        error: (err) => console.error('Failed to get company details:', err),
      });

      // Fetch accurate Subscription data
      this.authService.getSubscription().subscribe({
        next: (subData) => {
          this.user.sub_package = subData.subscription.plan_name;
          this.billingCycle = subData.subscription.billing_interval.toLowerCase() as
            'monthly' | 'annual';
          this.user.org_status = subData.status;
          this.user.trial_ends_at = subData.trial_ends_at;
          this.user.org_slug = subData.slug;
        },
        error: (err) => console.error('Failed to get subscription details:', err),
      });
    } catch {
      this.logout();
    }
  }

  editProfile(): void {
    this.originalUser = { ...this.user };
    this.editMode = true;
  }

  cancelEdit(): void {
    this.user = { ...this.originalUser };
    this.editMode = false;
    this.saving = false;
  }

  saveChanges(): void {
    if (!this.editMode || this.saving || !this.fullCompanyData) return;

    this.saving = true;

    // 1. Update company profile data
    this.fullCompanyData.companyName = this.user.company_name;
    this.fullCompanyData.telephone = this.user.telephone;
    this.fullCompanyData.city = this.user.city;
    this.fullCompanyData.addressLine1 = this.user.addressLine1;

    // 2. Build Plan Payload
    const planPayload = {
      planCode: this.user.sub_package ? this.user.sub_package.toUpperCase() : 'STARTER',
      billingInterval: this.billingCycle.toUpperCase(),
    };

    // 3. Prepare requests
    const saveCompanyReq = this.authService.saveCompany(this.fullCompanyData);
    const updatePlanReq = this.authService.updatePlan(planPayload, this.user.org_slug);

    // 4. Fire them concurrently using forkJoin
    forkJoin([saveCompanyReq, updatePlanReq]).subscribe({
      next: ([compRes, planRes]) => {
        console.log('Both Profile and Subscription saved successfully!');

        // Update local storage instantly
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...this.user }));

        this.originalUser = { ...this.user };
        this.editMode = false;
        this.saving = false; // Immediately unlocks the button
      },
      error: (err) => {
        console.error('API Error during save:', err);
        alert(err.error?.message || 'Failed to save changes to the server.');
        this.saving = false; // Unlocks the button even if it fails
      },
    });
  }

  selectPlan(plan: string): void {
    if (this.editMode) {
      this.user.sub_package = plan;
    }
  }

  planSelected(plan: string): boolean {
    return this.user.sub_package?.toUpperCase() === plan.toUpperCase();
  }

  getPrice(plan: 'Starter' | 'Growth' | 'Pro'): string {
    return this.pricing[plan][this.billingCycle];
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
