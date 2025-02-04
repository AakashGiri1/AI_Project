import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ detail: 'REPLICATE_API_TOKEN is not set' });
  }

  const { prompt, negative_prompt } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ detail: 'Prompt is required' });
  }

  try {
    const input = { prompt };
    
    // Only include negative_prompt if it's provided
    if (negative_prompt && negative_prompt.trim() !== '') {
      input.negative_prompt = negative_prompt;
    }

    const prediction = await replicate.predictions.create({
      version: '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
      input,
    });

    res.status(201).json(prediction);
  } catch (error) {
    if (error.response) {
      // API responded with an error
      res.status(error.response.status).json({ detail: error.response.data });
    } else if (error.request) {
      // Network error or no response
      res.status(500).json({ detail: 'No response received from Replicate API' });
    } else {
      // Other errors
      res.status(500).json({ detail: error.message });
    }
  }
}
