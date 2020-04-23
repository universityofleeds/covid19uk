import React from 'react';
import { Table } from 'baseui/table';
import { humanize } from '../utils';
import { isString, isObject, isArray } from '../JSUtils';

const WIDTH = 220;
const BAR_HEIGHT = 80;

export default class Tooltip extends React.Component {
  constructor(props) {
    super();
    this.state = {
      isMobile: props.isMobile,
    };
    this._listPropsAndValues = this._listPropsAndValues.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowSizeChange.bind(this));
  }

  _handleWindowSizeChange = () => {
    this.forceUpdate()
  };

  /**
   * hoverdObject can be of two types so far:
   * 1. collections of points with `.points` property
   * 2. properties of `.type === 'Feature'`.
   */
  render() {
    const { topx, topy, hoveredObject } = this.props;
    const { isMobile } = this.state;
    // console.log(hoveredObject);

    if (!hoveredObject) return null;

    const type_feature = hoveredObject.type && 
    hoveredObject.type === 'Feature';
    const cluster = hoveredObject && hoveredObject.cluster 
    // {cluster: true, cluster_id: 8, point_count: 54, 
    // point_count_abbreviated: 54}
    
    // console.log(crashes_data);
    
    const w = window.innerWidth;
    const y = window.innerHeight;
    const n_topy = isMobile ? 10 :
      topy + (WIDTH + BAR_HEIGHT) > y ? topy - WIDTH : topy;
    const n_left = isMobile ? 10 :
      topx + WIDTH > w ? topx - WIDTH : topx;    
    const tooltip =
      <div
        className="xyz" style={{
          top: topy + (WIDTH + BAR_HEIGHT) > y ? n_topy : topy,
          left: topx + WIDTH > w ? n_left : topx
        }}>
        <div>
          <b>Total: {cluster ? hoveredObject.point_count : 
            type_feature ? 1 : hoveredObject.points.length}</b>
        </div>
        <div>
          {
            // Simple logic, if points and less two points or less,
            // or not poingts, hard to expect React-vis generating plot.
            // so list the values of the non-point or list both points.
            !cluster && (type_feature || hoveredObject.points.length <= 2) &&
            this._listPropsAndValues(hoveredObject)
          }
        </div>
      </div >
    return (tooltip)
  }

  _listPropsAndValues(hoveredObject) {    
    let DATA = []
    const props = hoveredObject.properties;
    if(props) {      
      DATA = Object.keys(props)
      .map(p => {
        return([humanize(p), isObject(props[p]) || isArray(props[p]) ? "[Object]" :  props[p]])
      })
    } else { // two points passed go through first one
      const ps = hoveredObject.points;
      DATA = Object.keys(ps[0].properties)
      .map(p => {
        let points = [
          humanize(p), 
          isObject(ps[0].properties[p]) ? "[Object]" : ps[0].properties[p],
        ]
        if(ps[1]) {
          points.push(isObject(ps[1].properties[p]) ? "[Object]" : ps[1].properties[p])
        }
        return(points)
      })
    }
    return <Table style={{maxWidth: '320px'}} 
    columns={
      hoveredObject.points && 
      hoveredObject.points.length === 2 ? 
      ['Property', 'Value p1', 'Value p2'] : ['Property', 'Value'] 
    } data={DATA} />

  }
}