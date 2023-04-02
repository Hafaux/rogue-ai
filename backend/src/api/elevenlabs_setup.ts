import path from "path";
import {
  CAVE_JOHNSON_NAME,
  ElevenLabsController,
  WHEATLEY_NAME,
} from "./elevenlabs_controller";
import fs from "fs";

const TMP_MESSAGE = "You are trash!";
const CAVE_AUDIO_FILE = "cave_quote.mp3";
const NARRATOR_PRESETS_PATH = path.join("src", "narrator", "imaginary.json");

(async () => {
  try {
    const voices = await ElevenLabsController.getVoices();

    const cave_voice_id = voices.find(
      (voice: any) => voice.name === CAVE_JOHNSON_NAME
    ).voice_id;

    const wheatley_voice_id = voices.find(
      (voice: any) => voice.name === WHEATLEY_NAME
    ).voice_id;

    const data = await fs.promises.readFile(NARRATOR_PRESETS_PATH);
    let json = JSON.parse(data.toString());
    json["voice_ids"] = {
      [CAVE_JOHNSON_NAME]: cave_voice_id,
      [WHEATLEY_NAME]: wheatley_voice_id,
    };

    await fs.promises.writeFile(
      NARRATOR_PRESETS_PATH,
      JSON.stringify(json, null, 2)
    );

    // const audio_stream = await ElevenLabsController.tts_stream(
    //   TMP_MESSAGE,
    //   cave_voice_id
    // );

    // audio_stream?.pipe(fs.createWriteStream(CAVE_AUDIO_FILE));
    // console.log("File saved successfully");

    // const audio = await ElevenLabsController.tts(TMP_MESSAGE, cave_voice_id);
    // const buffer = Buffer.from(audio, "binary");
    // await fs.promises.writeFile(CAVE_AUDIO_FILE, audio);
  } catch (error) {
    console.log(error);
  }
})();
