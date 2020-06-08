import React, { useState } from 'react';
import { Checkbox } from 'baseui/checkbox';
import { schemeTableau10 } from 'd3-scale-chromatic';

import MultiLinePlot from '../Showcases/MultiLinePlot';
import MultiSelect from '../MultiSelect';
import './style.css';
import CustomSlider from './CustomSlider';
import BottomPanel from './BottomPanel';
import {rollingavg} from './utils';

// import REChartsMultiLine from '../Showcases/REChartsMultiLine';

export default React.memo((props) => {
  const [allDates, setAllDates] = useState(false);
  const [total, setTotal] = useState(false);

  const [{ geo, avg, geoHistory, 
    // rechartsData 
  }, setData] =
    useState({ geo: null, avg: null, geoHistory: null });
  const [filteredHistory, setFilteredHistory] = useState(null);

  const { dark, onSelectCallback, hintXValue, hoveredObject, 
    type, totalCases = total, showBottomPanel } = props;

  // console.log(code && geoHistory[code]);

  const measure = type === "countries" ?
  'dailyTotalDeathsByPop' : totalCases ? 'dailyConfirmedCasesByPop' : 'dailyTotalConfirmedCasesByPop';

  React.useEffect(() => {
    const name = hoveredObject &&  
    hoveredObject.properties[Object.keys(hoveredObject.properties)[1]];
    if(filteredHistory) {
      if(name) {
        setFilteredHistory([geoHistory[name]])
      } else {
        setFilteredHistory(geoHistory)
      }
    }
  }, [hoveredObject])
  
  React.useEffect(() => {
    initialState({
      data: props.data.rates, setData, setFilteredHistory,
      type, allDates, measure
    });
    typeof showBottomPanel === 'function' &&
    showBottomPanel(<BottomPanel  dark={dark}
      history={
        [props.data.rates.countries.E92000001.dailyConfirmedCasesByPop,
          props.data.rates.countries.E92000001.dailyDeathsByPop]
    }/>)
  }, [type, totalCases, allDates])

  if (filteredHistory) {
    //list history
    let keys = Object.keys(filteredHistory); //.slice(0, shownGeos);
    if (!keys.includes('avg') && type !== "countries") {
      filteredHistory.avg = avg;
      keys.push("avg")
    }
    // console.log(keys, filteredHistory);

    return (
      <>
        Infection rates history:
        <CustomSlider
          dates={keys && keys[1] && filteredHistory &&
            filteredHistory[keys[1]].map(e => e.x)} 
          callback={(date) => {
            typeof hintXValue === 'function' &&
            hintXValue(date)
          }}/>
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
        {/* <REChartsMultiLine 
        history={rechartsData} keys={keys}
        /> */}
        <MultiLinePlot
          dark={dark}
          data={keys.map(e => filteredHistory[e])}
          legend={keys}
          title={type + ": " + measure +
            (type !== "countries" ? " vs avg." : "")}
          plotStyle={{
            // width: W, 
            marginBottom: 60
          }}
          noLimit={true}
          colors={keys.length <= 10 ?
            [...schemeTableau10.slice(0, keys.length - 1), dark ? '#fff' : '#000'] :
            keys.map((e, i) => i === (keys.length - 1) ? dark ? '#fff' : '#000' : '#777')
          }
          noLegend={keys.length > 10}
          hintXValue={(xValue) => typeof hintXValue === 'function' &&
            hintXValue(xValue)}
          crosshair={true}
        />
        {
            <>
              {/* <Checkbox
                checked={allDates}
                onChange={e => {
                  setAllDates(e.target.checked)
                }}
              >Dates vary (raw figures)</Checkbox> */}
              <Checkbox
                checked={total}
                onChange={e => {
                  setTotal(e.target.checked)
                }}
              >Daily cases</Checkbox>
            </>
        }
        <hr />
        
      </>
    );
  } else {
    return null
  }
});

function initialState(options) {
  const { data, setData, setFilteredHistory,
    type = "utlas", allDates, measure } = options
  const {geoHistory, avg, rechartsData} = rollingavg(data, type, measure)
  const geo = Object.keys(geoHistory);

  setData({ geo, avg, geoHistory, rechartsData });
  setFilteredHistory(geoHistory);
}
