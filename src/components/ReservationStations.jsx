import React from 'react';

const ReservationStations = ({ stations }) => (
    <table>
      <thead>
        <tr>
          <th>Station</th>
          <th>Busy</th>
          <th>Op</th>
          <th>Vj</th>
          <th>Vk</th>
          <th>Qj</th>
          <th>Qk</th>
        </tr>
      </thead>
      <tbody>
        {stations.map((station, index) => (
          <tr key={index}>
            <td>{station.name}</td>
            <td>{station.busy ? "Yes" : "No"}</td>
            <td>{station.op || "-"}</td>
            <td>{station.Vj || "-"}</td>
            <td>{station.Vk || "-"}</td>
            <td>{station.Qj || "-"}</td>
            <td>{station.Qk || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  export default ReservationStations;
