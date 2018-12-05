// Import frameworks
import React from 'react';
import {Link} from 'react-router-dom';

/**
 * Component to render the navbar
 */
class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
    this.handleClickLink = this.handleClickLink.bind(this);
  }

  handleClickLink() {
    this.setState({active: false});
  }

  // Render method
  render() {
    return (
      <nav className="marg-top-1 grayBackground">
        <Link to="/" className="marg-left-1 marg-right-1">
          Link 1
        </Link>

        <Link to="/" className="marg-left-1 marg-right-1">
          Link 2
        </Link>

        <Link to="/" className="marg-left-1 marg-right-1">
          Link 3
        </Link>
      </nav>
    );
  }
}

export default Nav;
