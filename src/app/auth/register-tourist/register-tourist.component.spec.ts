import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterTouristComponent } from "./register-tourist.component";

describe("RegisterTouristComponent", () => {
  let component: RegisterTouristComponent;
  let fixture: ComponentFixture<RegisterTouristComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterTouristComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterTouristComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
