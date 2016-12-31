/**
 * Created by Deryck on 12/31/16.
 */

'use strict';

/**
 * Courtesy of Mr. Paul Lewis.
 * https://developers.google.com/web/updates/2015/08/using-requestidlecallback
 * @type {Function}
 */

const requestIdleShimBack = cb => {
    const start = Date.now();
    return setTimeout(function () {
        cb({
            didTimeout: false,
            timeRemaining: function () {
                const time = 50 - (Date.now() - start);
                return time > 0 ?
                       time :
                       0;
            }
        });
    }, 1);
};

const requestIdleCallback =
    window.requestIdleCallback ||
    requestIdleShimBack;

const cancelIdleCallback =
    window.cancelIdleCallback ||
    clearTimeout;

module.exports = {
    'request': requestIdleCallback,
    'cancel': cancelIdleCallback
};
