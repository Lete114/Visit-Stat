(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var id = 'VS_' + Math.random().toString(36).slice(2);
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
