"use client"
import React, { useState } from 'react';
import Image from 'next/image';

interface GuideCardProps {
    title: string;
    content: string;
}

export default function GuideCard({ title, content }: GuideCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="text-xl font-semibold">{title}</h3>
                <Image 
                    src={`/icons/${isExpanded ? 'hideArrow' : 'showArrow'}.svg`} 
                    alt={isExpanded ? 'Hide' : 'Show'}
                    width={20}
                    height={20}
                />
            </div>
            {isExpanded && (
                <div className="mt-4 text-gray-600 whitespace-pre-line">
                    {content}
                </div>
            )}
        </div>
    );
};