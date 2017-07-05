import React from 'react';

// Data objects
import {
  committeeDesignations,
  interestGroupCategories,
  committeeTypes
} from '../../processed_data/associations.js';
import {
  candidatesWithContributions,
  largestContributions,
  wealthiestCandidates,
  wealthiestCommittees
} from '../../processed_data/statistics.js';
import candidate from '../../processed_data/candidate.js';
import committee from '../../processed_data/committee.js';
// import contribution from '../../processed_data/contribution.js';

import BarChart from './BarChart';
import NavigationTabs from './NavigationTabs';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.candidateData = this.selectCandidateData();
    this.committeeOPData = this.selectCommitteeOPData();
    this.committeeBPData = this.selectCommitteeBPData();

    this.state = {
      currentTab: 'candidate',
      barChart: {
        data: {
          dataObjects: this.candidateData,
          idKey: 'id',
          labelKey: 'name',
          valueKey: 'totalContributions',
        },
        filter: null,
        hoverKey: null,
        selectedKey: null,
        title: 'Candidate Contributions from Committees 2015-2016',
        xAxisText: 'Candidate Name',
        yAxisText: 'Dollars Raised ($)',
      },
    };
  }

  selectCandidateData() {
    return wealthiestCandidates.map((id) => (candidate[id]));
  }

  selectCommitteeOPData() {
    return wealthiestCommittees.map((id) => (committee[id]));
  }

  selectCommitteeBPData() {
    return wealthiestCommittees.map((id) => {
      let currentCommittee = {...committee[id]};
      let [demBack, repBack] = [0, 0];

      currentCommittee.endorsedCandidates.forEach((candId) => {
        if (candidate[candId].party === 'DEM') demBack += 1;
        if (candidate[candId].party === 'REP') repBack += 1;
      });

      if (repBack > demBack) currentCommittee.party = 'REP';
      if (repBack < demBack) currentCommittee.party = 'DEM';

      return currentCommittee;
    });
  }

  changeTab = (tabName) => {
    if (tabName !== 'candidate' && tabName !== 'committeeOP' && tabName !== 'committeeBP') {
      throw `Error in App#changeTab, unrecognized tabName: '${tabName}'`;
    }
    if (this.state.currentTab === tabName) return;

    const barChart = this.state.barChart;

    switch(tabName) {
      case 'committeeOP':
        barChart.data.dataObjects = this.committeeOPData;
        barChart.xAxisText = 'Committee Name';
        barChart.yAxisText = 'Dollars Contributed ($)';
        barChart.title = 'Committee Contributions by Official Party 2015-2016';
        break;
      case 'committeeBP':
        barChart.data.dataObjects = this.committeeBPData;
        barChart.xAxisText = 'Committee Name';
        barChart.yAxisText = 'Dollars Contributed ($)';
        barChart.title = 'Committee Contributions by Backed Party 2015-2016';
        break;
      case 'candidate':
        barChart.data.dataObjects = this.candidateData;
        barChart.xAxisText = 'Candidate Name';
        barChart.yAxisText = 'Dollars Raised ($)';
        barChart.title = 'Candidate Contributions from Committees 2015-2016';
        break;
    }

    this.setState({currentTab: tabName, barChart});
  }

  handleBarChartClick = (dataObject) => {

  }

  handleBarChartMouseOver = (key) => {
    const barChart = this.state.barChart;
    barChart.hoverKey = this.state.barChart.data.dataObjects.find((d) => (d.name === key))
                                                            .name;

    this.setState({ barChart });
  }

  handleBarChartMouseOut = () => {
    const barChart = this.state.barChart;
    barChart.hoverKey = null;

    this.setState({ barChart });
  }

  render() {
    debugger
    const chartProps = {
      data: this.state.barChart.data,
      handlers: {
        // handleBarClick: (dataObject) => this.handleBarChartClick(dataObject),
        handleBarMouseOver: (dataObject) => this.handleBarChartMouseOver(dataObject),
        handleBarMouseOut: () => this.handleBarChartMouseOut(),
        // handleXTickClick: (dataObject) => this.handleBarChartClick(dataObject),
        handleXTickMouseOver: (dataObject) => this.handleBarChartMouseOver(dataObject),
        handleXTickMouseOut: () => this.handleBarChartMouseOut(),
      },
      hoverKey: this.state.barChart.hoverKey,
      selectedKey: this.state.barChart.selectedKey,
      titleText: this.state.barChart.title,
      translateX: 250,
      translateY: 70,
      xAxisLength: 900,
      xAxisText: this.state.barChart.xAxisText,
      yAxisLength: 300,
      yAxisText: this.state.barChart.yAxisText,
    };

    return (
      <div className="app-container">
        <NavigationTabs activeTab={this.state.currentTab} handleClick={this.changeTab}/>
        <BarChart {...chartProps}/>
      </div>
    );
  }
}

export default App;
