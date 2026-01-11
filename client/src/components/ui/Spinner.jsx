import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24, className }) => {
    return (
        <div className="flex justify-center items-center">
            <Loader2 size={size} className={`animate-spin text-primary ${className}`} />
        </div>
    );
};

export default Spinner;
