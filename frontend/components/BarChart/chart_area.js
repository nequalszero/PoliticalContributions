import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as d3 from 'd3';

import {formatWithCommas} from '../../lib/miscellaneous_functions';

const ChartArea = (props) => {
  const barClass = (dataObj) => (
    classNames({
      'chart-bar': true,
      'democrat': dataObj.party === "DEM",
      'republican': dataObj.party === "REP",
      // active: props.selectedKey === key,
      'hovering-over': props.hoverKey === dataObj.key
    })
  );

  const tipClass = (dataObj) => (
    classNames({
      'tip': true,
      visible: props.hoverKey === dataObj.key
    })
  )

  const chartForeGround = () => {
    return props.data.map((dataObj, idx) => (
      <rect key={idx} className={ barClass(dataObj) }
        x={props.xScale(dataObj.key)}
        y={props.yScale(dataObj.value) - props.height}
        height={props.height-props.yScale(dataObj.value)}
        width={props.xScale.bandwidth()}
        onClick={() => props.handleClick(dataObj.key)}
        onMouseEnter={() => props.handleMouseOver(dataObj.key)}
        onMouseOut={() => props.handleMouseOut()}/>
    ));
  };

  const chartTipRectangles = () => {
    return props.data.map((dataObj, idx) => (
      <rect key={idx} className={ tipClass(dataObj) }
        x={props.xScale(dataObj.key) - (formatWithCommas(dataObj.value).length*10)/2+10}
        y={props.yScale(dataObj.value) - props.height - 40}
        height="30px"
        width={`${formatWithCommas(dataObj.value).length*10+30}px`}>
      </rect>
    ));
  }

  const chartTips = () => {
    return props.data.map((dataObj, idx) => (
      <text key={idx} className={ tipClass(dataObj) }
        x={props.xScale(dataObj.key) + formatWithCommas(dataObj.value).length*3 }
        y={props.yScale(dataObj.value) - props.height - 20}
        height="20px"
        width="120px"
        textAnchor="middle">
        {`$${formatWithCommas(dataObj.value)}`}
      </text>
    ));
  }

  return (
    <g transform={`translate(${props.translateX}, ${props.translateY})`}>
      {chartForeGround()}
      {chartTipRectangles()}
      {chartTips()}
    </g>
  );
}

ChartArea.defaultProps = {
  handleClick: () => (null),
  handleMouseOver: () => (null),
  handleMouseOut: () => (null),
}

ChartArea.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })).isRequired,
  handleClick: PropTypes.func,
  handleMouseOver: PropTypes.func,
  handleMouseOut: PropTypes.func,
  height: PropTypes.number.isRequired,
  hoverKey: PropTypes.string,
  selectedKey: PropTypes.string,
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default ChartArea;
