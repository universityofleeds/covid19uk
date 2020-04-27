import React, { useState } from 'react';
import {
  XYPlot, XAxis, YAxis, LineSeries, LineMarkSeries,
  Crosshair, DiscreteColorLegend
} from 'react-vis';
import { format } from 'd3-format';

import { shortenName } from '../../utils';
import { isNumber } from '../../JSUtils';

const W = 250;

/**
 * React Hook to generate a multi line plot. Requires: 
 * multi line data {data: [[{x:v,y:v},],[]]} object arrays and
 * maximum of 10 lines.
 * 
 * Note: options.legend must match order of options.data multi
 * dimensional array.
 * TODO: consider {data: {legend1: array, legend2: array}}
 * 
 * @param {Object} options 
 */
export default function MultiLinePlot(options) {
  const [hint, setHint] = useState();

  // if (!Array.isArray(options.data) ||
  //   options.data.length > 10) return null;

  const limit = 10;

  const { plotStyle, title, noXAxis, noYAxis,
    onValueClick, data, legend, colors, noLegend, hintXValue } = options;
  return options.data && options.data.length > 0 &&
    // https://github.com/uber/react-vis/issues/584#issuecomment-401693372
    <div className="unselectable" 
      style={{ 
        position: 'relative', 
      }}>
      {!options.noLimit &&
        options.data && options.data.length > limit &&
        <h4>Plotting first {limit} values:</h4>}
      {title &&
        <h4>{title}</h4>
      }
      <XYPlot xType="ordinal"
        margin={{ bottom: (plotStyle && plotStyle.marginBottom) || 40 }} // default is 40
        animation={{ duration: 1 }}
        height={(plotStyle && plotStyle.height) || W}
        width={(plotStyle && plotStyle.width) || W}
        onMouseLeave={() => { 
          setHint(false);
          typeof hintXValue === 'function' &&
              hintXValue(false)
        }}
      >
        {!noXAxis && // if provided dont
          <XAxis
            tickSize={0}
            tickFormat={v => shortenName(v, 10)}
            tickValues={[data[0][0].x.replace("2020-", ""), data[0][data[0].length-1].x]}
            tickLabelAngle={-65} 
            style={{
              line: { strokeWidth: 0 },
              text: { fill: options.dark ? '#fff' : '#000' } 
            }} />}
        {!noYAxis && // if provided dont
          <YAxis
            tickSize={0}
            tickLabelAngle={-45} tickFormat={v => format(".2s")(v)} style={{
              line: { strokeWidth: 0 },
              title: { fill: options.dark ? '#fff' : '#000' },
            }} position="end" />
        }
        {data.map((line, i) =>
          <LineSeries
            key={"line-" + i}
            onValueClick={onValueClick}
            onNearestX={(_, { index }) => {
              setHint(data.map(d => d[index]))
              // console.log(data[0][index].x);
              typeof hintXValue === 'function' &&
              hintXValue(data[0][index].x)
            }}
            style={{ fill: 'none' }}
            data={line} 
            color={colors && colors[i]} />)}
        {options.crosshair &&
          <Crosshair
            color= '#f00'
            values={[{x:"2020-03-23", y: 1}]}
            > 
            <div style={{
                color: options.dark ? '#fff' : '#000'
              }}>
              <b>Lockdown</b>
            </div>
          </Crosshair>
        }
        {hint && 
        <Crosshair
          values={hint}
        > 
          <div style={{
              color: options.dark ? '#fff' : '#000'
            }}>
            <b>{hint[0] && hint[0].x}</b><br/>
            {
              legend.length < 11 ? 
              legend.map((e, i) => e + ": " + 
              ((hint[i] && hint[i].y) || "") + " ") :
              "Total: " + hint.reduce((total, next) => isNumber(total) ?
              total + (next ? next.y : 0) : (total ? total.y : 0) + (next ? next.y : 0))
            }
          </div>
        </Crosshair>}
      </XYPlot>
      {!noLegend && <DiscreteColorLegend
        orientation="horizontal"
        items={legend} 
        colors={colors}/>}
    </div>;
}