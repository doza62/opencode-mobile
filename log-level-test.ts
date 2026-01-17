import * as fs from 'fs';
import * as path from 'path';

const LOG_TEST_FILE = path.join(process.env.HOME || '', '.config/opencode', 'log-level-test.json');

function clearTestResults() {
  if (fs.existsSync(LOG_TEST_FILE)) {
    fs.unlinkSync(LOG_TEST_FILE);
  }
}

function writeTestResult(logLevel: string, message: string) {
  const results: Record<string, string[]> = {};
  
  if (fs.existsSync(LOG_TEST_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(LOG_TEST_FILE, 'utf-8'));
      if (typeof existing === 'object' && existing !== null) {
        Object.assign(results, existing);
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  if (!results[logLevel]) {
    results[logLevel] = [];
  }
  results[logLevel].push(message);
  
  fs.writeFileSync(LOG_TEST_FILE, JSON.stringify(results, null, 2));
}

console.log('[TEST] Testing different log levels...');
console.log('[TEST] Log level test file:', LOG_TEST_FILE);

clearTestResults();

console.log('[TEST-INFO] This is an INFO message via console.log');
writeTestResult('INFO', 'console.log message');

console.error('[TEST-ERROR] This is an ERROR message via console.error');
writeTestResult('ERROR', 'console.error message');

console.warn('[TEST-WARN] This is a WARN message via console.warn');
writeTestResult('WARN', 'console.warn message');

console.debug('[TEST-DEBUG] This is a DEBUG message via console.debug');
writeTestResult('DEBUG', 'console.debug message');

function logInfo(message: string) {
  console.log(`[TEST-INFO-CUSTOM] ${message}`);
  writeTestResult('INFO', message);
}

function logDebug(message: string) {
  console.debug(`[TEST-DEBUG-CUSTOM] ${message}`);
  writeTestResult('DEBUG', message);
}

function logWarn(message: string) {
  console.warn(`[TEST-WARN-CUSTOM] ${message}`);
  writeTestResult('WARN', message);
}

function logError(message: string) {
  console.error(`[TEST-ERROR-CUSTOM] ${message}`);
  writeTestResult('ERROR', message);
}

logInfo('Custom INFO message');
logDebug('Custom DEBUG message');
logWarn('Custom WARN message');
logError('Custom ERROR message');

console.log('[TEST] Log level testing complete!');
console.log('[TEST] Test results written to:', LOG_TEST_FILE);
console.log('[TEST] To test different log levels, run:');
console.log('  opencode serve --log-level DEBUG');
console.log('  opencode serve --log-level INFO'); 
console.log('  opencode serve --log-level WARN');
console.log('  opencode serve --log-level ERROR');