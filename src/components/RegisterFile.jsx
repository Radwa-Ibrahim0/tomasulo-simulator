// components/RegisterFile.js
import React from 'react';

function RegisterFile({ registerFile }) {
  return (
    <div>
      <h2>Register File</h2>
      <table>
        <thead>
          <tr>
            <th>Register</th>
            <th>Value</th>
            <th>Qi</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(registerFile).map(([reg, { value, qi }]) => (
            <tr key={reg}>
              <td>{reg}</td>
              <td>{value}</td>
              <td>{qi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RegisterFile;