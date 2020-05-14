import * as React from 'react';
import { Slider } from 'baseui/slider';
import { Button, SIZE } from 'baseui/button';

//https://codesandbox.io/s/329jy81rlm?file=/src/index.js:204-291
function useInterval(callback, delay) {
  const savedCallback = React.useRef();
  // Remember the latest function.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function CustomTicks(props) {
  const { callback } = props;
  const [value, setValue] = React.useState([props.dates.length - 1]);
  const [dates, setDates] = React.useState(getDates());
  const [delay, setDelay] = React.useState(null);

  React.useEffect(() => {
    setDates(getDates());
    setValue([props.dates.length - 1]);
  }, [props.dates.length])

  useInterval(() => {
    // Your custom logic here 
    setValue(prev => [(prev[0] + 1) % dates.length]);
    typeof callback === 'function' &&
      callback("2020-" + dates[value[0]]);
  }, delay);

  if (!dates) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center'
    }}>
      <Button
        style={{ maxHeight: 40 }}
        size={SIZE.compact}
        onClick={() => {
          if (!delay) {
            setDelay(1000)
          } else {
            setDelay(null) //stop
          }
        }} >
        {
          !delay ? <i style={{ fontSize: '1.5em' }} className="fa fa-play"></i>
            : <i style={{ fontSize: '1.5em' }} className="fa fa-pause"></i>
        }
      </Button>
      <div style={{ flexGrow: 1 }}>
        <Slider
          value={value}
          min={1}
          max={props.dates.length - 1}
          step={1}
          onChange={params => {
            if (params.value) {
              setValue(params.value);
            } else {
              setValue([]);
            }
            typeof callback === 'function' &&
              callback("2020-" + dates[params.value]);
          }}
          overrides={{
            ThumbValue: ({ $value }) => (
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  width: 80,
                  // top: `-${theme.sizing.scale800}`,
                  // ...theme.typography.font200,
                  backgroundColor: 'transparent',
                }}
              >
                On {dates[$value]}
              </div>
            ),
            TickBar: ({ $min, $max }) => (
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
                {[dates[$min], dates[Math.floor($max / 2)], dates[$max]]
                  .map(e =>
                    <div className="slider-label" key={e}>{e}</div>
                  )}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );

  function getDates() {
    return props.dates &&
      props.dates.map(e => e.replace("2020-", ""));
  }
}
export default CustomTicks;