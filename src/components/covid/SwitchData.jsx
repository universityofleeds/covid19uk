import * as React from "react";
import { StatefulButtonGroup, MODE } from 'baseui/button-group';
import { Button, KIND, SIZE } from "baseui/button";

import { DEV_URL, PRD_URL } from '../../Constants';
const host = (process.env.NODE_ENV === 'development' ? DEV_URL : PRD_URL);

const urls = {
  LA:  'https://c19pub.azureedge.net/utlas.geojson',
  RE: 'https://c19pub.azureedge.net/regions.geojson',
  UK:'https://c19pub.azureedge.net/countries.geojson',
  World: host + '/api/covid19w'
}
export default (props) => {
  const { onSelectCallback } = props;
  return (
    <StatefulButtonGroup
      mode={MODE.radio}
      initialState={{ selected: 0 }}
    >
      {
        Object.keys(urls).map(each =>
          <Button
            key={each}
            kind={KIND.secondary}
            size={SIZE.compact}
            onClick={() =>
              onSelectCallback && onSelectCallback(urls[each])
            }>
            {each}
          </Button>)
      }
    </StatefulButtonGroup>
  );
}