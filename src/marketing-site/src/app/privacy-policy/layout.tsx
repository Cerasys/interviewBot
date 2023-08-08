import * as React from 'react';

export default function PolicyLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <section className='mx-10'>
            {children}
        </section>
    )
}