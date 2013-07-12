
describe('When loading the default page', function () {
  beforeEach(function () {
    browser().navigateTo('/examples/index.html');
  });

  it('should have a select inside', function () {
    expect(element('select').count()).toBe(1);
  });
});
