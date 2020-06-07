import React from 'react';
import {
  BarChart, Bar, Brush,
  XAxis, YAxis, Tooltip, Legend
} from 'recharts';

import { useWindowSize } from '../../utils';

export default React.memo((props) => {
  const [width] = useWindowSize();
  const { history, dark } = props;
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
        <Legend align="left" layout="vertical"/>
        <XAxis dataKey="x" stroke={dark ? '#fff' : '#000'}/>
        <YAxis stroke={dark ? '#fff' : '#000'}/>
        <Tooltip content={(props) => {
          const { active } = props;
          if (active) {
            const { payload, label } = props;            
            return (
              <>
                <p>{`${label} - ${key}: ${payload[0].value}, 
                ${key2}: ${payload[1].value}`}</p>
              </>)
          }
        }} />
        {/* <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} /> */}
        <Brush dataKey='x' height={10} stroke="rgb(18,147,154)" />
        <Bar dataKey={key2} fill="rgb(121,199,227)" />
        <Bar dataKey={key} fill="rgb(18,147,154)" />

      </BarChart>
    </>
  )
})