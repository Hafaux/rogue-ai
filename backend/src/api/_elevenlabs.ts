import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const tmp = async () => {
  if (typeof process.env.ELEVENLABS_API_KEY === "undefined") {
    throw Error();
  }

  const el_url = "https://api.elevenlabs.io";
  const voices_route = `${el_url}/v1/voices`;
  let tts_route = (voice_id: string) =>
    `${el_url}v1/text-to-speech/${voice_id}`;
  let tts_stream_route = (voice_id: string) =>
    `${el_url}v1/text-to-speech/${voice_id}/stream`;

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

  console.log("AAAA");

  const headers = {
    accept: "application/json",
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
  };

  try {
    const response = await fetch(voices_route, {
      method: "get",
      headers: headers,
    });

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.log(error);
  }

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
};
