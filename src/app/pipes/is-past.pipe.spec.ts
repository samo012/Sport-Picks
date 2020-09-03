import { IsPastPipe } from './is-past.pipe';

describe('IsPastPipe', () => {
  it('create an instance', () => {
    const pipe = new IsPastPipe();
    expect(pipe).toBeTruthy();
  });
});
