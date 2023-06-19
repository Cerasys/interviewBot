import React from "react";
import "./Transcription.css";

const Transcription = (props) => {
  return <div className="transcription-container">{props.children}</div>;
};

export default Transcription;
