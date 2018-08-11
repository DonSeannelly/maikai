const test = require('blue-tape');
const fakepromise = require('fakepromise');

const healthcheck  = require('../../lib/health');

test ('HealthCheck.worstStatus()', async t=> {
  const check = healthcheck();
  let one, two;

  one = 'pass', two = 'warn';
  t.equal(check.worstStatus (one, two), 'warn', `${one}, ${two}`);
  
  one = 'pass', two = 'fail';
  t.equal(check.worstStatus (one, two), 'fail', `${one}, ${two}`);
  
  one = 'pass', two = 'pass';
  t.equal(check.worstStatus (one, two), 'pass', `${one}, ${two}`);
  
  one = 'warn', two = 'pass';
  t.equal(check.worstStatus (one, two), 'warn', `${one}, ${two}`);
  
  one = 'warn', two = 'fail';
  t.equal(check.worstStatus (one, two), 'fail', `${one}, ${two}`);
  
  one = 'warn', two = 'warn';
  t.equal(check.worstStatus (one, two), 'warn', `${one}, ${two}`);

  one = 'fail', two = 'pass';
  t.equal(check.worstStatus (one, two), 'fail', `${one}, ${two}`);
  
  one = 'fail', two = 'warn';
  t.equal(check.worstStatus (one, two), 'fail', `${one}, ${two}`);
  
  one = 'fail', two = 'fail';
  t.equal(check.worstStatus (one, two), 'fail', `${one}, ${two}`);

});

test('HealthCheck.addCheck()', async t => {

  const check = healthcheck();
  check.addCheck('component1', 'metric1', async () => {
    const status = {
        status : 'pass',
    };
    return fakepromise.promise(50, status);
  });
  t.ok(true, "Calling addCheck() with an async function is fine");

  check.addCheck('component-p', 'metric-p', 
    fakepromise.promise(20, {status: 'pass'})
  );
  t.ok(true, "Calling addCheck() with an unresolved promise is also fine");

  const testName1 = 'Calling different addCheck() multiple times is fine';
  try {
    check.addCheck('component2', 'metric2', async () => {
      const status = {
          status : 'pass',
      };
      
      return fakepromise.promise(50, status);
    });  
  } catch (err) {
    t.comment(err);
    t.fail(testName1);
  }
  t.ok(true, testName1);

  const testName2 = 'Calling identical addCheck() multiple times not allowed';
  const expectedErr2 = /Calling identical addCheck/i;
  try {
    check.addCheck('component1', 'metric1', async () => {
      const status = {
          status : 'pass',
      };
      
      return fakepromise.promise(50, status);
    });
    t.fail(testName2);
  } catch (err) {
    t.ok(expectedErr2.test(err.toString()), testName2);
  }

  const testName3 = 'Calling addCheck with callback that is neither async or a promise object errors-out';
  const expectedErr3 = /.*Callback for .*? must be a promise or an async function/i;
  try {
    check.addCheck('component-obj', 'metric-obj', {something: 'else'});
    t.fail(testName3);
  } catch (err) {
    t.ok(expectedErr3.test(err.toString()), testName3);
  }
  
});
