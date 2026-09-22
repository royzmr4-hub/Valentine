import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Зураг байхгүй байна."
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyze this clothing photo.

Return ONLY valid JSON:
{
  "category": "top | bottom | shoes | outerwear",
  "color": "main color",
  "style": "style",
  "occasion": "casual | formal | party | sport | other"
}
`
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ]
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "AI analysis failed"
    });
  }
}
