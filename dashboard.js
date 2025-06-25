// dashboard.js

// ❶ 페이지 강제 리로드(캐시 무시) 버튼
document.getElementById('refreshBtn').addEventListener('click', () => {
  // true를 주면 캐시된 리소스를 무시하고 서버에서 다시 불러옵니다.
  location.reload(true);
});

// 1) Firebase 설정
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

// 3) baseUrl 계산 (GitHub Pages 등 서브폴더 포함)
const baseUrl = location.origin
  + location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);

// 4) 그리드 생성
const dashboard = document.getElementById('dashboard');
dashboard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(groups.length))}, 1fr)`;

// 상태별 색상 매핑
const statusColors = {
  '시작': '#FFFFFF',
  '토의중': '#f1c40f',
  '작업중': '#3498db',
  '도움 요청': '#e74c3c',
  '완료': '#2ecc71'
};

// 5) 각 모둠 박스 DOM 생성 및 QR 코드 생성
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

  // QR 코드 생성: update.html이 호스팅된 위치에 맞춰 baseUrl을 사용
  new QRCode(box.querySelector('.qr'), {
    text: `${baseUrl}update.html?group=${encodeURIComponent(name)}`,
    width: 100,
    height: 100
  });
});

// 6) 최초 방문 시 DB에 초기값 넣기 (주의: 이미 데이터가 있으면 덮어쓰기 됩니다)
const init = {};
groups.forEach(name => {
  init[name] = {
    status: '시작',
    lastUpdate: new Date().toISOString()
  };
});
db.set(init);

// 7) 데이터 변화 감지 → 박스 업데이트
db.on('value', snapshot => {
  const data = snapshot.val() || {};
  Object.entries(data).forEach(([name, info]) => {
    const box = document.getElementById(`box-${name}`);
    if (!box) return;
    // 상태 글씨 및 색상 변경
    box.querySelector('.status').textContent = info.status;
    box.style.backgroundColor = statusColors[info.status] || '#999';
    // 마지막 업데이트 시간 표시
    const t = new Date(info.lastUpdate)
      .toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    box.querySelector('.time').textContent = `마지막: ${t}`;
  });
});