import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { HiStar } from 'react-icons/hi2';
import {ControllerRenderProps} from 'react-hook-form'

interface Props extends ControllerRenderProps {}

const Rating = (props: Props) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const {onChange} = props;

  const handleMouseEnter = (value: any) => {
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleClick = (value: any) => {
    setRating(value);
    onChange(value)
  };

  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="">
        <Popover>
        <PopoverTrigger>
            <div className='flex gap-2'>
            {stars.map((value) => (
                <HiStar
                key={value}
                style={{
                    width: 26,
                    height: 26,
                    color: value <= (hoveredRating || rating) ? '#5957E9' : '#182441',
                    cursor: 'pointer',
                }}
                onMouseEnter={() => handleMouseEnter(value)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(value)}
                />
            ))}
            </div>
        </PopoverTrigger>
        </Popover>
    </div>
  );
};

export default Rating;