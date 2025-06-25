// dashboard.js
// 1) Firebase 설정 → https://console.firebase.google.com 에서 내 프로젝트 설정 후 복사해 넣으세요.
const firebaseConfig = {
  apiKey: "AIzaSyAbSdcxEwYSjQ4LjgNme29iJGVs_t6fxnQ",
  authDomain: "show-progress-bbony.firebaseapp.com",
  databaseURL: "https://show-progress-bbony-default-rtdb.firebaseio.com",
  projectId: "show-progress-bbony",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref('currentActivity');

// 2) URL에서 모둠 리스트 읽어오기
const params = new URLSearchParams(location.search);
const groups = decodeURIComponent(params.get('groups') || '').split(',');

// 3) 그리드 생성
const dashboard = document.getElementById('dashboard');
dashboard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(groups.length))}, 1fr)`;

const statusColors = {
  '시작': '#888', '토의중': '#f1c40f', '작업중': '#3498db',
  '도움 요청': '#e74c3c', '완료': '#2ecc71'
};

// 각 모둠 박스 DOM 생성
groups.forEach(name => {
  const box = document.createElement('div');
  box.className = 'group-box';
  box.id = `box-${name}`;
  box.innerHTML = `
    <h2>${name}</h2>
    <div class="status">시작</div>
    <div class="qr"></div>
    <div class="time"></div>
  `;
  dashboard.append(box);

  // QR 코드 생성 (update.html?group=모둠이름)
  new QRCode(box.querySelector('.qr'), {
    text: `${location.origin}/update.html?group=${encodeURIComponent(name)}`,
    width: 100, height: 100
  });
});

// 4) 최초 방문 시 DB에 초기값 넣기 (초기화 주의)
const init = {};
groups.forEach(name => {
  init[name] = { status: '시작', lastUpdate: new Date().toISOString() };
});
db.set(init);

// 5) 데이터 변화 감지 → 박스 업데이트
db.on('value', snap => {
  const data = snap.val() || {};
  for (const [name, info] of Object.entries(data)) {
    const box = document.getElementById(`box-${name}`);
    if (!box) continue;
    box.querySelector('.status').textContent = info.status;
    box.style.backgroundColor = statusColors[info.status] || '#999';
    const t = new Date(info.lastUpdate).toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'});
    box.querySelector('.time').textContent = `마지막: ${t}`;
  }
});
