import * as React from 'react';
import {Slider} from 'baseui/slider';

function CustomTicks(props) {
  const {callback} = props;
  const [value, setValue] = React.useState([props.dates.length-1]);
  const [dates, setDates] = React.useState(getDates());

  React.useEffect(() => {
    setDates(getDates());
    setValue([props.dates.length-1]);
  }, [props.dates.length])
  
  if(!dates) return null;

  return (
    <Slider
      value={value}
      min={1}
      max={props.dates.length-1}
      step={1}
      onChange={params => {        
        if (params.value) {
          setValue(params.value);
        } else {
          setValue([]);
        }
        typeof callback === 'function' &&
        callback("2020-"+dates[params.value]);
      }}
      overrides={{
        ThumbValue: ({$value}) => (
          <div
            style={{
              position: 'absolute',
              top:-20,
              width: 80,
              // top: `-${theme.sizing.scale800}`,
              // ...theme.typography.font200,
              backgroundColor: 'transparent',
            }}
          >
            On {dates[$value]}
          </div>
        ),
        TickBar: ({$min, $max}) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              // paddingRight: theme.sizing.scale600,
              // paddingLeft: theme.sizing.scale600,
              // paddingBottom: theme.sizing.scale400,
            }}
          >
            {[dates[$min],dates[Math.floor($max/2)],dates[$max]]
            .map(e => 
              <div className="slider-label" key={e}>{e}</div>
            )}
          </div>
        ),
      }}
    />
  );

  function getDates() {
    return props.dates &&
      props.dates.map(e => e.replace("2020-", ""));
  }
}
export default CustomTicks;