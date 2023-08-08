import * as React from 'react';
import './Button.css';

interface IButtonProps extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
}

export const Button = React.memo(function BtnComponent({ children, href }: IButtonProps) {
    return (
        <a href={href} className="button-gradient bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
            {children}
        </a>
    )
})