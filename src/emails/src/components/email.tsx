import * as React from "react";
import { CompletionData } from "../functions/sendEmail";

/**
 * Root email component
 */

interface IEmailProps {
  body: CompletionData;
}

export const Email = React.memo((props: IEmailProps) => {
  return (
    <React.Fragment>
      <div>
        <p>
          <b>Candidate name:</b>
        </p>
        <p>
          <b>Recruiter name:</b>
        </p>
        <h2>Overall Score: {props.body.score * 100}%</h2>
        <hr />
        <h2>Evaluation</h2>
        {props.body.completions?.map((completion) => (
          <div key={completion.question}>
            <h3>QUESTION: {completion.question}</h3>
            <p>
              <b>Candidate answer: </b>
              {completion.answer}
            </p>
            {completion.subpoints && (
              <div>
                <b>Subpoints made by the candidate: </b>
                {completion.subpoints?.map((subpoint) => (
                  <p>{subpoint}</p>
                ))}
              </div>
            )}
            <p>Explanation: {completion.explanation}</p>
            <b>Grade: </b>
            {completion.grade.charAt(0).toUpperCase() +
              completion.grade.slice(1).toLowerCase()}
          </div>
        ))}
        <hr />
        <h2>Interview Transcript:</h2>
        {props.body.transcript}
      </div>
    </React.Fragment>
  );
});
