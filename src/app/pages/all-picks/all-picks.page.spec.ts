import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AllPicksPage } from './all-picks.page';

describe('AllPicksPage', () => {
  let component: AllPicksPage;
  let fixture: ComponentFixture<AllPicksPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllPicksPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AllPicksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
