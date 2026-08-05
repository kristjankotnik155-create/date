(function () {
  var API = 'http://127.0.0.1:3847/api/activity';
  var GOOGLE_FORM =
    'https://docs.google.com/forms/d/e/1FAIpQLSew_9CqLJ177cl5gk8wnLz-PihV6xKhJCM42vaUDfMuVDsVtg/formResponse';
  var GOOGLE_ENTRY = 'entry.1462537200';

  var yesBtn = document.getElementById('yesBtn');
  var noBtn = document.getElementById('noBtn');
  var stage = document.getElementById('stage');
  var happyScreen = document.getElementById('happyScreen');
  var noShrinkCount = 0;

  function logLocal(action, detail, meta) {
    var payload = {
      action: action,
      detail: detail,
      meta: meta
    };
    var body = JSON.stringify(payload);

    fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body,
      mode: 'cors',
      cache: 'no-store'
    }).catch(function (err) {
      console.warn('local activity log failed', err);
    });
  }

  function logGoogle(answer) {
    var body = new URLSearchParams();
    body.append(GOOGLE_ENTRY, answer);

    fetch(GOOGLE_FORM, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    }).catch(function (err) {
      console.warn('google form log failed', err);
    });
  }

  function shrinkNoButton() {
    var styles = window.getComputedStyle(noBtn);
    var padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    var padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    var fontSize = parseFloat(styles.fontSize);
    var minWidth = parseFloat(styles.minWidth);

    var nextPadX = Math.max(8, padX / 2 - 3);
    var nextPadY = Math.max(6, padY / 2 - 2);
    var nextFont = Math.max(10, fontSize - 1.5);
    var nextMin = Math.max(40, minWidth - 6);

    noBtn.style.paddingLeft = nextPadX + 'px';
    noBtn.style.paddingRight = nextPadX + 'px';
    noBtn.style.paddingTop = nextPadY + 'px';
    noBtn.style.paddingBottom = nextPadY + 'px';
    noBtn.style.fontSize = nextFont + 'px';
    noBtn.style.minWidth = nextMin + 'px';

    noShrinkCount = noShrinkCount + 1;
  }

  function spawnPetals() {
    var emojis = ['🌸', '💐', '🌷', '✨'];
    var i = 0;
    while (i < 40) {
      (function (index) {
        window.setTimeout(function () {
          var p = document.createElement('div');
          p.className = 'petal';
          var emojiIndex = Math.floor(Math.random() * emojis.length);
          p.textContent = emojis[emojiIndex];
          p.style.left = Math.random() * 100 + 'vw';
          p.style.fontSize = 14 + Math.random() * 18 + 'px';
          var dur = 3 + Math.random() * 3;
          p.style.animationDuration = dur + 's';
          document.body.appendChild(p);
          window.setTimeout(function () {
            p.remove();
          }, dur * 1000 + 200);
        }, index * 90);
      })(i);
      i = i + 1;
    }
  }

  function showHappy() {
    document.body.classList.add('happy');
    happyScreen.classList.add('show');
    stage.style.display = 'none';
    spawnPetals();
  }

  noBtn.addEventListener('click', function () {
    shrinkNoButton();
    logLocal('click_no', 'ne :(', {
      shrinkCount: noShrinkCount,
      buttonWidth: noBtn.offsetWidth,
      buttonHeight: noBtn.offsetHeight
    });
    logGoogle('Ne');
  });

  yesBtn.addEventListener('click', function () {
    logLocal('click_yes', 'Jaaaaa!', {
      message: 'Se vidva po finskem :)'
    });
    logGoogle('Da');
    showHappy();
  });

  logLocal('page_open', 'Drug dejt?', {
    userAgent: navigator.userAgent,
    href: window.location.href
  });
})();
