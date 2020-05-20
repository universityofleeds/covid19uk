import React, { useState } from 'react';
import {
  BarChart, Bar, Brush,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

import { useWindowSize } from '../../utils';

export default React.memo((props) => {
  const [width] = useWindowSize();
  const { history } = props;
  const key = "cases";
  const key2 = "deaths"; 

  if (!history) return null;
  const data = history[0].map(e => ({ 
    x: e.date, 
    [key]: e.value, 
    [key2]: history[1].find(ee => ee.date === e.date) &&
    history[1].find(ee => ee.date === e.date).value
  }))
  
  return (
    <>
      England daily infection and deaths rates (per 100k population)
      <BarChart width={width - 460} height={100}
        barGap={1}
        data={
          data.slice(26,data.length)
        }>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip content={(props) => {
          const { active } = props;
          if (active) {
            const { payload, label } = props;            
            return (
              <>
                <p>{`${label}, ${key}: ${payload[0].value}, 
                ${key2}: ${payload[1].value}`}</p>
              </>)
          }
        }} />
        {/* <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} /> */}
        <Brush dataKey='x' height={10} stroke="#a43" />
        <Bar dataKey={key} fill="#a43" />
        <Bar dataKey={key2} fill="rgb(18,147,156)" />

      </BarChart>
    </>
  )
})