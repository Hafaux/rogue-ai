import dotenv from "dotenv";
import axios from 'axios';

// TODO:
// Should this be here?
export const availableVoices = {
  'Rachel': '21m00Tcm4TlvDq8ikWAM',
  'Domi': 'AZnzlk1XvdvUeBnXmlld',
  'Bella': 'EXAVITQu4vr4xnSDxMaL'
}


const headers = {
  'accept': 'audio/mpeg',
  'xi-api-key': 'elevenlabs-secret-key',
  // 'xi-api-key': process.env.OPENAI_API_KEY,
  // TODO: Replace upper line with the following when server is setup.
  'Content-Type': 'application/json'
};

export const elevenLabsRequest = async (message: string, voiceId: string) => {
  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const requestBody = {
    text: message,
    voice_settings: {
      stability: 0,
      similarity_boost: 0
    }
  };

  axios.post(apiUrl, requestBody, { headers })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error(error);
      return '';
    });
}
