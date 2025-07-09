import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingToursComponent } from './booking-tours.component';

describe('BookingToursComponent', () => {
  let component: BookingToursComponent;
  let fixture: ComponentFixture<BookingToursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingToursComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingToursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 