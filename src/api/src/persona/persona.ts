import mongoose from "mongoose";
const Schema = mongoose.Schema;

// {
//     email: "test@email.com",
//     date: new Date("2023-03-25"),
//     score: 100,
//     transcript:
//       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     aiComplete:
//       "que sodales ut etiam sit amet. Risus sed vulputate odio ut enim blandit volutpat. At erat pellentesque adipiscing commodo elit at imperdiet dui accumsan. Non curabitur gravida arcu ac tortor dignissim convallis aenean. Enim ut sem viverra aliquet eget sit amet tellus cras. Tellus id interdum velit laoreet id donec ultrices. Orci sagittis eu volutpat odio facilisis mauris. Quam vulputate dignissim suspendisse in est. Sollicitudin tempor id eu nisl. Odio ut enim blandit volutpat maecenas volut",
//   },

const personaSchema = new Schema({
    id: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    score: { type: Number, required: false },
    botId: { type: String, required: false },
    rawTranscript: [{
        speaker: String,
        words: [{
            text: String,
            start_timestamp: Number,
            end_timestamp: Number
        }]
    }],
    transcript: { type: String, required: false },
    aiComplete: { type: String, required: false },
});

export const Persona = mongoose.model("Persona", personaSchema);
