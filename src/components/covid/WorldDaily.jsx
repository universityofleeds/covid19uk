import React, { useState } from 'react';

import { Slider } from 'baseui/slider';
import MultiLinePlot from '../Showcases/MultiLinePlot';
import MultiSelect from '../MultiSelect';
// import { Table } from 'baseui/table';

export default React.memo((props) => {
  const { data, dark, onSelectCallback } = props;
  if(!data || data.length < 1000) return(null)
  
  const [country, setCountry] = useState("GBR"); //countryterritoryCode
  let today = {
    cases: 0, deaths: 0,
    newCases: 0, newDeaths: 0
  };
  let ch = []
  let countries = new Set()
  data.forEach(element => {
    const {day, month, cases, deaths,
      countryterritoryCode} = element.properties;
    countryterritoryCode && countries.add(countryterritoryCode)
    today.cases += +(cases);
    today.deaths += +(deaths);
    const d = new Date();
    if(day === d.getDate() && month === (d.getMonth()+1)) {
      today.newCases += cases;
      today.newDeaths += deaths;
      // console.log(element);
    }
    if(countryterritoryCode === country) {
      ch.push(element)
    }
  });
  ch = ch.reverse();
  const days = ch.length;
  
  const [countryHistory, setCountryHistory] = useState(ch);
  const [start, setStart] = useState(days - 30);
  const [end, setEnd] = useState(days + 1);
  const [value, setValue] = useState([days - 30, days]);
  const [increase, setIncrease] = useState([23]);

  let sliced = countryHistory.slice(0, days);
  if(end - start > 2 && start < countryHistory.length && 
    end <= countryHistory.length) {
    sliced = countryHistory.slice(start, end);
  }
  
  if(sliced.length === 0) {    
    setCountry("GBR")
  }

  const expGrowth = getGrowthRate(sliced, increase);
  return(
    <>
      <MultiSelect
        title={country}
        single={true}
        values={Array.from(countries).map(e => ({id:e, value:e}))}
        onSelectCallback={(selected) => {
          // array of seingle {id: , value: } object  
          setCountry(selected[0].value);
          const f = data.filter(e => 
            e.properties.countryterritoryCode === 
            selected[0].value).reverse()
          setCountryHistory(f);
          //chek if value/start/end are good
          if(start > f.length || end > f.length) {
            setValue([0, f.length]);
            setStart(0); 
            setEnd(f.length);
          }
          typeof onSelectCallback === 'function' &&
          selected[0] && onSelectCallback(selected[0].id)
        }}
      />
      <MultiLinePlot
        dark={dark}
        data={
          [sliced.map(e => ({x:e.properties.dateRep, 
            y:e.properties.cases})),
            sliced.map(e => ({x: e.properties.dateRep, 
              y: e.properties.deaths})),
            expGrowth
          ]
        } 
        legend={["DailyCases", "DailyDeath", increase + "%"]}
        title={"DailyVsDeaths"}
        plotStyle={{ height: 200, marginBottom: 60 }}
      />
      <Slider
        min={0} max={days}
        value={value}
        onChange={({value}) => {
          value && setValue(value);
          setStart(value[0]); 
          setEnd(value[1]);
        }}
      />
      "Increase %" <Slider
        min={1} max={100}
        value={[increase]}
        onChange={({value}) => {
          setIncrease([value])
        }}
      />
      {/* <Table 
        columns={Object.keys(today).slice(2,4)} 
        data={[Object.values(today).slice(2,4)]}/>
      <Table 
        columns={Object.keys(today).slice(0,2)} 
        data={[Object.values(today).slice(0,2)]}/> */}
    </>
  )
})
function getGrowthRate(sliced, increase) {
  const expGrowth = [{
    x: sliced[0].properties.dateRep,
    y: sliced[0].properties.cases
  }];
  for (let i = 1; i < sliced.length; i++) {
    const y = +(expGrowth[i - 1].y);
    expGrowth.push({
      x: sliced[i].properties.dateRep,
      y: (y + y * (increase[0] / 100)).toFixed(2)
    });
  }
  return expGrowth;
}

