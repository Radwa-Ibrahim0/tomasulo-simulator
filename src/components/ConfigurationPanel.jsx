// components/ConfigurationPanel.js
import React from 'react';

function ConfigurationPanel({ config, setConfig }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: parseInt(value, 10) });
  };

  return (
    <div>
      <h2>Configuration</h2>
      <label>
        FP Add Latency:
        <input
          type="number"
          name="fpAddLatency"
          value={config.fpAddLatency}
          onChange={handleChange}
        />
      </label>
      {/* Add similar inputs for other configuration options */}
    </div>
  );
}

export default ConfigurationPanel;