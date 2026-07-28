import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogsiteComponent } from './blogsite.component';

describe('BlogsiteComponent', () => {
  let component: BlogsiteComponent;
  let fixture: ComponentFixture<BlogsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlogsiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
