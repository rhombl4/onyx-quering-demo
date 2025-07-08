import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenDemoComponent } from './token-demo.component';

describe('TokenDemoComponent', () => {
  let component: TokenDemoComponent;
  let fixture: ComponentFixture<TokenDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenDemoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TokenDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
