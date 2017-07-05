import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import classNames from'classnames';

import { createAxisLabelTransform } from '../../lib/axis_helper';

// Have not yet tested this component for right and top axes.
class Axis extends React.Component {
  constructor(props) {
    super(props);

    // Using state to update axis label positions after new axis rendering.
    this.state = {mounted: false};

    this.scale = this.selectScaleType(props.scaleType)
    this.axis = this.selectAxisType(props.axisType, this.scale);
    this.axis.tickSizeOuter(0);
    this.updateD3(props);
  }

  componentDidMount() {
    this.renderAxis();
    this.props.axisRef(this.scale);
    this.setState({mounted: true});
  }

  componentWillReceiveProps(newProps) {
    this.updateD3(newProps);
    this.setState({mounted: false});
  }

  componentDidUpdate() {
    this.renderAxis();
    if (!this.state.mounted) this.setState({mounted: true});
  }

  calculateAxisLabelTransform() {
    return createAxisLabelTransform(this.textNode, this.axisNode, this.props);
  }

  getTickClass(tickName) {
    return classNames({
      active: this.props.selectedKey == tickName,
      'hovering-over': this.props.hoverKey == tickName
    });
  }

  selectScaleType(type) {
    switch(type) {
      case "linear":
        return d3.scaleLinear();
      case "band":
        return d3.scaleBand().rangeRound([0, this.props.axisLength]).padding(this.props.barPadding || 0);
      default:
        throw `Error in Axis#selectScaleType: no case for scaleType: '${type}'`
    }
  }

  selectAxisType(type, scale) {
    switch(type) {
      case "left":
        return d3.axisLeft(scale);
      case "bottom":
        return d3.axisBottom(scale);
      default:
        throw `Error in Axis#selectAxisType: invalid type ${type}`;
    }
  }

  updateD3(props) {
    if (!props.values || props.values.empty) {
      this.scale
        .domain([])
        .range([props.axisLength, 0]);
    } else {
      switch(typeof props.values.first) {
        case "string":
          this.scale
            .domain(props.values)
            .range([props.axisLength, 0])
          return

        case "number":
          const dataMax = d3.max(props.values);
          this.scale
            .domain(d3.extent([0, dataMax*1.1]))
            .range([props.axisLength, 0]);
          return

        default:
          throw `Error in Axis#updateD3: props.values has value of type ${typeof props.values.first}`;
      }
    }
  }

  handleTickClick = () => {
    this.props.onTickClick();
  }

  truncateIfNeeded = (tick) => {
    if (String(tick).length > 40) return `${String(tick).slice(0, 40)}...`
    return tick;
  }

  renderAxis() {
    const tickRotation = this.props.tickTransformation ? (this.props.tickTransformation.tickRotation || 0) : 0;

    const axis = d3.select(this.axisNode).call(this.axis)
    const axisTicks = axis.selectAll('text');

    // Apply rotation to tick labels if needed.
    if (tickRotation !== 0) {
      const dx = this.props.tickTransformation.dx || "-0.8em";
      const dy = this.props.tickTransformation.dy || "0.15em";

      axisTicks.style('text-anchor', 'end')
               .attr("dx", dx)
               .attr("dy", dy)
               .attr("transform", `rotate(${tickRotation})`)
               .text((d) => {
                 if (this.props.truncateTickLabels) return this.truncateIfNeeded(d);
                 return d;
               })
    }

    // Apply an active class to the tick if it matches the selectedKey prop.
    axisTicks.attr("class", (tickName) => this.getTickClass(tickName));

    if (this.props.handleTickClick) {
      axisTicks.on('click', (tickName) => this.props.handleTickClick(tickName) );
    }

    if (this.props.handleTickMouseOver) {
      axisTicks.on('mouseover', (tickName) => this.props.handleTickMouseOver(tickName));
    }

    if (this.props.handleTickMouseOut) {
      axisTicks.on('mouseout', () => this.props.handleTickMouseOut());
    }
  }

  render() {
    return (
      <g>
        <g className={this.props.className || "axis"}
          ref={(axisNode) => this.axisNode = axisNode}
          transform={`translate(${this.props.translateX}, ${this.props.translateY})`}>
        </g>
        <text transform={this.calculateAxisLabelTransform()}
          ref={(textNode) => this.textNode = textNode}
          className="axis-label">
          {this.props.axisLabelProps.text}
        </text>
      </g>
    )
  }
}

Axis.propTypes = {
  axisLength: PropTypes.number.isRequired,
  axisLabelProps: PropTypes.shape({
    rotation: PropTypes.number,
    text: PropTypes.string,
    position: PropTypes.string,
    translateX: PropTypes.number,
    translateY: PropTypes.number
  }),
  axisRef: PropTypes.func.isRequired,
  axisType: PropTypes.string.isRequired,
  barPadding: PropTypes.number,
  className: PropTypes.string,
  handleTickClick: PropTypes.func,
  handleTickMouseOver: PropTypes.func,
  handleTickMouseOut: PropTypes.func,
  hoverKey: PropTypes.string,
  onTickClick: PropTypes.func,
  scaleType: PropTypes.string.isRequired,
  selectedKey: PropTypes.string,
  tickTransformation: PropTypes.shape({
    rotation: PropTypes.number,
    dx: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dy: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  truncateTickLabels: PropTypes.bool,
  values: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.number),
  ]),
};

export default Axis;
