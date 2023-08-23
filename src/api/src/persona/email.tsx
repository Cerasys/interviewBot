import * as React from "react";


interface subpoint {
    subpoint: string;
    grade: string;
}

interface SmallCompletion {
    s: subpoint[];
    g: string;
    e: string;
    q: string;
    a: string;

}

interface Completion {
    subpoints: subpoint[];
    grade: string;
    explanation: string;
    question: string;
    answer: string;
}

export interface CompletionData {
    completions: Completion[];
    score: number;
    transcript: string[];
    candidate_name: string;
    recruiter_name: string;
}

function mapSmallCompletionToFull(unparsedCompletion: Completion): Completion {
    const c = unparsedCompletion as unknown as SmallCompletion;
    return {
        subpoints: c.s,
        grade: c.g,
        explanation: c.e,
        question: c.q,
        answer: c.a
    };
}

/**
 * Root email component
 */

interface IEmailProps {
    body: CompletionData;
}

export const Email = React.memo((props: IEmailProps) => {
    return (
        <div>
            <p>
                <b>Candidate name: </b>
                {props.body.candidate_name}
                <br />
                <b>Recruiter name: </b>
                {props.body.recruiter_name}
            </p>
            <h2>Overall Score: {props.body.score}%</h2>
            <br />
            <hr />
            <br />
            <h2>Evaluation</h2>
            {props.body.completions?.map(mapSmallCompletionToFull).map((completion, index) => {
                return (
                    <p>
                        <b>
                            QUESTION {index + 1}: {completion.question}
                        </b>
                        <br />
                        <b>Candidate answer: </b>
                        {completion.answer}
                        {completion.subpoints.length > 0 && (
                            <React.Fragment>
                                <table>
                                    <tr>
                                        <th style={{textAlign: "left"}} >Subpoints made by the candidate</th>
                                        <th></th>
                                        <th style={{textAlign: "left"}}>Grade</th>
                                    </tr>
                                    {completion.subpoints?.map((subpoint) => (
                                        <tr>
                                            <td>{subpoint.subpoint}</td>
                                            <td>        </td>
                                            <td>{subpoint.grade}</td>
                                        </tr>
                                    ))}
                                </table>
                            </React.Fragment>
                        )}
                        <b>Explanation:</b> {completion.explanation}
                        <br />
                        <b>Grade: </b>
                        {completion.grade.charAt(0).toUpperCase() +
                            completion.grade.slice(1).toLowerCase()}
                        <br />
                        <br />
                    </p>
                );
            })}
            <hr />
            <h2>Interview Transcript:</h2>
            {props.body.transcript.map((sentence) => {
                const [speaker, words] = sentence.split(":");
                return (
                    <div>
                        <b>{speaker}</b>
                        <span>{words}</span>
                    </div>
                );
            })}
        </div>
    );
});
