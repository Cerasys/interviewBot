import React, { ReactNode } from 'react';
import './Title.css';

interface HeadingProps {
  children: ReactNode;
}

const GradientText: React.FC<HeadingProps> = ({ children }) => {
    return <span className="text-center gradient-text font-extrabold break-clone bg-no-repeat text-5xl">{children}</span>;
}

export default GradientText;
