import React from 'react';

const QuickActions = ({ onIncrement, onDecrement, locationLabel }) => {
    return (
        <div className="mt-4">
            <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">Quick Edit at {locationLabel}</span>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onDecrement}
                    className="flex-1 bg-red-100 text-red-600 border border-red-200 p-4 rounded-xl text-2xl font-bold active:bg-red-200 active:scale-95 transition-transform"
                >
                    - 1
                </button>
                <button
                    onClick={onIncrement}
                    className="flex-1 bg-green-100 text-green-600 border border-green-200 p-4 rounded-xl text-2xl font-bold active:bg-green-200 active:scale-95 transition-transform"
                >
                    + 1
                </button>
            </div>
        </div>
    );
};

export default QuickActions;
