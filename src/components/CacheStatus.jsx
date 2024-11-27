
import React from 'react';

const CacheStatus = ({ cacheStatus }) => {
  return (
    <div>
      <h2>Cache Status</h2>
      <pre>{JSON.stringify(cacheStatus, null, 2)}</pre>
    </div>
  );
};

export default CacheStatus;