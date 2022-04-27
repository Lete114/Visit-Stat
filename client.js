document.addEventListener('DOMContentLoaded', function () {
  const id = 'VS_' + Math.random().toString(36).slice(2)
  const script = document.createElement('script')
  script.src = 'http://localhost:6870?p=' + id
  script.referrerPolicy = 'no-referrer-when-downgrade'

  window[id] = function (data) {
    for (const key in data) {
      document.getElementById('vs_' + key).innerText = data[key]
    }
    script.parentNode.removeChild(script)
  }

  document.head.appendChild(script)
})
