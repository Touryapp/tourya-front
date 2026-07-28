import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterTouristEmailComponent } from "./register-tourist-email.component";

describe("RegisterTouristEmailComponent", () => {
  let component: RegisterTouristEmailComponent;
  let fixture: ComponentFixture<RegisterTouristEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterTouristEmailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterTouristEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
