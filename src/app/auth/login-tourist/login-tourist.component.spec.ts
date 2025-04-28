import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginTouristComponent } from "./login-tourist.component";

describe("LoginTouristComponent", () => {
  let component: LoginTouristComponent;
  let fixture: ComponentFixture<LoginTouristComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginTouristComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginTouristComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
