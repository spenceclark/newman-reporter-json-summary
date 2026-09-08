/*
    JSON Reporter that reports just the Summary Info
    Collection.Info.Name
    Collection.Info.Id
    Run.Stats.Requests.*
    Run.Stats.Assertions.*
    Run.Timings.*
    Run.Failures[n].Parent.Name
    Run.Failures[n].Parent.Id
    Run.Failures[n].Source.Name
    Run.Failures[n].Source.Id
    Run.Failures[n].Error.Message
    Run.Failures[n].Error.Test
 */

function createSummary(summary) {
    // Just pull out the minimum parts for each failure.
    // parent/source can be undefined for failures in pre-request scripts (#12).
    var failures = (summary.run.failures || []).map(function(failure) {
        return {
            'Parent': {
                'Name': failure.parent?.name,
                'Id': failure.parent?.id
            },
            'Source': {
                'Name': failure.source?.name,
                'Id': failure.source?.id
            },
            'Error': {
                'Message': failure.error?.message,
                'Test': failure.error?.test
            }
        };
    });

    return {
        'Collection': {
            'Info': {
                'Name': summary.collection.name,
                'Id': summary.collection.id
            }
        },
        'Run': {
            'Stats': {
                'Requests': summary.run.stats.requests,
                'Assertions': summary.run.stats.assertions
            },
            'Failures': failures,
            'Timings': summary.run.timings
        }
    };
}

module.exports = function(newman, options) {
    newman.on('beforeDone', function(err, data) {
        if (err) { return; }

        newman.exports.push({
            name: 'newman-reporter-json-summary',
            default: 'summary.json',
            path: options.summaryJsonExport,
            // Trailing newline so line-oriented consumers (e.g. Filebeat) pick the file up (#8)
            content: JSON.stringify(createSummary(data.summary)) + '\n'
        });
    });
};

module.exports.createSummary = createSummary;
