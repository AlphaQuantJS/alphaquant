/**
 * createFrame.js - Core module for TinyFrame
 *
 * This module implements a lightweight DataFrame alternative to data-forge
 * with TypedArray support for better performance and memory efficiency.
 */

/**
 * @typedef {Object} TinyFrameOptions
 * @property {boolean} [useTypedArrays=true] - Use TypedArrays for numeric columns
 * @property {boolean} [saveRawData=true] - Save raw data alongside optimized data
 */

/**
 * @typedef {Object} TinyFrame
 * @property {Record<string, Array<any> | Float64Array>} columns - Column data
 * @property {Record<string, Array<any>>} rawColumns - Original column data before optimization
 * @property {number} rowCount - Number of rows
 * @property {string[]} columnNames - Names of columns
 */

/**
 * Creates a TinyFrame from various input formats
 *
 * @param {Object[]|Record<string, any[]|Float64Array>|TinyFrame} data - Input data
 * @param {number|TinyFrameOptions} [options] - Configuration options or row count if data is column-oriented
 * @returns {TinyFrame} - A new TinyFrame instance
 */
export function createFrame(data, options = {}) {
  // Normalize options
  /** @type {TinyFrameOptions} */
  let opts = {};
  /** @type {number|null} */
  let rowCount = null;

  if (typeof options === 'number') {
    rowCount = options;
    opts = { useTypedArrays: true, saveRawData: true };
  } else {
    opts = {
      useTypedArrays: options.useTypedArrays !== false,
      saveRawData: options.saveRawData !== false,
    };
    rowCount = null;
  }

  // Handle different input formats
  if (Array.isArray(data)) {
    // Row-oriented data (array of objects)
    return createFrameFromRows(data, opts);
  } else if (data && typeof data === 'object') {
    if ('columns' in data && 'rowCount' in data && 'columnNames' in data) {
      // Already a TinyFrame - creating a deep copy
      /** @type {Record<string, Array<any> | Float64Array>} */
      const columnData = {};

      // Create a copy of each column
      for (const columnName of data.columnNames) {
        const column = data.columns[columnName];

        if (column instanceof Float64Array) {
          // For Float64Array create a new array
          columnData[columnName] = new Float64Array(column);
        } else if (Array.isArray(column)) {
          // For regular arrays create a copy
          columnData[columnName] = [...column];
        }
      }

      return createFrameFromColumns(columnData, data.rowCount, opts);
    } else {
      // Column-oriented data (object with arrays)
      return createFrameFromColumns(data, rowCount, opts);
    }
  }

  throw new Error('Input data cannot be null or undefined');
}

/**
 * Creates a TinyFrame from row-oriented data
 *
 * @param {Object[]} rows - Array of row objects
 * @param {TinyFrameOptions} options - Configuration options
 * @returns {TinyFrame} - A new TinyFrame instance
 */
function createFrameFromRows(rows, options) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { columns: {}, rawColumns: {}, rowCount: 0, columnNames: [] };
  }

  // Extract column names from first row
  /** @type {string[]} */
  const columnNames = Object.keys(rows[0]);

  // Initialize columns
  /**
   * @type {Record<string, Array<any> | Float64Array>}
   */
  const columns = {};

  /**
   * @type {Record<string, Array<any>>}
   */
  const rawColumns = {}; // Save original data

  // Create arrays for each column
  for (const columnName of columnNames) {
    /** @type {any[]} */
    const columnValues = [];

    // Extract values for this column from all rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      columnValues.push(row[columnName]);
    }

    // Save raw values
    rawColumns[columnName] = [...columnValues];

    // Optimize numeric columns with TypedArrays if enabled
    if (options.useTypedArrays && isNumericArray(columnValues)) {
      const typedArray = new Float64Array(columnValues.length);
      for (let i = 0; i < columnValues.length; i++) {
        if (columnValues[i] === null) {
          // Convert null to 0 to match tests
          typedArray[i] = 0;
        } else if (
          columnValues[i] === undefined ||
          Number.isNaN(columnValues[i])
        ) {
          // Convert undefined and NaN to NaN
          typedArray[i] = NaN;
        } else {
          typedArray[i] = columnValues[i];
        }
      }
      columns[columnName] = typedArray;
    } else {
      columns[columnName] = columnValues;
    }
  }

  return {
    columns,
    rawColumns: options.saveRawData ? rawColumns : {},
    rowCount: rows.length,
    columnNames,
  };
}

/**
 * Creates a TinyFrame from column-oriented data
 *
 * @param {Record<string, any[]|Float64Array>} columnData - Column data
 * @param {number|null} rowCount - Number of rows (optional)
 * @param {TinyFrameOptions} options - Configuration options
 * @returns {TinyFrame} - A new TinyFrame instance
 */
function createFrameFromColumns(columnData, rowCount, options) {
  // Validate input
  if (!columnData || typeof columnData !== 'object') {
    return { columns: {}, rawColumns: {}, rowCount: 0, columnNames: [] };
  }

  /** @type {string[]} */
  const columnNames = Object.keys(columnData);
  if (columnNames.length === 0) {
    return { columns: {}, rawColumns: {}, rowCount: 0, columnNames: [] };
  }

  // Determine row count if not provided
  /** @type {number} */
  let actualRowCount;

  if (rowCount === null || rowCount === undefined) {
    // If rowCount is not specified, use the length of the first column
    const firstColumn = columnData[columnNames[0]];
    actualRowCount =
      Array.isArray(firstColumn) || firstColumn instanceof Float64Array
        ? firstColumn.length
        : 0;
  } else {
    // Otherwise use the specified value
    actualRowCount = rowCount;
  }

  /**
   * @type {Record<string, Array<any> | Float64Array>}
   */
  const columns = {};

  /**
   * @type {Record<string, Array<any>>}
   */
  const rawColumns = {}; // Save original data

  // Process each column
  for (const columnName of columnNames) {
    /** @type {any[]|Float64Array} */
    const columnValues = columnData[columnName];

    // Ensure column is an array
    if (
      !Array.isArray(columnValues) &&
      !(columnValues instanceof Float64Array)
    ) {
      throw new Error(`Column ${columnName} is not an array`);
    }

    // Ensure all columns have the same length
    if (columnValues.length !== actualRowCount) {
      throw new Error(
        `Column ${columnName} has length ${columnValues.length}, expected ${actualRowCount}`,
      );
    }

    // Save raw values
    rawColumns[columnName] = Array.isArray(columnValues)
      ? [...columnValues]
      : Array.from(columnValues);

    // Optimize numeric columns with TypedArrays if enabled
    if (options.useTypedArrays && isNumericArray(columnValues)) {
      if (columnValues instanceof Float64Array) {
        columns[columnName] = new Float64Array(columnValues); // Create a copy
      } else {
        const typedArray = new Float64Array(columnValues.length);
        for (let i = 0; i < columnValues.length; i++) {
          if (columnValues[i] === null) {
            // Convert null to 0 to match tests
            typedArray[i] = 0;
          } else if (
            columnValues[i] === undefined ||
            Number.isNaN(columnValues[i])
          ) {
            // Convert undefined and NaN to NaN
            typedArray[i] = NaN;
          } else {
            typedArray[i] = columnValues[i];
          }
        }
        columns[columnName] = typedArray;
      }
    } else {
      columns[columnName] = Array.isArray(columnValues)
        ? [...columnValues]
        : Array.from(columnValues);
    }
  }

  return {
    columns,
    rawColumns: options.saveRawData ? rawColumns : {},
    rowCount: actualRowCount,
    columnNames,
  };
}

/**
 * Checks if an array contains only numeric values (ignoring null/undefined/NaN)
 *
 * @param {Array<any> | Float64Array} arr - Array to check
 * @returns {boolean} - True if array contains only numeric values
 */
export function isNumericArray(arr) {
  if (!arr || arr.length === 0) {
    return false;
  }

  // Check if array is already a TypedArray
  if (arr instanceof Float64Array) {
    return true;
  }

  // Check if array contains only numeric values
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (
      val !== null &&
      val !== undefined &&
      !Number.isNaN(val) &&
      typeof val !== 'number'
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Converts a TinyFrame to an array of objects (row format)
 *
 * @param {TinyFrame} frame - TinyFrame to convert
 * @returns {Object[]} - Array of row objects
 */
export function toArray(frame) {
  if (!frame || !frame.columns || !frame.rowCount) {
    return [];
  }

  /** @type {Object[]} */
  const result = [];
  /** @type {string[]} */
  const columnNames = frame.columnNames || Object.keys(frame.columns);

  for (let i = 0; i < frame.rowCount; i++) {
    /** @type {Object} */
    const row = {};

    for (const columnName of columnNames) {
      if (frame.columns[columnName]) {
        row[columnName] = frame.columns[columnName][i];
      }
    }

    result.push(row);
  }

  return result;
}

/**
 * Gets column names from a TinyFrame
 *
 * @param {TinyFrame} frame - TinyFrame to get column names from
 * @returns {string[]} - Array of column names
 */
export function getColumnNames(frame) {
  if (!frame || !frame.columns) {
    return [];
  }

  return frame.columnNames || Object.keys(frame.columns);
}

/**
 * Gets a single column from a TinyFrame
 *
 * @param {TinyFrame} frame - TinyFrame to get column from
 * @param {string} columnName - Name of column to get
 * @returns {Array<any> | Float64Array} - Column data
 */
export function getColumn(frame, columnName) {
  validateColumn(frame, columnName);
  return frame.columns[columnName];
}

/**
 * Validates that a column exists in a TinyFrame
 *
 * @param {TinyFrame} frame - TinyFrame to validate
 * @param {string} columnName - Name of column to validate
 * @throws {Error} - If column doesn't exist
 */
export function validateColumn(frame, columnName) {
  if (!frame || !frame.columns) {
    throw new Error('Invalid TinyFrame');
  }

  if (!frame.columns[columnName]) {
    throw new Error(`Column '${columnName}' not found`);
  }
}
