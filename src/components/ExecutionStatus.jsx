
import React from 'react';

const ExecutionStatus = ({ status }) => {
  return (
    <div>
      <h2>Execution Status</h2>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
};

export default ExecutionStatus;