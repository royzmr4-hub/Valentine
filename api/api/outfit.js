import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { clothes } = req.body;

    if (!Array.isArray(clothes) || clothes.length < 3) {
      return res.status(400).json({
        error: "At least 3 clothes are required."
      });
    }

    const wardrobe = clothes
      .map(
        (item, index) => `
ID: ${index}
Category: ${item.category}
Color: ${item.color || "unknown"}
Style: ${item.style || "unknown"}
Occasion: ${item.occasion || "other"}
`
      )
      .join("\n");

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: `
You are PinkFit AI, a fashion styling assistant.

Create ONE coordinated outfit using ONLY these clothes:

${wardrobe}

Return ONLY valid JSON:
{
  "top": 0,
  "bottom": 1,
  "shoes": 2,
  "outerwear": null,
  "reason": "short styling explanation"
}

Rules:
- Use the wardrobe IDs.
- Choose matching clothes.
- If there is no suitable outerwear, use null.
`
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI outfit failed"
    });
  }
}
