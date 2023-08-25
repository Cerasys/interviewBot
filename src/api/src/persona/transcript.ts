import OpenAI from "openai";

let openai: OpenAI;

function getOpenAiClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }
  return openai;
}

export async function correctTranscript(
  transcript: string,
  model: "gpt-3.5-turbo-16k" | "gpt-4" = "gpt-4"
) {
  const completion = await getOpenAiClient().chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "The following transcript of a technical interview has lots of recording errors and stuttering due to language accents and poor audio recording. Fix them without changing the content of the interview itself.",
      },
      {
        role: "user",
        content: transcript,
      },
    ],
    temperature: 0,
    max_tokens: 4000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  console.log(completion.choices);

  const rawContent = completion.choices[0]?.message?.content;
  const finishReason = completion.choices[0]?.finish_reason;

  console.log("Finish Reason: ", finishReason);
  if (!rawContent) {
    throw new Error("No response from open ai");
  }

  return rawContent;
}
