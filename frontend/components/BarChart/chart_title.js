import React from 'react';

class ChartTitle extends React.Component {
  // Will update 'updated' portion of state whenever new props are received to
  //   ensure a rerender accounting for the new title width.
  state = {
    updated: false
  }

  componentDidMount() {
    this.setState({updated: true});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({updated: false});
  }

  componentDidUpdate() {
    if (!this.state.updated) {
      this.setState({updated: true});
    }
  }

  transformation() {
    if (!this.textNode) {
      return `translate(${this.props.translateX}, ${this.props.translateY})`
    }
    return `translate(${this.props.translateX - this.textNode.getBBox().width/2}, ${this.props.translateY})`
  }

  render() {
    return (
      <text transform={this.transformation()}
        className="chart-title"
        ref={(node) => this.textNode = node}>
        {this.props.text}
      </text>
    );
  }
}

export default ChartTitle;
