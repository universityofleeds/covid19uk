import * as helpers from '@turf/helpers';
import xmlToJSON from 'xmltojson';

import { isArray } from "../../JSUtils";
import { fetchData } from '../../utils';
import { COLS } from '../../Constants';

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const countryHistory = (data, by = "cases", min = 200, max=500, 
list) => {
  if(!data || data.length === 0) return null;
  
  const map = {}
  data.forEach(feature => {
    const location = feature.properties["countryterritoryCode"];
    const what = feature.properties[by];
    if (location !== null && feature.properties.dateRep) {
      if (isArray(map[location])) {
        map[location].push({x: feature.properties.dateRep, y: what})
      } else {
        map[location] = [{x: feature.properties.dateRep, y: what}]
      }
    }
  });
  const topx = {}
  Object.keys(map).forEach(country => {
    const l = map[country].length;  
      
    if((map[country][0].y > min && map[country][0].y < max) ||
    (list && list.includes(country))) {
      // most recent first
      topx[country] = map[country].reverse()
      // last 21 days
      .slice(l - 21 < 0 ? 0 : (l - 21), l - 1)
    }
  });
  // console.log(topx);
  
  return topx;
}

const breakdown = (data, by = "cases") => {
  if(!data || data.length === 0) return null;
  
  const map = {}
  data.forEach(feature => {
    const location = feature.properties["countryterritoryCode"];
    const cases = feature.properties[by];
    if (location) {
      if (map[location]) {
        map[location] = map[location] + cases
      } else {
        map[location] = typeof cases === 'number' ? +(cases) : cases
      }
    }
  });
  return map;
}

const daysDiff = (s, e) => {
  const start = new Date(s);
  const end = new Date(e);  
  let diff = end.getTime() - start.getTime();
  diff = diff / (1000 * 3600 * 24);
  return diff;
}

const generateMultipolygonGeojsonFrom = (geometries, properties, callback) => {  
  if(!geometries || !properties || !isArray(geometries) ||
  !isArray(properties)) return;
  if(geometries.length !== properties.length) {
    typeof callback === 'function' &&
    callback(undefined, "geometries and properties must be equal.")
  }  
  let collection = [];
  //
  for (let index = 0; index < geometries.length; index++) {
    let polygon = geometries[index]; //just in case too large for forEach.    
    const line = helpers.multiPolygon(
      polygon
      , //properties next
      properties[index]
    )        
    collection.push(line);       
  }  
  collection = helpers.featureCollection(collection);
  // console.log(collection);
  
  typeof callback === 'function' &&
    callback(collection)
}

const assembleGeojsonFrom = (geojson, history, date, type = "utlas") => {
  if(!geojson || !history || !geojson.features ||
    !isArray(geojson.features) ||
    !geojson.features.length) return;
  const gj = {
    type: 'FeatureCollection',
    features: []
  };
  const measure = type === "countries" ?
  'dailyTotalDeathsByPop' : 'dailyConfirmedCasesByPop';

  geojson.features.forEach(f => {
    Object.keys(history.rates[type]).forEach(each => {      
      if(f.properties.ctyua19cd === each || 
        f.properties.ctry19cd === each ||
        f.properties.rgn18cd === each ||
        f.properties.lad19cd === each) {
        let totalCasesByPop = history.rates[type][each].totalCasesByPop.value;
        if(date) {
          history.rates[type][each][measure].forEach(e => {   
            if(e.date === date) {
              totalCasesByPop = e.value
            }
          })
        }
        const feature = {type: "Feature"};
        // gj.features[i].properties = history[each];
        feature.geometry = f.geometry;
        feature.properties = {
          ctyua19cd: each,
          name: history[type][each].name.value,
          totalCasesByPop
        }
        if(history[type][each].totalCases &&
          history.rates[type][each].population) {
          feature.properties.totalCases = 
          history[type][each].totalCases.value
          feature.properties.population = 
          numberWithCommas(history.rates[type][each].population.value)
        }
        if(date) {
          feature.properties.date = date;
        }
        gj.features.push(feature);
      }
    })
  })
  return(gj);
}
const getLatestBlobFromPHENew = (callback) => {  
  const cdn = "https://c19downloads.azureedge.net/downloads/data/"
  // https://c19pub.azureedge.net/assets/population/population.json
  fetchData(cdn + "utlas_latest.json", (utlas, e) => {
    !e && fetchData(cdn + "ltlas_latest.json", (ltlas, ee) => {
      !ee && fetchData(cdn + "countries_latest.json", (countries, eee) => {
        !eee && fetchData(cdn + "landing.json", (landing, eeee) => {
          !eeee && fetchData(cdn + "regions_latest.json", (regions, eeeee) => {
            !eeeee && fetchData(
              "https://c19pub.azureedge.net/assets/population/population.json", 
              (population, error) => {
              if(!error) {
                const data = Object.assign(landing, {utlas: utlas}, 
                  {ltlas: ltlas}, {countries: countries}, {pop: population},
                  {regions: regions});
                // add rates
                // console.log(data);
                const rates = generateRates(data, population);
                // console.log(rates);
                typeof callback === 'function' &&
                callback(Object.assign(data, {rates: rates}))
              }
            })
          })
        })        
      })
    })    
  })
}
const getLatestBlobFromPHE = (callback) => {
  fetch('https://publicdashacc.blob.core.windows.net/publicdata?restype=container&comp=list') 
  .then((response) => response.text())
  .then((response) => {
    // console.log(response);
    const jsonData = xmlToJSON.parseString(response);
    const blobList = jsonData.EnumerationResults[0].Blobs[0].Blob;

    const getBlobDate = b => new Date(b.Properties[0]['Last-Modified'][0]._text);
    console.log(getBlobDate());
    
    const mostRecentBlob = blobList.reduce((acc, cur) => {
      if (!cur.Name[0]._text.startsWith('data_')) {
        return acc;
      }
      if (!acc) {
        return cur;
      }
      return (getBlobDate(acc) > getBlobDate(cur)) ? acc : cur;
    }, null);
    // console.log(mostRecentBlob.Name[0]._text);
    typeof(callback) === 'function' &&
    callback(mostRecentBlob.Name[0]._text);
  })
  .catch((error) => {
    console.error(error);
  });
}

function rollingavg(data, type, measure) {
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }
  const rechartsData = [];
  const geoHistory = {};
  const avg = [];
  for (let date = new Date("2020-02-24"); date < new Date(); date = date.addDays(7)) {
    const row = {};
    let a = 0;
    row.date = date.getFullYear() + "-" +
      (date.getMonth() + 1).toString().padStart(2, '0') + 
      "-" + date.getDate();
    //go through each
    Object.keys(data[type]).forEach(e => {
      const cc = data[type][e][measure];
      if (!geoHistory[data[type][e].name.value]) {
        geoHistory[data[type][e].name.value] = [];
      }
      let y = 0;
      cc.forEach(ov => {
        if (new Date(ov.date) >= date &&
          new Date(ov.date) < date.addDays(7)) {
          y += ov.value;
        }
      });
      const r7a = +((y / 7).toFixed(2));
      a += r7a;
      geoHistory[data[type][e].name.value]
        .push({ x: row.date, y: r7a });
      row[data[type][e].name.value] = r7a;
    });
    rechartsData.push(row);
    avg.push({
      x: row.date,
      y: Math.floor(a / Object.keys(data[type]).length)
    });
  }
  return { geoHistory, avg, rechartsData };
}

function historyByOneArea(options) {
  const { data, type = "utlas", 
  allDates, measure } = options;
  const geoHistory = {};
  //add average
  const avg = [];
  let m = allDates ? 0 : 1e10, utla, name;
  // find longest/shortest
  Object.keys(data[type]).map(e => {
    const cc = data[type][e][measure];
    if (cc && (allDates ? cc.length > m : cc.length < m)) {
      m = cc.length;
      utla = data[type][e];
      name = data[type][e].name.value;
    }
  });
  //add Rechart style object
  const rechartsData = [];
  utla[measure].map(v => {
    //e.date, e.value
    let y = v.value;
    const row = {};
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
              .push({ x: v.date, y: ov.value });
            row[data[type][e].name.value] = ov.value;
          }
        }
        else {
          geoHistory[data[type][e].name.value]
            .push({ x: ov.date, y: ov.value });
        }
      });
    });
    avg.push({
      x: v.date,
      y: Math.floor(y / Object.keys(data[type]).length)
    });
    rechartsData.push(row);
  });
  return { geoHistory, avg, rechartsData };
}
 
export {
  generateMultipolygonGeojsonFrom,
  getLatestBlobFromPHENew,
  getLatestBlobFromPHE,
  assembleGeojsonFrom,
  historyByOneArea,
  countryHistory,
  rollingavg,
  breakdown,
  daysDiff
}

function generateRates(data, population) {
  const rates = {};
  ['utlas', 'ltlas', 'countries', 'regions'].forEach(area => {
    rates[area] = {}
    function toFixedAndNumber(str) {return +(str.toFixed(2))}
    Object.keys(data[area]).forEach(code => {      
      if (population[code] && code !== 'metadata') {
        rates[area][code] = {}
        rates[area][code].totalCasesByPop = {
          value: toFixedAndNumber(data[area][code].totalCases.value / population[code] * 1e5)
        };
        rates[area][code].name = {
          value: data[area][code].name.value
        }
        function dailyOrTotal(what) { 
          const dailyOrTotal = what.replace("ByPop", "");
          if(data[area][code][dailyOrTotal]) {
            data[area][code][dailyOrTotal].forEach(day => {
              if(!rates[area][code][what]) {
                rates[area][code][what] = []
              }
              rates[area][code][what].push({
                date: day.date,
                value: toFixedAndNumber(day.value / population[code] * 1e5) 
              })
            })
          }
        }
        if(area === 'countries') {
          COLS.slice(0,2).forEach(v => dailyOrTotal(v))
          if(code === 'E92000001') { // England
            COLS.slice(2,4).forEach(v => dailyOrTotal(v))
          }
        } else {
          COLS.slice(2,4).forEach(v => dailyOrTotal(v))
        }
      }
    });
  })  
  return(rates)
}
