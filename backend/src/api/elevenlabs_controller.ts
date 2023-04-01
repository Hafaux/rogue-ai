import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config();

const TMP_MESSAGE = "You are trash!";
const CAVE_AUDIO_FILE = "cave_quote.mp3";

const CAVE_JOHNSON_NAME = "Cave Johnson";
const WHEATLEY_NAME = "Wheatley";

export class ElevenLabsController {
  private static configuration = {
    api_key: process.env.ELEVENLABS_API_KEY,
    root_url: "https://api.elevenlabs.io",

    // api_routes: {
    //   ''
    // }
    // const voices_route = `${el_url}/v1/voices`;
    // let tts_route = (voice_id: string) => `${el_url}v1/text-to-speech/${voice_id}`;
    // let tts_stream_route = (voice_id: string) => `${el_url}v1/text-to-speech/${voice_id}/stream`;
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

    let data: any = {};
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

    let data: any = {};
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

const tmp = async () => {
  try {
    const voices = await ElevenLabsController.getVoices();
    const cave_voice_id = voices.find(
      (voice: any) => voice.name === CAVE_JOHNSON_NAME
    ).voice_id;
    const wheatley_voice_id = voices.find(
      (voice: any) => voice.name === WHEATLEY_NAME
    ).voice_id;

    const audio = await ElevenLabsController.tts(TMP_MESSAGE, cave_voice_id);
    const audio_stream = await ElevenLabsController.tts_stream(
      TMP_MESSAGE,
      cave_voice_id
    );

    // console.log(audio);
    // console.log(audio_stream);
    audio_stream.pipe(fs.createWriteStream(CAVE_AUDIO_FILE));
    // const buffer = Buffer.from(audio, "binary");
    // await fs.promises.writeFile(CAVE_AUDIO_FILE, audio);
    console.log("File saved successfully");
  } catch (error) {
    console.log(error);
  }
};

tmp();

// TODO:
// Should this be here? Um, probably no :D.
// export const availableVoices = {
//   'Rachel': '21m00Tcm4TlvDq8ikWAM',
//   'Domi': 'AZnzlk1XvdvUeBnXmlld',
//   'Bella': 'EXAVITQu4vr4xnSDxMaL'
// }

// const headers = {
//   'accept': 'audio/mpeg',
//   'xi-api-key': process.env.OPENAI_API_KEY,
//   'Content-Type': 'application/json'
// };

// const tmp = async () => {

// if (typeof process.env.ELEVENLABS_API_KEY === 'undefined') {
//     throw Error();
// }

// const el_url = 'https://api.elevenlabs.io';
// const voices_route = `${el_url}/v1/voices`;
// let tts_route = (voice_id: string) => `${el_url}v1/text-to-speech/${voice_id}`;
// let tts_stream_route = (voice_id: string) => `${el_url}v1/text-to-speech/${voice_id}/stream`;

// const tts_headers = {
//     'accept': 'audio/mpeg',
//     'xi-api-key': process.env.ELEVENLABS_API_KEY,
//     'Content-Type': 'application/json',
// };

// let prompt_response: string = 'You are trash!';
// const json_data = {
//     'text': prompt_response,
//     'voice_settings': {
//         'stability': 0,
//         'similarity_boost': 0
//     }
// };

// await fetch(voices_route, {
//     method: 'post',
//     body: JSON.stringify(json_data),
//     headers: headers
// });

// const headers = {
//     'accept': 'application/json',
//     'xi-api-key': process.env.ELEVENLABS_API_KEY
// };

// try {
// 	const response = await fetch(voices_route, {
//         method: 'get',
//         headers: headers
//     });

//     const data = await response.json();

//     console.log(data);
// } catch (error) {
// 	console.log(error);
// }

// const track = new Track();
// track.setTempo(80, 4);

// jsonData.forEach((noteData) => {
//   const note = new NoteEvent({
//     pitch: noteData.pitch[0],
//     duration: noteData.duration,
//   });
//   track.addEvent(note);
// });

// const writer = new Writer([track]);
// const midiBuffer = writer.buildFile();

// writeFile("voice.mp3", midiBuffer, (err) => {
//   if (err) throw err;
//   console.log("MIDI file has been created.");
// });

// response = requests.post('https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB', headers=headers, json=json_data)

// with open('prompt_response.mp3', 'wb') as f:
//     f.write(response.content)

// console.log(voices_route)
// }
