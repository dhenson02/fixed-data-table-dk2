/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableWidthHelper
 * @typechecks
 */

'use strict';

var React = require('React');

function getTotalWidth(/*Array*/ columns) /*number*/ {
  var totalWidth = 0;
  var columnCount = columns.length;
  var i = 0;
  for (; i < columnCount; ++i) {
    totalWidth += columns[i].props.width;
  }
  return totalWidth;
}

function getTotalFlexGrow(/*Array*/ columns) /*number*/ {
  var totalFlexGrow = 0;
  var columnCount = columns.length;
  var i = 0;
  for (; i < columnCount; ++i) {
    totalFlexGrow += columns[i].props.flexGrow || 0;
  }
  return totalFlexGrow;
}

function distributeFlexWidth(
  /*Array*/ columns,
  /*number*/ flexWidth
) /*Object*/ {
  if (flexWidth < 1) {
    return {
      columns: columns,
      width: getTotalWidth(columns),
    };
  }
  var remainingFlexGrow = getTotalFlexGrow(columns);
  var remainingFlexWidth = flexWidth;
  var newColumns = [];
  var totalWidth = 0;
  var columnCount = columns.length;
  var i = 0;
  for (; i < columnCount; ++i) {
    var column = columns[i];
    if (!column.props.flexGrow) {
      totalWidth += column.props.width;
      newColumns.push(column);
      continue;
    }
    var columnFlexWidth = Math.floor(
      column.props.flexGrow / remainingFlexGrow * remainingFlexWidth
    );
    var newColumnWidth = Math.floor(column.props.width + columnFlexWidth);
    totalWidth += newColumnWidth;

    remainingFlexGrow -= column.props.flexGrow;
    remainingFlexWidth -= columnFlexWidth;

    newColumns.push(React.cloneElement(
      column,
      {width: newColumnWidth}
    ));
  }

  return {
    columns: newColumns,
    width: totalWidth,
  };
}

function adjustColumnGroupWidths(
  /*Array*/ columnGroups,
  /*number*/ expectedWidth
) /*Object*/ {
  var allColumns = [];
  var addColumn = column => {
      allColumns[ allColumns.length ] = column;
  };
  var columnGroupCount = columnGroups.length;
  var i = 0;
  var j = 0;

  for (; i < columnGroupCount; ++i) {
    React.Children.forEach(
      columnGroups[i].props.children,
      addColumn
    );
  }
  var columnsWidth = getTotalWidth(allColumns);
  var remainingFlexGrow = getTotalFlexGrow(allColumns);
  var potentialFlexWidth = expectedWidth - columnsWidth;
  var remainingFlexWidth = potentialFlexWidth > 0 ?
                           potentialFlexWidth :
                           0;

  var newAllColumns = [];
  var newColumnGroups = [];
  var columnGroup;
  var currentColumns;
  var newColumnCount = 0;
  var addCurrentColumn = column => {
      currentColumns[ currentColumns.length ] = column;
  };

  for (i = 0; i < columnGroupCount; ++i) {
    columnGroup = columnGroups[ i ];
    currentColumns = [];

    React.Children.forEach(
      columnGroup.props.children,
      addCurrentColumn
    );

    var columnGroupFlexGrow = getTotalFlexGrow(currentColumns);
    var columnGroupFlexWidth = Math.floor(
      columnGroupFlexGrow / remainingFlexGrow * remainingFlexWidth
    );

    var newColumnSettings = distributeFlexWidth(
      currentColumns,
      columnGroupFlexWidth
    );

    remainingFlexGrow -= columnGroupFlexGrow;
    remainingFlexWidth -= columnGroupFlexWidth;
    newColumnCount = newColumnSettings.columns.length;

    for (j = 0; j < newColumnCount; ++j) {
      newAllColumns.push(newColumnSettings.columns[j]);
    }

    newColumnGroups.push(React.cloneElement(
      columnGroup,
      {width: newColumnSettings.width}
    ));
  }

  return {
    columns: newAllColumns,
    columnGroups: newColumnGroups,
  };
}

function adjustColumnWidths(
  /*Array*/ columns,
  /*number*/ expectedWidth
) /*Array*/ {
  var columnsWidth = getTotalWidth(columns);
  if (columnsWidth < expectedWidth) {
    return distributeFlexWidth(columns, expectedWidth - columnsWidth).columns;
  }
  return columns;
}

var FixedDataTableWidthHelper = {
  getTotalWidth,
  getTotalFlexGrow,
  distributeFlexWidth,
  adjustColumnWidths,
  adjustColumnGroupWidths,
};

module.exports = FixedDataTableWidthHelper;
