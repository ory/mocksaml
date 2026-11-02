import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { namespacePath, parseNamespace } from 'lib/namespace';

describe('namespace', () => {
  it('accepts a missing namespace', () => {
    assert.deepEqual(parseNamespace({}), { ok: true, namespace: undefined });
  });

  it('accepts slugs', () => {
    assert.deepEqual(parseNamespace({ namespace: 'acme_corp-1' }), { ok: true, namespace: 'acme_corp-1' });
  });

  it('rejects anything else', () => {
    for (const namespace of ['', 'a/b', 'a b', 'a"b', 'a\r\nb', '../x', ['a', 'b']]) {
      assert.deepEqual(parseNamespace({ namespace }), { ok: false }, JSON.stringify(namespace));
    }
  });

  it('builds the url prefix', () => {
    assert.equal(namespacePath(undefined), '');
    assert.equal(namespacePath('acme'), '/namespace/acme');
  });
});
