import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const NavigationTabs = (props) => {
  const tabClass = (name) => (
    classNames({
      active: name === props.activeTab,
      inactive: name === props.activeTab
    })
  );

  return (
    <ul className="navigation-tabs">
      <li onClick={() => props.handleClick('candidate')} className={tabClass('candidate')}>Candidates</li>
      <li onClick={() => props.handleClick('committeeOP')} className={tabClass('committeeOP')}>Committees (official parties)</li>
      <li onClick={() => props.handleClick('committeeBP')} className={tabClass('committeeBP')}>Committees (backed parties)</li>
    </ul>
  );
}

NavigationTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired
};

export default NavigationTabs;
