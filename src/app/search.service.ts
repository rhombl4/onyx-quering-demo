import { Injectable } from '@angular/core';
import { Observable, of, delay, catchError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from './auth/token.service';

export interface SearchResult {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private mockResults: SearchResult[] = [
    {
      id: 1,
      title: 'Angular Development',
      description: 'Learn about Angular framework and its features',
      imageUrl: 'https://angular.io/assets/images/logos/angular/angular.svg'
    },
    {
      id: 2,
      title: 'React Development',
      description: 'Explore React library and component-based architecture',
      imageUrl: 'https://reactjs.org/logo-og.png'
    },
    {
      id: 3,
      title: 'Vue.js Development',
      description: 'Discover Vue.js progressive JavaScript framework',
      imageUrl: 'https://vuejs.org/images/logo.png'
    },
    {
      id: 4,
      title: 'Node.js Backend',
      description: 'Build scalable server-side applications with Node.js',
      imageUrl: 'https://nodejs.org/static/images/logo.svg'
    },
    {
      id: 5,
      title: 'Python Programming',
      description: 'Learn Python for web development, data science, and more',
      imageUrl: 'https://www.python.org/static/community_logos/python-logo.png'
    }
  ];

  // In a real app, this would come from environment config
  private apiUrl = 'https://api.example.com';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  /**
   * Search for results using the API with authentication
   * @param query Search query string
   * @returns Observable of search results
   */
  search(query: string): Observable<SearchResult[]> {
    // For demo purposes, we're using mock data
    // In a real application, you would make an API call with the token
    
    // This demonstrates how the API call would be structured:
    /*
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return of([]);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<SearchResult[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching search results:', error);
          return of([]);
        })
      );
    */

    // Using mock data for now
    return of(this.filterResults(query)).pipe(
      delay(500)
    );
  }

  /**
   * Example of how to make an authenticated API call
   * @param endpoint API endpoint
   * @returns Observable of API response
   */
  private makeAuthenticatedRequest<T>(endpoint: string): Observable<T> {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return of({} as T);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Error calling API endpoint ${endpoint}:`, error);
          return of({} as T);
        })
      );
  }

  private filterResults(query: string): SearchResult[] {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const lowercaseQuery = query.toLowerCase();
    return this.mockResults.filter(result => 
      result.title.toLowerCase().includes(lowercaseQuery) || 
      result.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}
