import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TourScheduleTestComponent } from "./tour-schedule-test.component";

describe("TourScheduleTestComponent", () => {
  let component: TourScheduleTestComponent;
  let fixture: ComponentFixture<TourScheduleTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourScheduleTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TourScheduleTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
