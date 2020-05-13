import React, { useState } from 'react';
import {
  BarChart, Bar, Brush,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

import { useWindowSize } from '../../utils';

export default React.memo((props) => {
  const [width] = useWindowSize();
  const { history } = props;
  const key = "rate";

  if (!history) return null;

  return (
    <>
      England infection daily infection rates (per 100k population)
      <BarChart width={width - 460} height={100}
        data={history.map(e => ({ x: e.date, [key]: e.value }))}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip content={(props) => {
          const { active } = props;
          if (active) {
            const { payload, label } = props;
            return (
              <>
                <p>{`${label}, ${key}: ${payload[0].value}`}</p>
              </>)
          }
        }} />
        {/* <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} /> */}
        <Brush dataKey='x' height={15} stroke="#a43" />
        <Bar dataKey={key} fill="#a43" />
      </BarChart>
    </>
  )
})