import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Axis from './axis';

class Grid extends React.Component {
  constructor(props) {
    super(props);

    this.axis = this.selectAxisType(props.axisType, props.scale);
    this.updateD3(props);
  }

  componentDidMount() {
    this.renderGrid();
  }

  componentWillReceiveProps(nextProps) {
    this.updateD3(nextProps);
  }

  componentDidUpdate() {
    this.renderGrid();
  }

  updateD3(props) {
    this.grid = this.axis.ticks(props.ticks)
                         .tickSize(-props.tickLength, 0, 0)
                         .tickFormat("");
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

  renderGrid() {
    const grid = d3.select(this.axisNode).call(this.grid);

    // Removes thicker grid line that occurs at the top seemingly due to path element.
    grid.select('path').attr("stroke", "none");
  }

  render() {
    const translation = `translate(${this.props.translateX}, ${this.props.translateY})`;

    return (
        <g className={this.props.className}
          transform={translation}
          ref={(node) => this.axisNode = node}>
        </g>
    );
  }
};

Grid.propTypes = {
  tickLength: PropTypes.number.isRequired,
  translateX: PropTypes.number.isRequired,
  translateY: PropTypes.number.isRequired,
  axisType: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  ticks: PropTypes.number,
  scale: PropTypes.func.isRequired
};

export default Grid;
