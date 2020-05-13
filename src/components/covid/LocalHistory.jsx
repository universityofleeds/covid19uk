import React, { useState } from 'react';
import { Checkbox } from 'baseui/checkbox';
import { schemeTableau10 } from 'd3-scale-chromatic';

import MultiLinePlot from '../Showcases/MultiLinePlot';
import MultiSelect from '../MultiSelect';
import './style.css';
import CustomSlider from './CustomSlider';
import BottomPanel from './BottomPanel';
// import REChartsMultiLine from '../Showcases/REChartsMultiLine';

export default React.memo((props) => {
  const [checked, setChecked] = useState(false);
  const [allDates, setAllDates] = useState(false);
  const [total, setTotal] = useState(false);

  const [{ geo, avg, geoHistory, 
    // rechartsData 
  }, setData] =
    useState({ geo: null, avg: null, geoHistory: null });
  const [filteredHistory, setFilteredHistory] = useState(null);

  const { dark, onSelectCallback, hintXValue, 
    type, totalCases = total, showBottomPanel } = props;
  // console.log(props.data);

  const measure = type === "countries" ?
  'dailyTotalDeathsByPop' : totalCases ? 'dailyConfirmedCasesByPop' : 'dailyTotalConfirmedCasesByPop';

  React.useEffect(() => {
    initialState({
      data: props.data.rates, setData, setFilteredHistory,
      type, allDates, measure
    });
    typeof showBottomPanel === 'function' &&
    showBottomPanel(<BottomPanel 
      history={
        props.data.rates.countries.E92000001.dailyConfirmedCasesByPop
    }/>)
  }, [type, totalCases, allDates])

  if (filteredHistory) {
    //list history
    let keys = Object.keys(filteredHistory); //.slice(0, shownGeos);
    if (!keys.includes('avg') && type !== "countries" && !checked) {
      filteredHistory.avg = avg;
      keys.push("avg")
    }
    // console.log(keys, filteredHistory);

    return (
      <>
        Infection rates history:
        <CustomSlider
          dates={filteredHistory[keys[0]].map(e => e.x)} 
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
          data={keys
            .map(e => filteredHistory[e]
              .slice(type !== "countries" ? filteredHistory[e].length - 40 : 0,
                filteredHistory[e].length))}
          legend={keys}
          title={type + ": " + measure +
            (type !== "countries" ? " vs avg." : "")}
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
          crosshair={true}
        />
        {
          type === "countries" ?
            <Checkbox
              checked={checked}
              onChange={e => {
                setChecked(e.target.checked)
                if (e.target.checked) {
                  const newFilter = {}
                  Object.keys(geoHistory).forEach(e => {
                    if (e !== "England") {
                      newFilter[e] = geoHistory[e];
                    }
                  });
                  setFilteredHistory(newFilter)
                } else {
                  setFilteredHistory(geoHistory);
                }
              }}
            >Hide England</Checkbox>
            :
            type === "utlas" && 
            <>
              <Checkbox
                checked={allDates}
                onChange={e => {
                  setAllDates(e.target.checked)
                }}
              >Dates vary (raw figures)</Checkbox>
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
  const geoHistory = {};
  //add average
  const avg = []; let m = allDates ? 0 : 1e10, utla, name;
  // find longest/shortest
  Object.keys(data[type]).map(e => {
    const cc = data[type][e][measure];
    if (cc && (allDates ? cc.length > m : cc.length < m)) {
      m = cc.length; utla = data[type][e]; name = data[type][e].name.value;
    }
  })

  //add Rechart style object
  const rechartsData = []
  utla[measure].map(v => {
    //e.date, e.value
    let y = v.value;
    const row = {}
    row.date = v.date;
    row[name] = y;
    //go through the rest and add values of same dates
    Object.keys(data[type]).map(e => {
      const cc = data[type][e][measure];
      if (!geoHistory[data[type][e].name.value]) {
        geoHistory[data[type][e].name.value] = [];
      }
      cc.map(ov => {
        if (utla.name !== data[type][e].name.value) {
          if (ov.date === v.date) {
            y += ov.value;
            geoHistory[data[type][e].name.value]
            .push({ x: v.date, y: ov.value })
            row[data[type][e].name.value] = ov.value;
          }
        } else {
          geoHistory[data[type][e].name.value]
            .push({ x: ov.date, y: ov.value })
        }
      })
    })
    avg.push({ 
      x: v.date, 
      y: Math.floor(y / Object.keys(data[type]).length) 
    })
    rechartsData.push(row)
  })
  const geo = Object.keys(geoHistory);

  setData({ geo, avg, geoHistory, rechartsData });
  setFilteredHistory(geoHistory);
}
