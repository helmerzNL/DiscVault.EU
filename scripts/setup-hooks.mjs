import { execFileSync } from 'node:child_process';
import { chmodSync } from 'node:fs';

chmodSync('.githooks/pre-commit', 0o755);
execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
  stdio: 'inherit',
});
console.log('Git hooks enabled from .githooks');
