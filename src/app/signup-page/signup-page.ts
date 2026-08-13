import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.css',
})
export class SignupPage {
  step = 1;
  passwordError = false;
  phoneError = false;
  textFieldError = false;

  // Step 1 Data
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Step 2 Data
  businessName = '';
  phone = '';
  city = '';
  country = 'Pakistan';
  businessType = 'Restaurant';

  // Step 3 Data
  billingCycle: 'monthly' | 'annual' = 'annual';
  selectedPlan: string = 'Growth';
  termsAccepted = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  isValidString(value: string): boolean {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value);
  }

  nextStep() {
    if (this.password !== this.confirmPassword) {
      this.passwordError = true;
      return;
    }
    this.passwordError = false;

    if (!this.isValidString(this.name)) {
      this.textFieldError = true;
      alert('Full Name must contain letters only.');
      return;
    }
    this.textFieldError = false;
    this.step = 2;
  }

  goToStep3() {
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(this.phone)) {
      this.phoneError = true;
      alert('Phone number must contain numbers only and be exactly 11 digits.');
      return;
    }
    this.phoneError = false;

    if (!this.isValidString(this.businessName) || !this.isValidString(this.city)) {
      alert('Business Name and City must contain only letters.');
      return;
    }
    this.step = 3;
  }

  previousStep() {
    this.step--;
  }

  signup() {
    if (!this.termsAccepted) {
      alert('Please accept the Terms & Conditions.');
      return;
    }

    const payload = {
      firstName: this.name,
      email: this.email,
      password: this.password,
      businessName: this.businessName,
      contact: this.phone,
      city: this.city,
      country: this.country,
      companyType: this.businessType,
      billingInterval: this.billingCycle === 'annual' ? 'ANNUAL' : 'MONTHLY',
      planCode: this.selectedPlan.toUpperCase(),
      termsAccepted: this.termsAccepted,
      timeZone: 'Asia/Karachi',
    };

    this.authService.signup(payload).subscribe({
      next: (response) => {
        alert('Signup Successful');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Signup Failed');
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/']);
  }
}
