# JSON Summary Newman Reporter

This generates a very cut down version of the standard JSON reporter output.
It is needed where large test packs which generate 1000's of tests results can blow the limits of JSON.Stringify

This outputs:

- `Collection.Info.Name`
- `Collection.Info.Id`
- `Run.Stats.Requests.*`
- `Run.Stats.Assertions.*`
- `Run.Timings.*`
- `Run.Failures[n].Parent.Name`
- `Run.Failures[n].Parent.Id`
- `Run.Failures[n].Source.Name`
- `Run.Failures[n].Source.Id`
- `Run.Failures[n].Error.Message`
- `Run.Failures[n].Error.Test`

---

Usage:
> newman run *collection* -r **json-summary** --**reporter-summary-json-export** *output*

*Note: If reporter-json-summary-export parameter is not supplied, the output is written to a "newman" sub-folder and the file will contain the timestamp in its name*

---
Schema of the output JSON:
https://raw.githubusercontent.com/spenceclark/newman-reporter-json-summary/master/schema.json

---

Based on the https://www.npmjs.com/package/newman-reporter-json-light package, but slimmed down further.
