
import React from 'react';

const LoadStoreBuffers = ({ buffers }) => {
  return (
    <div>
      <h2>Load/Store Buffers</h2>
      <pre>{JSON.stringify(buffers, null, 2)}</pre>
    </div>
  );
};

export default LoadStoreBuffers;