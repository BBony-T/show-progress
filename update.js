// update.js
const firebaseConfig = {
  apiKey: "AIzaSyAbSdcxEwYSjQ4LjgNme29iJGVs_t6fxnQ",
  authDomain: "show-progress-bbony.firebaseapp.com",
  databaseURL: "https://show-progress-bbony-default-rtdb.firebaseio.com",
  projectId: "show-progress-bbony",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref('currentActivity');

// URL에서 모둠 이름 추출
const params = new URLSearchParams(location.search);
const group = params.get('group');
document.getElementById('title').textContent = `${group} 상태 업데이트`;

// 버튼 클릭 → 상태 변경
document.querySelectorAll('#buttons button').forEach(btn => {
  btn.onclick = () => {
    const status = btn.getAttribute('data-status');
    db.child(group).update({
      status,
      lastUpdate: new Date().toISOString()
    });
    alert(`상태가 '${status}'로 변경되었습니다!`);
  };
});
