import { NotNumberPipe } from './not-number.pipe';

describe('NotNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NotNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
