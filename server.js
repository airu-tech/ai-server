import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

let requestCount = 0;
const MAX_REQUEST = 20;

app.post("/api/generate", async (req, res) => {
  const userInput = req.body.input;

  // 🟡 回数制限
  requestCount++;
  if (requestCount > MAX_REQUEST) {
    return res.json({ result: "本日のデモ上限に達しました。" });
  }

  // 🟡 入力チェック
  if (!userInput) {
    return res.json({ result: "入力してください" });
  }

  if (userInput.length > 200) {
    return res.json({ result: "文字数が多すぎます（200文字以内）" });
  }

  // 🟢 ここから元の処理
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "税理士として丁寧にメール返信してください"
        },
        {
          role: "user",
          content: userInput
        }
      ]
    })
  });

  const data = await response.json();
  res.json({ result: data.choices[0].message.content });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});