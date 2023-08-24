import * as React from "react";

/**
 * Root email component
 */

export const EmailContent = () => {
    return (
        <div>
            <h1>Your Report Card is On the Way!</h1>
            <p>Hello,</p>
            <p>
                Greetings! We hope you're having a splendid day. We're reaching out to let you know that your recording session has wrapped up successfully. 🎉
            </p>
            <h2>Here's a quick update:</h2>
            <p>🎙 <strong>Recording Status</strong>: Complete! If you require a copy of the recording, kindly contact our team, and we'll assist you in obtaining it.</p>
            <p>📄 <strong>Report Card Status</strong>: Currently in the diligent hands of our experts. We're ensuring that every detail is captured accurately for your review.</p>

            <h2>What's next?</h2>
            <ol>
                <li>Receive Your Report Card: In a mere three hours, your report card will be delivered straight to your inbox. Simply open the email, and the insights will be at your fingertips!</li>
                <li>Need Assistance or the Recording?: Our dedicated support team is always here to help. Whether you have questions about the report card or need a copy of the recording, please don't hesitate to reach out.</li>
            </ol>
            <p><em>Quick Tip:</em> Keep an eye on your inbox! Your detailed report card will arrive in just three hours.</p>
            <p>Warm regards,</p>
            <p>The Persona AI Team</p>
        </div>
    );
};