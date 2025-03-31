import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Use a BehaviorSubject to track token state changes
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  // Storage key for the token
  private readonly TOKEN_KEY = 'auth_token';
  
  constructor() {
    // Initialize token from storage on service creation
    this.loadTokenFromStorage();
  }

  /**
   * Store token securely and update the token subject
   * @param token The API token to store
   */
  setToken(token: string): void {
    if (!token) {
      return;
    }
    
    try {
      // Store in sessionStorage (cleared when browser tab is closed)
      // For more persistent storage, use localStorage instead
      sessionStorage.setItem(this.TOKEN_KEY, this.encryptToken(token));
      this.tokenSubject.next(token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get the current token
   * @returns The current token or null if not set
   */
  getToken(): string | null {
    try {
      const encryptedToken = sessionStorage.getItem(this.TOKEN_KEY);
      if (!encryptedToken) {
        return null;
      }
      return this.decryptToken(encryptedToken);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Get an observable of the token for components to subscribe to
   * @returns Observable of the token
   */
  getTokenObservable(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Remove the token from storage and update the token subject
   */
  removeToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      this.tokenSubject.next(null);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Check if a token exists and is valid
   * @returns True if token exists
   */
  isTokenValid(): boolean {
    return !!this.getToken();
    // In a real app, you might also check token expiration here
  }

  /**
   * Load token from storage on service initialization
   */
  private loadTokenFromStorage(): void {
    const token = this.getToken();
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  /**
   * Simple token encryption (for demo purposes)
   * In production, use a more robust encryption method
   */
  private encryptToken(token: string): string {
    // This is a very basic obfuscation - not true encryption
    // For real applications, consider using a dedicated encryption library
    return btoa(token);
  }

  /**
   * Simple token decryption (for demo purposes)
   * In production, use a more robust decryption method
   */
  private decryptToken(encryptedToken: string): string {
    // This is a very basic de-obfuscation - not true decryption
    // For real applications, consider using a dedicated encryption library
    return atob(encryptedToken);
  }
}
