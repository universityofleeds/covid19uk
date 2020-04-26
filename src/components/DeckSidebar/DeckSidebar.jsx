import React from 'react';
import {
  Tabs, Tab, FormGroup, InputGroup,
  FormControl, Glyphicon
} from 'react-bootstrap';

import './DeckSidebar.css';
import MapboxBaseLayers from '../MapboxBaseLayers';
import {
  xyObjectByProperty, percentDiv,
  searchNominatom,
  humanize, generateLegend, sortNumericArray
} from '../../utils';
import Variables from '../Variables';
import RBAlert from '../RBAlert';
import { propertyCount } from '../../geojsonutils';
import { LAYERSTYLES, LIDA } from '../../Constants';
import ColorPicker from '../ColourPicker';
import Modal from '../Modal';
import DataTable from '../Table';

import { yearSlider } from '../Showcases/Widgets';
import { crashes_plot_data } from '../Showcases/Plots';
import { isNumber } from '../../JSUtils';
import MultiSelect from '../MultiSelect';
import Daily from '../covid/Daily';
import WorldDaily from '../covid/WorldDaily';
import SwitchData from '../covid/SwitchData';

import LocalHistory from '../covid/LocalHistory';

export default class DeckSidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      radius: 100,
      elevation: 4,
      year: "",
      reset: false,
      multiVarSelect: {},
      barChartVariable: "TotalCases",
      datasetName: props.datasetName
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data, alert, loading, datasetName, tests, historyData } = this.props;
    const { elevation, radius, reset,
      barChartVariable } = this.state;
    // avoid rerender as directly
    if (reset !== nextState.reset ||
      elevation !== nextState.elevation ||
      radius !== nextState.radius ||
      alert !== nextProps.alert ||
      loading !== nextProps.loading ||
      barChartVariable !== nextState.barChartVariable ||
      datasetName !== nextProps.datasetName ||
      tests !== nextProps.tests||
      historyData !== nextProps.historyData) return true;
    //TODO:  a more functional way is needed        
    if (data && nextProps && nextProps.data &&
      JSON.stringify(data) === JSON.stringify(nextProps.data)) {
      return false
    }
    return true;
  }

  /**
   * Render the sidebar empty if no data is loaded.
   * Partly because we like to load from a URL.
   */
  render() {
    const { year, datasetName, 
      multiVarSelect, barChartVariable } = this.state;
    const {
      onSelectCallback, data, colourCallback, tests, historyData,
      urlCallback, alert, onlocationChange, column, dark, 
      toggleOpen } = this.props;
    let plot_data = [];
    let plot_data_multi = [[], []];
    const notEmpty = data && data.length > 1;
    plot_data = crashes_plot_data(notEmpty, data, plot_data, plot_data_multi);
    const severity_data = propertyCount(data, "accident_severity");
    let columnDomain = [];
    const columnData = notEmpty ?
      xyObjectByProperty(data, column || barChartVariable) : [];
    const geomType = notEmpty && data[0].geometry.type.toLowerCase();
    // console.log(regions);
    const type = datasetName.split("/")[datasetName.split("/").length-1]
    .replace(".geojson", "");
    if (notEmpty && column && (geomType === 'polygon' ||
      geomType === 'multipolygon' || "linestring") &&
      isNumber(data[0].properties[column])) {
      // we dont need to use generateDomain(data, column)
      // columnData already has this in its x'es
      columnDomain = columnData.map(e => e.x);
      // we will just sort it        
      columnDomain = sortNumericArray(columnDomain);
      // console.log(columnDomain);

      this.props.showLegend(
        generateLegend(
          {
            domain: columnDomain,
            title: 'Daily cases'
          }
        )
      );
    }
    const resetState = (urlOrName, reset = true) => {
      this.setState({
        reset: reset,
        year: "",
        multiVarSelect: {},
        barChartVariable: "TotalCases",
        datasetName: urlOrName || this.state.datasetName
      })
    }
    return (
      <>
        <div
          style={{
            color: dark ? "white" : "black",
            background: dark ? "#242730" : "white"
          }}
          className="side-panel">
          <RBAlert alert={alert} />
          <div
            style={{
              background: dark ? '#29323C' : '#eee'
            }}
            className="side-pane-header">
            <h4>
              {console.log(historyData && historyData)}
            {
              //if specific region shown, show its count
              multiVarSelect.name && multiVarSelect.name.size === 1 ?
                  data[0].properties.totalCases + " cases"
                : multiVarSelect.name && multiVarSelect.name.size > 1 ?
                data.reduce((t, next) =>
                      isNumber(t) ? t + +(next.properties.totalCases) :
                        +(t.properties.totalCases) + +(next.properties.totalCases)) + " cases"
                :
                (historyData && historyData.overview && !datasetName.endsWith("covid19w")) ?
                <>
                  {
                    historyData.overview.K02000001.totalCases.value + " cases, "                    
                  }
                  <span style={{color: "red"}}>
                    {
                      historyData.overview.K02000001.deaths.value + " deaths"
                    }
                  </span>
                </>
                :
                data && data.length ?
                    data && data.length && data[0].properties.cases &&
                    data.reduce((t, next) =>
                      isNumber(t) ? t + +(next.properties.cases) :
                        +(t.properties.cases) + +(next.properties.cases)) + " cases"
                    : "Nothing to show"
            }
            </h4>
          </div>
          <div>
            {historyData && historyData.overview && !datasetName.endsWith("covid19w") && 
            `updated: ${new Date(historyData.lastUpdatedAt).toLocaleDateString()}, `}
            {/* data */}
            data from {datasetName.endsWith("covid19w") ? 
            <a href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases">ECDC</a> :
            <a href="https://coronavirus.data.gov.uk/">PHE</a>} 
            <br />
            <SwitchData onSelectCallback={(url) => {
              if(datasetName === url || 
                datasetName.endsWith(url)) return;
              resetState(url);
              typeof (urlCallback) === 'function'
                && urlCallback(url);
            }} />
            <Modal
              toggleOpen={() => typeof toggleOpen === 'function' && toggleOpen()}
              component={<DataTable data={data} />} />
          </div>
          <div className="side-panel-body">
            <div className="side-panel-body-content">
              {/* <DateSlider data={yy} multiVarSelect={multiVarSelect}
                  onSelectCallback={(changes) => console.log(changes)} 
                  callback={(changes) => console.log(changes)}/> */}
              {/* range of two values slider is not native html */
                yearSlider({
                  data, year, multiVarSelect,
                  // for callback we get { year: "",multiVarSelect }
                  onSelectCallback, callback: (changes) => this.setState(changes)
                })
              }
              {/* TODO: generate this declaritively too */}
              {
                severity_data && severity_data.map(each =>
                  percentDiv(each.x, 100 * each.y / data.length, () => {
                    if (multiVarSelect && multiVarSelect['accident_severity'] &&
                      multiVarSelect['accident_severity'].has(each.x)) {
                      delete multiVarSelect['accident_severity'];
                    } else {
                      multiVarSelect['accident_severity'] = new Set([each.x]);
                      this.setState({ multiVarSelect })
                    }
                    onSelectCallback &&
                      onSelectCallback(Object.keys(multiVarSelect).length === 0 ?
                        { what: '' } : { what: 'multi', selected: multiVarSelect })
                  }, dark))
              }
              <hr style={{ clear: 'both' }} />
              {historyData && !datasetName.endsWith("covid19w") &&
              <LocalHistory data={historyData} dark={dark} 
              type={type}
              onSelectCallback={(selected) => {
                // array of seingle {id: , value: } object
                if (selected[0]) {
                  multiVarSelect['name'] = new Set(selected.map(e => e.id))
                } else {
                  if (multiVarSelect.name) delete multiVarSelect.name;
                }
                this.setState({
                  multiVarSelect
                })
                typeof onSelectCallback === 'function' &&
                  onSelectCallback({
                    what: 'multi',
                    selected: multiVarSelect
                  });
              }} 
              hintXValue={(xValue) => {
                // update map on crosshair xvalue
                if(typeof onSelectCallback === 'function' &&
                xValue !== this.state.xValue) {
                  onSelectCallback({
                    what: 'multi',
                    hint: xValue,
                    selected: multiVarSelect
                  });
                  this.setState({xValue})
                }
              }}/> }
              {historyData && tests && !datasetName.endsWith("covid19w") &&
                <Daily data={historyData.countries.E92000001} tests={tests} dark={dark} />}
              {notEmpty && datasetName.endsWith("covid19w") &&
                <WorldDaily data={data} dark={dark} 
                  // onSelectCallback={(selected) => {
                  //   typeof onSelectCallback === 'function' &&
                  //     onSelectCallback({
                  //       what: selected ? 'multi' : '',
                  //       selected: {countryterritoryCode: new Set([selected])}
                  //     });
                  // }}
                />
              }
              <Tabs defaultActiveKey={"1"} id="main-tabs">
                <Tab eventKey="1" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-info" />
                }>
                  Main view
                </Tab>
                <Tab eventKey="2" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-sliders" />
                }>
                  {notEmpty &&
                    <div>
                      <ColorPicker colourCallback={(color) =>
                        typeof colourCallback === 'function' &&
                        colourCallback(color)} />
                    </div>
                  }
                  {notEmpty &&
                    <>
                      <h6>Deck Layer:</h6>
                      <MultiSelect
                        title="Choose Layer"
                        single={true}
                        values={
                          LAYERSTYLES.map(e =>
                            ({ id: humanize(e), value: e }))
                        }
                        onSelectCallback={(selected) => {
                          // array of seingle {id: , value: } object
                          const newBarChartVar = (selected && selected[0]) ?
                            selected[0].value : barChartVariable;
                          this.setState({
                            barChartVariable: newBarChartVar
                          });
                          typeof onSelectCallback === 'function' &&
                            onSelectCallback({
                              what: 'layerStyle', selected: newBarChartVar
                            });
                        }}
                      />
                    </>
                  }
                  Map Styles
                  <br />
                  <MapboxBaseLayers
                    onSelectCallback={(selected) =>
                      onSelectCallback &&
                      onSelectCallback({
                        selected: selected,
                        what: 'mapstyle'
                      })
                    }
                  />
                </Tab>
                {/* <Tab eventKey="3" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-tasks" />
                }>
                  Tab 3
                </Tab> */}
                <Tab eventKey="3" title={
                  <i style={{ fontSize: '2rem' }}
                    className="fa fa-filter" />
                }>
                  {
                    data && data.length > 0 &&
                    <Variables
                      dark={dark}
                      multiVarSelect={multiVarSelect}
                      onSelectCallback={(mvs) => {
                        typeof (onSelectCallback) === 'function' &&
                          onSelectCallback(
                            Object.keys(mvs).length === 0 ?
                              { what: '' } : { what: 'multi', selected: mvs })
                        this.setState({ multiVarSelect: mvs })
                      }}
                      data={data} />
                  }
                </Tab>
              </Tabs>
            </div>
            <div className="space"></div>
            <form className="search-form" onSubmit={(e) => {
              e.preventDefault();
              // console.log(this.state.search);
              searchNominatom(this.state.search, (json) => {
                // console.log(json && json.length > 0 && json[0].boundingbox);
                let bbox = json && json.length > 0 && json[0].boundingbox;
                bbox = bbox && bbox.map(num => +(num))
                typeof onlocationChange === 'function' && bbox &&
                  onlocationChange({
                    bbox: bbox,
                    lon: +(json[0].lon), lat: +(json[0].lat)
                  })
              })
            }}>
              <FormGroup>
                <InputGroup>
                  <FormControl
                    style={{
                      background: dark ? '#242730' : 'white',
                      color: dark ? 'white' : 'black'
                    }}
                    onChange={(e) => this.setState({ search: e.target.value })}
                    placeholder="fly to..." type="text" />
                  <InputGroup.Addon
                    style={{
                      background: dark ? '#242730' : 'white',
                      color: dark ? 'white' : 'black'
                    }}>
                    <Glyphicon glyph="search" />
                  </InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </form>
            <img src={LIDA} alt="LIDA logo" />
          </div>
        </div>
      </>
    )
  }
}

