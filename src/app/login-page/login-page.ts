import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  company = '';
  rememberMe = false;

  // Forgot Password States
  forgotPasswordMode = false;
  resetSuccess = false; // NEW: Tracks if the email was successfully sent
  resetEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  login(): void {
    const credentials = {
      username: this.email,
      password: this.password,
      company: this.company,
    };

    this.authService.login(credentials).subscribe({
      next: (user) => {
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        if (!user.access_token) {
          alert('Login successful but access token was not received.');
          return;
        }

        localStorage.setItem('accessToken', user.access_token);
        if (user.refresh_token) {
          localStorage.setItem('refreshToken', user.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(user));

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login Error:', err);
        alert(err.error?.message || err.error?.error || 'Login failed');
      },
    });
  }

  // --- Forgot Password Methods ---
  toggleForgotPassword(): void {
    this.forgotPasswordMode = !this.forgotPasswordMode;
    this.resetSuccess = false; // Reset the success state if they toggle back and forth
  }

  submitForgotPassword(): void {
    if (!this.resetEmail) {
      alert('Please enter your email address.');
      return;
    }

    this.authService.forgotPassword(this.resetEmail).subscribe({
      next: (res) => {
        // REPLACED ALERT WITH CUSTOM UI TRIGGER
        this.resetSuccess = true;
      },
      error: (err) => {
        console.error('Reset Error:', err);
        alert(err.error?.message || 'Failed to send reset link.');
      }
    });
  }

  // NEW: Closes the success message and goes back to login
  closeResetSuccess(): void {
    this.resetSuccess = false;
    this.forgotPasswordMode = false;
    this.resetEmail = ''; // Clear the input
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}

