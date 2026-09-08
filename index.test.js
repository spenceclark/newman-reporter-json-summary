const { test } = require('node:test');
const assert = require('node:assert');
const reporter = require('./index.js');

const summary = {
    collection: { name: 'My Collection', id: 'col-1' },
    run: {
        stats: { requests: { total: 2, failed: 1 }, assertions: { total: 3, failed: 1 } },
        timings: { started: 1, completed: 2 },
        failures: [
            {
                parent: { name: 'Folder', id: 'f-1' },
                source: { name: 'Request', id: 'r-1' },
                error: { message: 'expected 200', test: 'status is 200' }
            },
            // Failure in a pre-request script: parent is undefined (#12)
            {
                parent: undefined,
                source: { name: 'Request', id: 'r-2' },
                error: { message: 'getaddrinfo ENOTFOUND' }
            }
        ]
    }
};

test('createSummary slims the summary and survives missing parent', () => {
    const result = reporter.createSummary(summary);
    assert.deepStrictEqual(result.Collection, { Info: { Name: 'My Collection', Id: 'col-1' } });
    assert.deepStrictEqual(result.Run.Stats, { Requests: summary.run.stats.requests, Assertions: summary.run.stats.assertions });
    assert.deepStrictEqual(result.Run.Timings, summary.run.timings);
    assert.deepStrictEqual(result.Run.Failures[0], {
        Parent: { Name: 'Folder', Id: 'f-1' },
        Source: { Name: 'Request', Id: 'r-1' },
        Error: { Message: 'expected 200', Test: 'status is 200' }
    });
    assert.deepStrictEqual(result.Run.Failures[1].Parent, { Name: undefined, Id: undefined });
    assert.strictEqual(result.Run.Failures[1].Error.Message, 'getaddrinfo ENOTFOUND');
});

test('reporter pushes an export ending in a newline (#8)', () => {
    const exports = [];
    const handlers = {};
    const newman = { exports, on: (evt, fn) => { handlers[evt] = fn; } };

    reporter(newman, { summaryJsonExport: 'out.json' });
    handlers.beforeDone(null, { summary });

    assert.strictEqual(exports.length, 1);
    assert.strictEqual(exports[0].path, 'out.json');
    assert.strictEqual(exports[0].default, 'summary.json');
    assert.ok(exports[0].content.endsWith('}\n'));
    assert.strictEqual(JSON.parse(exports[0].content).Collection.Info.Name, 'My Collection');
});
