import dotenv from "dotenv";
import axios from "axios";
import { IncomingMessage } from "http";

dotenv.config();

export const CAVE_JOHNSON_NAME = "Cave Johnson";
export const WHEATLEY_NAME = "Wheatley";

export class ElevenLabsController {
  private static configuration = {
    api_key: process.env.ELEVENLABS_API_KEY,
    root_url: "https://api.elevenlabs.io",
  };

  static async getVoices() {
    const api_url = `${ElevenLabsController.configuration.root_url}/v1/voices`;
    const headers = {
      accept: "application/json",
      "xi-api-key": ElevenLabsController.configuration.api_key,
    };

    let voices: any[] = [];
    try {
      const response = await axios.get(api_url, { headers });
      voices = response.data.voices;
    } catch (error) {
      console.error(error);
    } finally {
      return voices;
    }
  }

  static async tts(message: string, voiceId: string) {
    const api_url = `${ElevenLabsController.configuration.root_url}/v1/text-to-speech/${voiceId}`;

    const requestBody = {
      text: message,
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
      },
    };

    const headers = {
      accept: "audio/mpeg",
      "xi-api-key": ElevenLabsController.configuration.api_key,
      "Content-Type": "application/json",
    };

    let data: any = null;
    try {
      const response = await axios.post(api_url, requestBody, { headers });
      data = response.data;
    } catch (error) {
      console.error(error);
    } finally {
      return data;
    }
  }

  static async tts_stream(message: string, voiceId: string) {
    const api_url = `${ElevenLabsController.configuration.root_url}/v1/text-to-speech/${voiceId}/stream`;

    const requestBody = {
      text: message,
      voice_settings: {
        stability: 0,
        similarity_boost: 0,
      },
    };

    const headers = {
      accept: "*/*",
      "xi-api-key": ElevenLabsController.configuration.api_key,
      "Content-Type": "application/json",
    };

    let data: IncomingMessage | null = null;
    try {
      const response = await axios.post(api_url, requestBody, {
        headers,
        // onDownloadProgress: (progressEvent) => {
        //   const dataChunk = progressEvent.currentTarget.response;
        // },
        responseType: "stream",
      });
      data = response.data;
    } catch (error) {
      console.error(error);
    } finally {
      return data;
    }
  }
}
