import React from 'react';
import './Header.css';
import Image from 'next/image';

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
    return (
        <div className="sticky-header flex align-baseline">
            <a href='/' className='flex align-baseline'>
                <span className="header-icon">
                    <Image src='/persona.svg' width={28} height={28} alt="persona ai logo" />
                </span>
                <h1 className="header-title font-bold">
                    Persona AI
                </h1>
            </a>
        </div>
    );
}

export default Header;