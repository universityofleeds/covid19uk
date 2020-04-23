import React, { useState } from 'react';
// import { format } from 'd3-format';
import { Checkbox } from 'baseui/checkbox';
// import { RadioGroup, Radio } from "baseui/radio";
// import { VerticalBarSeries } from 'react-vis';
// import { Slider } from 'baseui/slider';
import { schemeTableau10 } from 'd3-scale-chromatic';

import MultiLinePlot from '../Showcases/MultiLinePlot';
import MultiSelect from '../MultiSelect';
import './style.css';

export default React.memo((props) => {
  const [minMax, setMinMax] = useState([200, 500]);
  const [checked, setChecked] = useState(false);
  const [{ geo, avg, geoHistory }, setData] =
    useState({ geo: null, avg: null, geoHistory: null });
  const [filteredHistory, setFilteredHistory] = useState(null);

  const { dark, onSelectCallback, hintXValue, type } = props;

  React.useEffect(() => {
    initialState(props.data, setData, setFilteredHistory, type);
  }, [type])

  if (filteredHistory) {
    //list history
    let keys = Object.keys(filteredHistory);    
    if (!keys.includes('avg') && type !== "countries" && !checked) {
      filteredHistory.avg = avg;
      keys.push("avg")
    }

    return (
      <>
        {geo.length > 10 && <MultiSelect
          dark={dark}
          title="Compare"
          values={
            (geo && geo.map(e =>
              ({ id: e, value: e }))) || []
          }
          onSelectCallback={(selected) => {
            // array of seingle {id: , value: } object
            // setList([...selected.map(e => e.id)]);
            if (selected.length) {
              const newFilter = {}
              selected.forEach(e => newFilter[e.id] = geoHistory[e.id]);
              setFilteredHistory(newFilter)
            } else {
              setFilteredHistory(geoHistory);
            }
            typeof onSelectCallback === 'function' &&
              onSelectCallback(selected)
          }}
        // single={true}
        />}
        {/* <Slider
            min={1} 
            max={}
            value={minMax}
            onChange={({ value }) => {
              if (value && value[0] < value[1]) {
                setMinMax(value);
              }
            }}
          /> */}
        <MultiLinePlot
          dark={dark}
          data={keys
            .map(e => filteredHistory[e]
              .slice(filteredHistory[e].length - 35, filteredHistory[e].length))}
          legend={keys}
          title={type + ": " + 'dailyTotalCases' + 
          (type !== "countries" && " vs avg.")}
          plotStyle={{
            // width: W, 
            marginBottom: 60
          }}
          noLimit={true}
          colors={keys.length <= 10 ?
            [...schemeTableau10.slice(0, keys.length - 1), "#f00"] :
            keys.map((e, i) => i === (keys.length - 1) ? '#f00' : '#777')
          }
          noLegend={keys.length > 10}
          hintXValue={(xValue) => typeof hintXValue === 'function' &&
            hintXValue(xValue)}
        />
        {
          type === "countries" &&
          <Checkbox
            checked={checked}
            onChange={e => {
              setChecked(e.target.checked)
              if(e.target.checked) {
                const newFilter = {}
                Object.keys(geoHistory).forEach(e => {
                  if(e !== "England") {
                    newFilter[e] = geoHistory[e];
                  }
                });
                setFilteredHistory(newFilter)
              } else {
                setFilteredHistory(geoHistory);
              }
            }}
          >Hide England</Checkbox>
        }
        <hr />
      </>
    );
  } else {
    return null
  }
});

function initialState(data, setData, setFilteredHistory, type = "utlas") {
  const geoHistory = {};
  const measure = type === "countries" ?
    'dailyTotalDeaths' : 'dailyTotalConfirmedCases';
  //add average
  const avg = []; let m = 0, utla;
  // find longest  
  Object.keys(data[type]).map(e => {
    const cc = data[type][e].dailyTotalConfirmedCases;
    if (cc && cc.length > m) {
      m = cc.length; utla = data[type][e];
    }
    geoHistory[data[type][e].name.value] =
      data[type][e][measure].map(v => ({ x: v.date, y: v.value }))
  })
  const geo = Object.keys(geoHistory);

  utla[measure].map(v => {
    //e.date, e.value
    let y = v.value;
    //go through the rest and add values of same dates
    Object.keys(data[type]).map(e => {
      const cc = data[type][e][measure];
      cc.map(ov => {
        if (utla.name !== data[type][e].name.value) {
          if (ov.date === v.date) {
            y += ov.value
          }
        }
      })
    })
    avg.push({ x: v.date, y: Math.floor(y / Object.keys(data[type]).length) })
  })

  setData({ geo, avg, geoHistory });
  setFilteredHistory(geoHistory);
}
