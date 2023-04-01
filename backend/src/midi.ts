import { NoteEvent, Track, Writer } from "midi-writer-js";
import { writeFile } from "fs";

const jsonData = [
  { pitch: ["C4"], duration: "4" },
  { pitch: ["E4"], duration: "4" },
  { pitch: ["G4"], duration: "4" },
  { pitch: ["C5"], duration: "4" },
  { pitch: ["E4"], duration: "4" },
  { pitch: ["C4"], duration: "4" },
  { pitch: ["G3"], duration: "4" },
  { pitch: ["C4"], duration: "4" },
] as const;

// consol.log(idiWriter);

const track = new Track();
track.setTempo(80, 4);

jsonData.forEach((noteData) => {
  const note = new NoteEvent({
    pitch: noteData.pitch[0],
    duration: noteData.duration,
  });
  track.addEvent(note);
});

const writer = new Writer([track]);
const midiBuffer = writer.buildFile();

writeFile("intense_video_game_track.mid", midiBuffer, (err) => {
  if (err) throw err;
  console.log("MIDI file has been created.");
});
