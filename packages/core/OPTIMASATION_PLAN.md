# ✅ OPTIMIZATION & ROADMAP PLAN FOR @alphaquant/core

## 1. Optimization Plan for Existing Modules

### Goal: Move optimized versions of critical functions to `core/math`

### Modules in `core/math`:

- math/normalizeTyped.js
- math/zscoreTyped.js
- math/rollingMeanTyped.js
- math/corrMatrixTyped.js
- math/utilsTyped.js (min/max, mean/std)

### Action Plan:

1. Create `core/math` directory
2. For each operation:
   - Implement version using `TypedArray` + `for` loop
   - Measure micro-benchmark (execution time + heapUsed)
   - Use fallback API in Preprocessing.js and StatsUtils.js
3. Move optimizations from Preprocessing.js and StatsUtils.js to `core/math` as thin wrappers
4. Update benchmark.js to include typed-version comparison
5. Add unit tests for typed functions (including edge cases)
6. Add perf guard tests: must not exceed N ms on 100k rows

### Optimization Guidelines (from CODING_GUIDELINES.md + ECMAScript Spec):

- Use `TypedArray` (`Float64Array`, `Int32Array`) to minimize allocations and GC
- Avoid `.map`, `.filter`, `.reduce` — use `for` instead
- Pre-allocate memory: `new Float64Array(n)`
- Vectorize without `.concat()` or `.push()`
- Merge loops: mean+std, min+max, etc.
- Avoid changing variable types during execution (for V8 optimization)
- Maintain data density — avoid `undefined` and sparse arrays
- Avoid boxing/unboxing (e.g., use numbers directly)
- Predefine data structures before computation

### Visualization Support (future):

- `benchmark.visual.js` — CLI time/memory charts (ascii-chart)
- `profile.memory.js` — heap snapshot via v8-profiler
- `perf.test.js` — fail test if time/memory limits exceeded

Should be added to RELEASE_CHECKLIST.md:

```md
## ✅ PERFORMANCE VALIDATION (before release)

- [ ] Run `benchmark.js` and compare to previous benchmark.json
- [ ] Run `benchmark.visual.js` and verify ASCII chart (should be flat or better)
- [ ] Run `profile.memory.js` and inspect heap snapshot
- [ ] Run `perf.test.js` — all tests must pass under time/memory limits
```

---

## 2. API Expansion Plan: Top 15 pandas Methods

| #   | Method            | Description              | Covered | Priority  | Status                     |
| --- | ----------------- | ------------------------ | ------- | --------- | -------------------------- |
| 1   | groupBy().agg()   | Grouping + aggregation   | ✅ Yes  | 🔥 High   | ✅ Exists, extendable      |
| 2   | pivot()           | Pivot table              | ✅ Yes  | 🔥 High   | ✅ Exists                  |
| 3   | melt()            | wide → long              | ✅ Yes  | 🔥 High   | ✅ Exists                  |
| 4   | map()             | Apply function to column | ✅ Yes  | 🔥 High   | ✅ `applyMap()`            |
| 5   | isin()            | Filter by set            | ❌ No   | 🔥 High   | ❌ To be implemented       |
| 6   | query()           | SQL-style filter         | ❌ No   | 🔥 High   | ❌ Needs expression parser |
| 7   | rank()            | Assign ranks             | ❌ No   | 🔥 High   | ❌ To be implemented       |
| 8   | sort_values()     | Sort by multiple columns | ✅ Yes  | ⚡ Medium | ✅ Exists via sort()       |
| 9   | fillna(method)    | ffill / bfill            | ❌ No   | ⚡ Medium | ❌ Extend `fillNaN`        |
| 10  | clip()            | Clamp values             | ❌ No   | ⚡ Medium | ❌ To be implemented       |
| 11  | explode()         | Array → rows             | ❌ No   | ⚡ Medium | ❌ To be implemented       |
| 12  | duplicated()      | Find duplicates          | ❌ No   | ⚡ Medium | ❌ To be implemented       |
| 13  | drop_duplicates() | Remove duplicates        | ❌ No   | ⚡ Medium | ❌ To be implemented       |
| 14  | apply(func, axis) | Row-wise function        | ❌ No   | ⚡ Medium | ❌ Expensive, can add      |
| 15  | sample()          | Random row sample        | ❌ No   | ⚡ Medium | ❌ To be implemented       |

### General Guidelines for New APIs:

- Each function in DataFrameUtils must:
  - Validate input types
  - Use optimized implementation (if available)
  - Include unit tests, including edge cases
  - Be compatible with both DataFrame and toArray()
  - Handle large datasets (100k+ rows) efficiently
  - Optionally support `TypedArray` for performance

---

## 3. Optimization Priorities

| Priority | Function      | Reason                            | Plan                                                  |
| -------- | ------------- | --------------------------------- | ----------------------------------------------------- |
| 🔥 1     | rollingMean() | Slowest + most memory intensive   | Vectorized sliding window on `Float64Array`           |
| 🔥 2     | normalize()   | High frequency, slow              | Single-pass implementation without copying            |
| 🔥 3     | zscore()      | High frequency, high load         | Single-pass mean+std → normalize                      |
| ⚠️ 4     | corrMatrix()  | High memory (77x pandas)          | Use Matrix API + typed buffers + intermediate caching |
| 🔍 5     | resample()    | 28x slower, groupBy is bottleneck | Use hash-based aggregation                            |
| ✅ 6     | dropNaN()     | Closest to pandas                 | Can improve using `row.every()`                       |

---

## 4. Next Steps

- [ ] ✅ Create `math/normalizeTyped.js`
- [ ] ✅ Create `math/zscoreTyped.js`
- [ ] 📊 Update `benchmark.js` with typed/vanilla comparison
- [ ] 📉 Add `benchmark.visual.js` — ASCII charts for perf
- [ ] 🧠 Add `profile.memory.js` — v8-profiler snapshot
- [ ] 🚦 Add `perf.test.js` — test guard for slow ops
- [ ] 📁 Refactor Preprocessing + StatsUtils → use `core/math`
- [ ] 🧪 Add tests for typed functions
- [ ] 🧩 Add `isin`, `rank`, `query` to DataFrameUtils
- [ ] 🗺️ Prepare `ROADMAP.md` with priorities and estimates
