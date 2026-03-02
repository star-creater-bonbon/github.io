let dailyMessages = {};

fetch("dailyMessages.json")
  .then(res => res.json())
  .then(data => {
    dailyMessages = data;
  });

document.getElementById("diagnoseBtn").addEventListener("click", () => {

  const keys = Object.keys(dailyMessages);
  if (keys.length === 0) {
    alert("データ読み込み中です");
    return;
  }

  // ランダムで日付選択
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const message = dailyMessages[randomKey];

  const resultHTML = `
    <h2>${randomKey} 生まれ</h2>
    <p><strong>光：</strong>${message.light}</p>
    <p><strong>闇：</strong>${message.dark}</p>
  `;

  document.getElementById("result").innerHTML = resultHTML;

  // URLに結果を埋め込む
  const url = new URL(window.location);
  url.searchParams.set("date", randomKey);
  window.history.replaceState({}, "", url);

  document.getElementById("copyBtn").style.display = "block";
});

document.getElementById("copyBtn").addEventListener("click", copyResultUrl);

function copyResultUrl() {
  const url = window.location.href;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url)
      .then(() => alert("URLをコピーしました！"))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  alert("URLをコピーしました！");
}
