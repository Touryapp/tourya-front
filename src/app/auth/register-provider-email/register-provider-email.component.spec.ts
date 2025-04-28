import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterProviderEmailComponent } from "./register-provider-email.component";

describe("RegisterProviderEmailComponent", () => {
  let component: RegisterProviderEmailComponent;
  let fixture: ComponentFixture<RegisterProviderEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterProviderEmailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterProviderEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
