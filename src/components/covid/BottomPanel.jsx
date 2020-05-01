import React, { useState } from 'react';
import {
  BarChart, Bar, Brush,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default React.memo((props) => {
  const { filteredHistory } = props;

  if (!filteredHistory) return null;

  return (<BarChart width={window.innerWidth - 460} height={100}
    data={filteredHistory.avg.map(e => ({ x: e.x, avg: e.y }))}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="x" />
    <YAxis />
    <Tooltip content={(props) => {
      const { active } = props;
      if (active) {
        const { payload, label } = props;
        return (
          <>
            <p>{`${label}, avg: ${payload[0].value}`}</p>
          </>)
      }
    }} />
    {/* <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} /> */}
    <Brush dataKey='x' height={15} stroke="#a43" />
    <Bar dataKey="avg" fill="#a43" />
  </BarChart>)
})