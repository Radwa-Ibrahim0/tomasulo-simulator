
import React from 'react';

const CommonDataBus = ({ data }) => {
  return (
    <div>
      <h2>Common Data Bus</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default CommonDataBus;