import { parse } from "dotenv";
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

interface completionresults {
  q: string;
  a: string;
  s: string;
  g: string;
  e: string;
}

const enum Grade {
  "correct",
  "incorrect",
  "nonapplicable",
}

function castToGrade(grade: string) {
  const g = grade.toLowerCase();
  switch (g) {
    case "correct":
      return Grade.correct;
    case "incorrect":
      return Grade.incorrect;
    default:
      return Grade.nonapplicable;
  }
}

function caculateScore(completions: completionresults[]) {
  let total = 0;
  let score = 0;

  for (const completion of completions) {
    const grade = castToGrade(completion.g);
    if (grade === Grade.nonapplicable) {
      continue;
    }
    total++;
    if (grade === Grade.correct) {
      score++;
    }
  }

  return Math.floor((score / total) * 100);
}

export async function gradeTranscript(
  transcript: string,
  model: "gpt-3.5-turbo-16k" | "gpt-4" = "gpt-4"
) {
  const completion = await getOpenAiClient().chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content:
          'You are an experienced software developer. The following is a transcript of a technical interview. Identify the questions asked by the interviewer and grade the candidates response based on how correct it is. Suboptimal responses should be considered incorrect. The interview is a \'closed book\' interview so if the candidate reaches for an external source their answer is incorrect. Output your findings in the following format\n{\n    "interviewer": "The interviewer",\n    "candidate": "the person answering the questions in hopes of getting a job"\n    "results": [{\n        "q": "Question the interviewer has asked",\n        "a": "The answer given by the candidate",\n        "s": [ {\n            "subpoint": "factual statement given by the candidate supporting their answer, e.g. bubble sort is o(2N)",\n            "grade" : "Correct" | "Incorrect"\n            } ],\n        "g": "Correct" | "Incorrect" | "Nonapplicable",\n        "e": less then 50 words on why the answer was correct, incorrect, or nonapplicable\n    }]\n}\n\nNonapplicable grades are for questions or answers that are not technical in nature. For example  "How was your weekend"\nThe transcript is occasionally incorrect. Instances where there are duplicate words should be fixed. For Example "I I I use react" => "I use react"\nOther words are misheard. For example "React Hooks" can be misheard as "react tricks ',
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

  const parsedContent = JSON.parse(rawContent);
  const score = caculateScore(parsedContent.results);
  parsedContent.score = score;
  return parsedContent;
}
