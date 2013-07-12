
describe('When loading the default page', function () {
  beforeEach(function () {
    browser().navigateTo('/examples/index.html');
  });

  it('should have our selects inside', function () {
    // a couple of ways to make sure we got our greeting
    expect(element('#greeting').count()).toBe(1);
    expect(element('div #greeting').count()).toBe(1);

    // make sure we have 2 select boxes
    expect(element('select').count()).toBe(2);
  });

  it('should find the correct default values', function () {
    // make sure that the value set for the first select in our controller
    // matches what the select is set to.
    expect(element('select:eq(0) option:selected').count()).toBe(1);
    expect(element('select:eq(0) option:selected').val()).toBe('35');
    expect(binding('blarg.selectedState')).toBe('OH');

    // our second select should not have a value selected
    expect(element('select:eq(1) options:selected').count()).toBe(0);
  });

  it('should change the selected option when we use the select', function () {
    select('blarg2.selectedState').option('4');
    expect(element('#selectTest2 option:selected').count()).toBe(1);
    expect(element('#selectTest2 option:selected').val()).toBe('4');

    // need to figure out why this works in the previous test but not here.
    //expect(binding('blarg2.selectedState')).toBe('CA');
  });
});
