import React, { useState } from 'react';

import { Slider } from 'baseui/slider';
import MultiLinePlot from '../Showcases/MultiLinePlot';

export default React.memo((props) => {
  const { data, dark, tests } = props;  
  if(!data || data.length <= 2 ) return(null)
  const daily = data.dailyTotalConfirmedCases;
  const days = daily.length-1; //daysDiff(daily[0].date, daily[daily.length-1].date)
  const [start, setStart] = useState(20);
  const [end, setEnd] = useState(days + 1);
  const [value, setValue] = useState([days - 30, days]);
  const [increase, setIncrease] = useState([22]);

  let sliced = daily.slice(0, days);
  let testsSliced = tests.slice(0, days)
  if(end - start > 2) {
    sliced = daily.slice(start, end);
    testsSliced = tests.slice(start, end);
  }
  const slicedMulti = [[],[],[],[]];
  for(let i = 0; i < sliced.length; i++) {
    slicedMulti[0][i] = {
      x: sliced[i].date,
      y: sliced[i].value
    }
    data.dailyConfirmedCases.forEach(e => {
      if(e.date === sliced[i].date) {
        slicedMulti[1][i] = {
          x: e.date,
          y: e.value
        }
      }
    })
    if(!slicedMulti[1][i]) {
      slicedMulti[1][i] = {
        x: sliced[i].date,
        y: 0
      }
    }
    data.dailyTotalDeaths.forEach(e => {
      if(e.date === sliced[i].date) {
        slicedMulti[2][i] = {
          x: e.date,
          y: e.value
        }
      }
    })
    if(!slicedMulti[2][i]) {
      slicedMulti[2][i] = {
        x: sliced[i].date,
        y: 0
      }
    }
    data.dailyDeaths.forEach(e => {
      if(e.date === sliced[i].date) {
        slicedMulti[3][i] = {
          x: e.date,
          y: e.value
        }
      }
    })
    if(!slicedMulti[3][i]) {
      slicedMulti[3][i] = {
        x: sliced[i].date,
        y: 0
      }
    }
  }
  // console.log(testsSliced);
  
  const expGrowth = [slicedMulti[0][0]];
  for (let i = 1; i < slicedMulti[0].length; i++) {
    const y = +(expGrowth[i - 1].y)
    expGrowth.push({
      x: slicedMulti[0][i].x,
      y: (y + y * (increase[0]/100)).toFixed(2)
    })
  }
  
  return(
    <>
      <MultiLinePlot
        dark={dark}
        data={
          [slicedMulti[1], slicedMulti[2], slicedMulti[3]]
        } legend={["DailyCases", "Death", "DailyDeaths"]}
        title={"DailyVsDeaths (England)"} noXAxis={true}
        plotStyle={{ height: 200, marginBottom: 10 }}
      />
      
      <MultiLinePlot
        dark={dark}
        data={
          [slicedMulti[0],
            testsSliced.map(e => ({ x: e.x, y: e.y / 10 })),
            expGrowth
          ]
        } legend={["Cases", "Tests", increase + "%"]}
        title={"CasesVsTests÷10"}
        plotStyle={{ height: 200, marginBottom:60 }} noLimit={true}
      />
      {daily[0].date + " to " + daily[days].date}
      <Slider
        min={0} max={days}
        value={value}
        onChange={({value}) => {
          if(value && (value[1] - value[0] > 2)) {
            setValue(value)
            setStart(value[0]); 
            setEnd(value[1]);
          }
        }}
        overrides={{
          MinValue: ({$min}) => data[0][$min].x
        }}
      />
      "Increase %"<Slider
        min={1} max={100}
        value={[increase]}
        onChange={({value}) => {
          setIncrease([value])
        }}
      />
    </>
  )
})
