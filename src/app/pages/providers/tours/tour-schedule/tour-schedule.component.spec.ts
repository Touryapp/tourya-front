import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TourScheduleComponent } from "./tour-schedule.component";

describe("TourScheduleComponent", () => {
  let component: TourScheduleComponent;
  let fixture: ComponentFixture<TourScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TourScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
