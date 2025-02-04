import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  // Validate if the ID is present
  if (!id || id.trim() === '') {
    return res.status(400).json({ detail: 'Prediction ID is required' });
  }

  try {
    const prediction = await replicate.predictions.get(id);

    // If the prediction is not found, return 404
    if (!prediction) {
      return res.status(404).json({ detail: 'Prediction not found' });
    }

    res.status(200).json(prediction);
  } catch (error) {
    if (error.response) {
      // If API responded with an error, return that status
      res.status(error.response.status).json({ detail: error.response.data });
    } else if (error.request) {
      // If no response received from the API
      res.status(500).json({ detail: 'No response from Replicate API' });
    } else {
      // Other errors, such as unexpected failures
      res.status(500).json({ detail: error.message });
    }
  }
}
