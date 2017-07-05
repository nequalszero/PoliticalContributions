import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

import Axis from './axis';
import ChartArea from './chart_area';
import ChartTitle from './chart_title';
import Grid from './grid';

class BarChart extends React.Component {
  state = {
    axesMounted: false
  };

  chartTitleProps = {
    text: this.props.titleText,
    translateX: this.props.translateX + this.props.xAxisLength/2,
    translateY: 35
  };

  yAxisProps = {
    axisLabelProps: {
      rotation: -90,
      text: this.props.yAxisText,
      translateX: -20
    },
    axisLength: this.props.yAxisLength,
    axisType: "left",
    scaleType: "linear",
    translateX: this.props.translateX,
    translateY: this.props.translateY,
    values: this.extractData(this.props, 'valueKey'),
  };

  xAxisProps = {
    axisLabelProps: {
      text: this.props.xAxisText,
      translateY: 20
    },
    axisLength: this.props.xAxisLength,
    axisType: "bottom",
    barPadding: 0,
    className: "axis axis-x",
    handleTickClick: this.props.handlers.handleXTickClick,
    handleTickMouseOver: this.props.handlers.handleXTickMouseOver,
    handleTickMouseOut: this.props.handlers.handleXTickMouseOut,
    hoverKey: this.props.hoverKey,
    scaleType: "band",
    selectedKey: this.props.selectedKey,
    tickTransformation: {
      tickRotation: -45
    },
    translateY: this.props.translateY + this.props.yAxisLength,
    translateX: this.props.translateX,
    values: this.extractData(this.props, 'labelKey').reverse(),
  };

  horizontalGridProps = {
    tickLength: this.xAxisProps.axisLength + 1,  // + 1 to get rid of black pixel from left over from setting axis.tickSizeOuter(0);
    translateX: this.yAxisProps.translateX,
    translateY: this.yAxisProps.translateY,
    axisType: this.yAxisProps.axisType,
    values: this.extractData(this.props, 'valueKey'),
    className: "gridline",
    ticks: 9,
  }

  chartAreaProps = {
    translateX: this.props.translateX,
    translateY: this.props.translateY + this.props.yAxisLength,
    data: this.getChartAreaData(this.props),
    width: this.props.xAxisLength,
    height: this.props.yAxisLength,
    handleClick: this.props.handlers.handleBarClick,
    handleMouseOver: this.props.handlers.handleBarMouseOver,
    handleMouseOut: this.props.handlers.handleBarMouseOut,
    hoverKey: this.props.hoverKey,
    selectedKey: this.props.selectedKey,
  };

  componentDidMount() {
    this.chartAreaProps.xScale = this.xScale;
    this.chartAreaProps.yScale = this.yScale;
    this.horizontalGridProps.scale = this.yScale;
    this.setState({axesMounted: true})
  }

  checkKeyType(keyType, fromFunction) {
    if (keyType !== 'valueKey' && keyType !== 'labelKey' && keyType !== 'idKey') {
      throw `Error in BarChart#${fromFunction} unrecognized keyType '${keyType}'`;
    }
  }

  dataObjectKeyFunction(props, keyType) {
    this.checkKeyType(keyType, 'dataObjectKeyFunction');
    const dataObjectKey = props.data[keyType];

    if (typeof dataObjectKey === 'function') {
      return (dataObject) => { dataObjectKey(dataObject) };
    }

    return (dataObject) => ( dataObject[dataObjectKey] );
  }

  extractData(props, keyType) {
    this.checkKeyType(keyType, 'extractData');
    const dataFunction = this.dataObjectKeyFunction(props, keyType);

    return props.data.dataObjects.map((dataObject) => (dataFunction(dataObject)));
  }

  getChartAreaData(props) {
    const dataValueFunction = this.dataObjectKeyFunction(props, 'valueKey');
    const dataLabelFunction = this.dataObjectKeyFunction(props, 'labelKey');

    return props.data.dataObjects.map((dataObject) => ({
      value: dataValueFunction(dataObject),
      key: dataLabelFunction(dataObject),
      party: dataObject.party,
      id: dataObject.id
    }));
  }

  componentWillReceiveProps(nextProps) {
    this.yAxisProps.values = this.extractData(nextProps, 'valueKey');
    this.xAxisProps.values = this.extractData(nextProps, 'labelKey').reverse();
    this.chartAreaProps.data = this.getChartAreaData(nextProps);
    this.chartAreaProps.selectedKey = nextProps.selectedKey;
    this.chartAreaProps.hoverKey = nextProps.hoverKey;
    this.xAxisProps.selectedKey = nextProps.selectedKey;
    this.xAxisProps.hoverKey = nextProps.hoverKey;
    this.chartTitleProps.text = nextProps.titleText;
  }

  render () {
    return (
      <svg className="bar-chart-area">
        <g>
          <ChartTitle {...this.chartTitleProps}/>
          <Axis {...this.yAxisProps}
            axisRef={(scale) => {this.yScale = scale}}/>
          <Axis {...this.xAxisProps}
            axisRef={(scale) => {this.xScale = scale}}/>
          {this.state.axesMounted && <Grid {...this.horizontalGridProps}/>}
          {this.state.axesMounted && <ChartArea {...this.chartAreaProps}/>}
        </g>
      </svg>
    );
  }
}

BarChart.propTypes = {
  data: PropTypes.shape({
    dataObjects: PropTypes.arrayOf(PropTypes.object).isRequired,
    idKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]).isRequired,
    labelKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]).isRequired,
    valueKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]).isRequired,
  }).isRequired,
  handlers: PropTypes.shape({
    handleBarClick: PropTypes.func,
    handleBarMouseOver: PropTypes.func,
    handleBarMouseOut: PropTypes.func,
    handleXTickClick: PropTypes.func,
    handleXTickMouseOver: PropTypes.func,
    handleXTickMouseOut: PropTypes.func,
    handleYTickClick: PropTypes.func,
    handleYTickMouseOver: PropTypes.func,
    handleYTickMouseOut: PropTypes.func,
  }).isRequired,
  hoverKey: PropTypes.string,
  selectedKey: PropTypes.string,
  titleText: PropTypes.string.isRequired,
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  xAxisLength: PropTypes.number.isRequired,
  xAxisText: PropTypes.string,
  yAxisLength: PropTypes.number.isRequired,
  yAxisText: PropTypes.string,
};

export default BarChart;
