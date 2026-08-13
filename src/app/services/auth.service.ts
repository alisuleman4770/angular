import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private signupUrl = 'https://app.plusonehq.com/handi-ear/api/signup';
  private loginUrl = 'https://app.plusonehq.com/handi-ear/api/v2/auth/login';
  private companyUrl = 'https://app.plusonehq.com/handi-ear/api/company/save';
  private getCompanyUrl = 'https://app.plusonehq.com/handi-ear/api/company/get-company/';
  private subscriptionUrl = 'https://app.plusonehq.com/handi-ear/api/org/subscription';
  private forgotPasswordUrl = 'https://app.plusonehq.com/handi-ear/api/signup/forgot-password';
  private updatePlanUrl = 'https://app.plusonehq.com/handi-ear/api/org/plan';

  constructor(private http: HttpClient) {}

  signup(data: any): Observable<any> {
    return this.http.post<any>(this.signupUrl, data);
  }

  login(credentials: { username: string; password: string; company?: string }): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(this.forgotPasswordUrl, { email });
  }

  getCompany(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(this.getCompanyUrl, { headers });
  }

  saveCompany(data: any): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.companyUrl, data, { headers });
  }

  getSubscription(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(this.subscriptionUrl, { headers });
  }

  updatePlan(data: { planCode: string; billingInterval: string }, slug?: string): Observable<any> {
    const token = localStorage.getItem('accessToken');
    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    if (slug) {
      headers = headers.set('X-Org-Slug', slug);
    }

    return this.http.post<any>(this.updatePlanUrl, data, { headers });
  }
}
