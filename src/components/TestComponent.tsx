import React, { useState } from 'react';

export const TestComponent = (): React.ReactElement => {
  const [count, setCount] = useState(0);

  return (
    <div className="test-component">
      <h1>React Test Component</h1>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};
