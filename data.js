import { useState, useEffect } from "react";

const KEYWORDS = {
  "性格・気質": [
    "明るい", "クール", "内向的", "外向的", "感情的", "論理的",
    "慎重", "大胆", "優しい", "厳しい", "純粋", "複雑"
  ],
  "行動パターン": [
    "リーダー気質", "縁の下の力持ち", "マイペース", "負けず嫌い",
    "世話好き", "単独行動", "計画的", "行き当たりばったり"
  ],
  "価値観・こだわり": [
    "正義感が強い", "自由を重んじる", "家族・仲間を大切にする",
    "美意識が高い", "知識欲旺盛", "物質より精神", "伝統を重んじる", "革新的"
  ],
  "弱点・影の面": [
    "嫉妬しやすい", "頑固", "優柔不断", "自己犠牲的", "プライドが高い",
    "孤独を抱える", "過去に縛られる", "感情を隠す"
  ]
};

const ZODIAC_DATES = [
  { sign: "牡羊座", symbol: "♈", period: "3/21〜4/19", color: "#FF6B6B" },
  { sign: "牡牛座", symbol: "♉", period: "4/20〜5/20", color: "#4ECDC4" },
  { sign: "双子座", symbol: "♊", period: "5/21〜6/21", color: "#FFE66D" },
  { sign: "蟹座",   symbol: "♋", period: "6/22〜7/22", color: "#A8E6CF" },
  { sign: "獅子座", symbol: "♌", period: "7/23〜8/22", color: "#FF8B94" },
  { sign: "乙女座", symbol: "♍", period: "8/23〜9/22", color: "#B8B8FF" },
  { sign: "天秤座", symbol: "♎", period: "9/23〜10/23", color: "#FFDAB9" },
  { sign: "蠍座",   symbol: "♏", period: "10/24〜11/22", color: "#C3A6FF" },
  { sign: "射手座", symbol: "♐", period: "11/23〜12/21", color: "#85E3FF" },
  { sign: "山羊座", symbol: "♑", period: "12/22〜1/19", color: "#B5EAD7" },
  { sign: "水瓶座", symbol: "♒", period: "1/20〜2/18", color: "#9BF6FF" },
  { sign: "魚座",   symbol: "♓", period: "2/19〜3/20", color: "#FFABF6" },
];

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 2,
  }));
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white">
          <animate attributeName="opacity" values="0.2;1;0.2" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

export default function App() {
  const [charName, setCharName] = useState("");
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (kw) => {
    setSelected(prev => ({ ...prev, [kw]: !prev[kw] }));
  };

  const selectedList = Object.keys(selected).filter(k => selected[k]);

  const analyze = async () => {
    if (selectedList.length < 3) {
      setError("キーワードを3つ以上選んでください。");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const prompt = `あなたは占星術の専門家です。以下のキャラクターの性格キーワードをもとに、最もふさわしい星座と誕生日を推定してください。

キャラクター名：${charName || "（未設定）"}
性格キーワード：${selectedList.join("、")}

以下のJSON形式のみで返答してください（マークダウン不可）：
{
  "zodiac": "星座名（例：蠍座）",
  "birthday": "推定誕生日（例：11月8日）",
  "reason": "この星座・誕生日を選んだ理由を150字程度で、キャラクターへの語りかけ口調で詩的に説明してください。",
  "trait": "この星座の象徴的な一言（例：情熱と再生の星）"
}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content.map(c => c.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const zodiacInfo = ZODIAC_DATES.find(z => z.sign === parsed.zodiac) || ZODIAC_DATES[0];
      setResult({ ...parsed, ...zodiacInfo });
    } catch (e) {
      setError("解析中にエラーが発生しました。もう一度お試しください。");
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setSelected({}); setCharName(""); setError(""); };

  const bg = "linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 40%, #0d1b4b 100%)";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Hiragino Mincho ProN', 'Georgia', serif", color: "white", position: "relative", overflowX: "hidden" }}>
      <StarField />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌙</div>
          <h1 style={{ fontSize: 26, fontWeight: "bold", letterSpacing: "0.15em", background: "linear-gradient(90deg, #c9a0ff, #ffe0ff, #a0c4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
            キャラクター誕生日占い
          </h1>
          <p style={{ color: "#b0a0cc", fontSize: 13, marginTop: 8, letterSpacing: "0.1em" }}>
            星々があなたのキャラクターの生まれた日を告げる
          </p>
        </div>

        {!result ? (
          <div>
            {/* Name Input */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, color: "#c9a0ff", letterSpacing: "0.1em", marginBottom: 8 }}>✦ キャラクター名（任意）</label>
              <input
                value={charName}
                onChange={e => setCharName(e.target.value)}
                placeholder="例：夜月 凛"
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(180,140,255,0.3)", borderRadius: 10, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", letterSpacing: "0.05em" }}
              />
            </div>

            {/* Keyword Groups */}
            {Object.entries(KEYWORDS).map(([group, kws]) => (
              <div key={group} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "#a090cc", letterSpacing: "0.15em", marginBottom: 10, borderBottom: "1px solid rgba(180,140,255,0.2)", paddingBottom: 6 }}>
                  ✦ {group}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {kws.map(kw => {
                    const on = !!selected[kw];
                    return (
                      <button key={kw} onClick={() => toggle(kw)} style={{
                        padding: "7px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.2s",
                        background: on ? "linear-gradient(135deg, #7b2ff7, #b44fff)" : "rgba(255,255,255,0.06)",
                        border: on ? "1px solid #c580ff" : "1px solid rgba(180,140,255,0.25)",
                        color: on ? "white" : "#c0b0e0",
                        boxShadow: on ? "0 0 12px rgba(180,80,255,0.4)" : "none",
                        transform: on ? "scale(1.04)" : "scale(1)"
                      }}>{kw}</button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Count */}
            <div style={{ textAlign: "center", fontSize: 12, color: "#9080b0", marginBottom: 16 }}>
              選択中：<span style={{ color: "#c9a0ff", fontWeight: "bold" }}>{selectedList.length}</span> 個
              {selectedList.length < 3 && " （3つ以上選んでください）"}
            </div>

            {error && <div style={{ textAlign: "center", color: "#ff8fa0", fontSize: 13, marginBottom: 12 }}>{error}</div>}

            {/* Button */}
            <button onClick={analyze} disabled={loading} style={{
              display: "block", width: "100%", padding: "16px", borderRadius: 14, fontSize: 16, fontWeight: "bold", letterSpacing: "0.15em", cursor: loading ? "not-allowed" : "pointer", border: "none",
              background: loading ? "rgba(120,80,180,0.4)" : "linear-gradient(135deg, #6a0dad, #9b30ff, #6a0dad)",
              color: "white", boxShadow: loading ? "none" : "0 0 30px rgba(150,60,255,0.5)", transition: "all 0.3s",
              backgroundSize: "200% 100%"
            }}>
              {loading ? "✦ 星々が語りかけています…" : "✦ 誕生日を占う ✦"}
            </button>
          </div>
        ) : (
          /* Result */
          <div style={{ animation: "fadeIn 0.8s ease" }}>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } } @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(180,80,255,0.4)} 50%{box-shadow:0 0 60px rgba(180,80,255,0.8)} }`}</style>
            <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${result.color}55`, borderRadius: 20, padding: "36px 28px", textAlign: "center", backdropFilter: "blur(10px)", animation: "glow 3s ease infinite" }}>
              {charName && <p style={{ color: "#b0a0cc", fontSize: 14, marginBottom: 4, letterSpacing: "0.1em" }}>【 {charName} 】の星</p>}
              <div style={{ fontSize: 64, marginBottom: 8 }}>{result.symbol}</div>
              <h2 style={{ fontSize: 32, margin: "0 0 4px", color: result.color, textShadow: `0 0 20px ${result.color}` }}>{result.zodiac}</h2>
              <p style={{ color: "#c0b0d0", fontSize: 13, marginBottom: 20, letterSpacing: "0.1em" }}>{result.trait}</p>

              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#9080b0", letterSpacing: "0.15em", marginBottom: 6 }}>✦ 推定誕生日</div>
                <div style={{ fontSize: 28, fontWeight: "bold", color: "white", letterSpacing: "0.1em" }}>{result.birthday}</div>
                <div style={{ fontSize: 12, color: "#9080b0", marginTop: 4 }}>{result.period}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
                <div style={{ fontSize: 12, color: "#9080b0", letterSpacing: "0.15em", marginBottom: 8 }}>✦ 星の導き</div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#d0c0f0", margin: 0 }}>{result.reason}</p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 28 }}>
                {selectedList.map(kw => (
                  <span key={kw} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 12, background: `${result.color}22`, border: `1px solid ${result.color}55`, color: result.color }}>
                    {kw}
                  </span>
                ))}
              </div>

              <button onClick={reset} style={{ padding: "12px 32px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(180,140,255,0.3)", color: "#c9a0ff", fontSize: 14, cursor: "pointer", letterSpacing: "0.1em" }}>
                ✦ もう一度占う
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
