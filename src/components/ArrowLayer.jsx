import {project32, picking} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';
import BarLayer from './BarLayer';

const defaultProps = {
  // Center of each circle, in [longitude, latitude, (z)]
  getHeight: {type: 'accessor', value: 1 }
}

const vs = `
  attribute vec3 positions;
  attribute vec3 instancePositions;
  attribute vec3 instancePositions64Low;
  attribute float instanceRadius;
  attribute vec4 instanceColors;
  attribute float instanceScale;
  attribute float instanceRotationAngle;
  attribute float instanceWidth;
  // for onHover to work must
  // delcare instancePickingColors here and assign it to
  // geometry.pickingColor
  // and then register DECKGL_FILTER_COLOR hook in
  // fragment shader
  attribute vec3 instancePickingColors;
  attribute float instanceHeight;

  varying vec4 vColor;
  varying vec2 vPosition;

  vec2 rotate_by_angle(vec2 vertex, float angle) {
    float angle_radian = angle * PI / 180.0;
    float cos_angle = cos(angle_radian);
    float sin_angle = sin(angle_radian);
    mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
    return rotationMatrix * vertex;
  }

  void main(void) {
    geometry.pickingColor = instancePickingColors;

    vec3 offsetCommon = positions * project_size(instanceRadius);
    offsetCommon = vec3(rotate_by_angle(offsetCommon.xy, instanceRotationAngle), 0);
    offsetCommon.x = offsetCommon.x * instanceWidth;
    offsetCommon.y = offsetCommon.y * instanceHeight;
    
    // width first
    offsetCommon = offsetCommon * instanceScale;

    vec3 positionCommon = project_position(instancePositions, instancePositions64Low);
    // missx: So in your shader, positionCommon is the anchor position on the map. 
    // offsetCommon is the local coordinate relative to the anchor
    // You want to leave the anchor alone and rotate the offset

    gl_Position = project_common_position_to_clipspace(vec4(positionCommon + offsetCommon, 1.0));

    vPosition = positions.xy;
    vColor = instanceColors;
    DECKGL_FILTER_COLOR(vColor, geometry);

  }`;

export default class ArrowLayer extends BarLayer {  
  getShaders() {
    // use object.assign to make sure we don't overwrite existing fields like `vs`, `modules`...
    return Object.assign({}, super.getShaders(), {
      vs
    });
  }

  initializeState() {
    super.initializeState();

    this.state.attributeManager.addInstanced({
      instanceHeight: {size: 1, accessor: 'getHeight'}
    });
  }

  _getModel(gl) {
    const positions = [
      -1, -1, 
      0, 0.5,
      -.9, -1,
      -.9, -1,
      .1, .5,
      0, .5,
      0.1, .5,
      1, -1,
      .9, -1,
      .9, -1,
      0.1, .5,
      0, .5,
    ];
    return new Model(
      gl,
      Object.assign(this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          vertexCount: 12,
          attributes: {
            positions: {size: 2, value: new Float32Array(positions)}
          }
        }),
        isInstanced: true
      })
    );
  }
}

ArrowLayer.layerName = 'ArrowLayer';
ArrowLayer.defaultProps = defaultProps;