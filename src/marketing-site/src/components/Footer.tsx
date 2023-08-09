import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="p-6 h-[60px] bg-gradient-to-b from-transparent to-white">
            <hr className="mb-4 border-t border-gray-200" />
            <div className="container pb-1 mx-auto text-center">
                <div>&copy; {new Date().getFullYear()} Persona AI Inc. All rights reserved.</div>
                <div className="my-3 flex justify-center space-x-1">
                    <a href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</a> 
                    {/* <span>|</span>
                    <a href="/terms-of-service" className="text-blue-500 hover:underline">Terms of Service</a> */}
                </div>
            </div>
        </footer>
    );
}

export default Footer;
