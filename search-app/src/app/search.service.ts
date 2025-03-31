import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

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

  constructor() { }

  search(query: string): Observable<SearchResult[]> {
    // Simulate network delay
    return of(this.filterResults(query)).pipe(
      delay(500)
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
