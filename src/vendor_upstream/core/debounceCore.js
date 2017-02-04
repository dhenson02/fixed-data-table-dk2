/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule debounceCore
 * @typechecks
 */

/**
 * Courtesy of Mr. Paul Lewis.
 * https://developers.google.com/web/updates/2015/08/using-requestidlecallback
 * @type {Function}
 */

function requestIdleShimBack ( cb ) {
  return function () {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        'didTimeout': false,
        'timeRemaining': function () {
          var timeDiff = 50 - (Date.now() - start);
          return timeDiff > 0 ?
                 timeDiff :
                 0;
        }
      });
    }, 1);
  };
};

var requestIdleCallback =
  window.requestIdleCallback ||
  requestIdleShimBack;

var cancelIdleCallback =
  window.cancelIdleCallback ||
  clearTimeout;

/**
 * Invokes the given callback after a specified number of milliseconds have
 * elapsed, ignoring subsequent calls.
 *
 * For example, if you wanted to update a preview after the user stops typing
 * you could do the following:
 *
 *   elem.addEventListener('keyup', debounce(this.updatePreview, 250), false);
 *
 * The returned function has a reset method which can be called to cancel a
 * pending invocation.
 *
 *   var debouncedUpdatePreview = debounce(this.updatePreview, 250);
 *   elem.addEventListener('keyup', debouncedUpdatePreview, false);
 *
 *   // later, to cancel pending calls
 *   debouncedUpdatePreview.reset();
 *
 * @param {function} func - the function to debounce
 * @param {number} wait - how long to wait in milliseconds
 * @param {*} context - optional context to invoke the function in
 * @param {?function} setTimeoutFunc - an implementation of setTimeout
 *  if nothing is passed in the default setTimeout function is used
  * @param {?function} clearTimeoutFunc - an implementation of clearTimeout
 *  if nothing is passed in the default clearTimeout function is used
 */
function debounce(func, context) {
  var pendingCallback;

  function debouncer(...args) {
    debouncer.reset();

    var callback = function() {
      func.apply(context, args);
    };
    callback.__SMmeta = func.__SMmeta;
    pendingCallback = requestIdleCallback(callback);
  }

  debouncer.reset = function() {
    cancelIdleCallback(pendingCallback);
  };

  return debouncer;
}

module.exports = debounce;
