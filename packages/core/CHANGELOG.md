# @alphaquant/core - CHANGELOG

## 1.0.0 (unreleased)

### 🚀 Features

- Implemented `AQDataFrame` factory-based API
- Added preprocessing functions: `normalize`, `zscore`, `dropNaN`, `resample`
- Added statistical functions: `mean`, `std`, `rollingMean`, `corrMatrix`
- Functional, modular architecture with memory-efficient optimizations
- Full test coverage for `StatsUtils` and `Preprocessing`

### ⚡️ Performance

- Single-pass computation for mean/std
- Early exit on validation failures
- Preallocated arrays and avoidance of closures for large loops
