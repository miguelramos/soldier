import { Suite } from 'benchmark';



describe(' > Job', () => {
  beforeEach(() => {
    const suite = new Suite('JOB_SUITE', {
      async: true
    });
  })

  it('Fake', () => {
    expect(true).toBeTruthy();
  });
});