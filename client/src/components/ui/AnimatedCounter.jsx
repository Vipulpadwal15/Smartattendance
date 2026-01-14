import React from 'react';
import CountUp from 'react-countup';

const AnimatedCounter = ({
    value = 0,
    duration = 2,
    suffix = '',
    prefix = '',
    decimals = 0,
    className = ''
}) => {
    return (
        <CountUp
            end={value}
            duration={duration}
            suffix={suffix}
            prefix={prefix}
            decimals={decimals}
            className={className}
            separator=","
            useEasing={true}
            easingFn={(t, b, c, d) => {
                // easeOutExpo
                return c * (-Math.pow(2, -10 * t / d) + 1) + b;
            }}
        />
    );
};

export default AnimatedCounter;
