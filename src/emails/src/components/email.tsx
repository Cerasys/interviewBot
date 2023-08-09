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
          <b>Candidate name: </b>
          {props.body.candidate_name}
          <br />
          <b>Recruiter name: </b>
          {props.body.recruiter_name}
        </p>
        <h2>Overall Score: {props.body.score * 100}%</h2>
        <br />
        <hr />
        <br />
        <h2>Evaluation</h2>
        {props.body.completions?.map((completion, index) => (
          <p key={index}>
            <b>
              QUESTION {index + 1}: {completion.question}
            </b>
            <br />
            <b>Candidate answer: </b>
            {completion.answer}
            <br />
            {completion.subpoints.length > 0 && (
              <React.Fragment>
                <b>Subpoints made by the candidate: </b>
                <br />
                {completion.subpoints?.map((subpoint, subIndex) => (
                  <React.Fragment>
                    {`\t${subIndex + 1}. ${subpoint}`}
                    <br />
                  </React.Fragment>
                ))}
              </React.Fragment>
            )}
            <b>Explanation:</b> {completion.explanation}
            <br />
            <b>Grade: </b>
            {completion.grade.charAt(0).toUpperCase() +
              completion.grade.slice(1).toLowerCase()}
            <br />
          </p>
        ))}
        <hr />
        <h2>Interview Transcript:</h2>
        {props.body.transcript}
      </div>
    </React.Fragment>
  );
});
