(function () {
  'use strict';

  /**
   * Completely random generation of unique strings
   * @param {Number} size Generate the length of a random string
   * @default 10
   * @returns {String} Randomly generated string
   */
  function unique(size) {
    size = size || 10;

    var r = function r() {
      return Math.random().toString(36).slice(2);
    };

    var result = r();

    while (result.length < size) {
      result += r();
    }

    return result.slice(0, size);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var id = 'VS_' + unique();
    var script = document.createElement('script');
    script.src = '//localhost:6870?p=' + id;
    script.referrerPolicy = 'no-referrer-when-downgrade';

    window[id] = function (data) {
      for (var key in data) {
        var dom = document.getElementById('vs_' + key);
        if (dom) dom.innerText = data[key];
      }

      script.parentNode.removeChild(script);
    };

    document.head.appendChild(script);
  });

})();
