// Import frameworks
import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

// Import user components
import Login from '../components/account/Login';
import Register from '../components/account/Register';
import Delete from '../components/account/Delete';
import Update from '../components/account/Update';
import Authenticate from '../components/account/Authenticate';
import CreateNewBook from '../components/book/CreateNewBook';
import Books from '../components/book/Books';
import ProfilePage from '../components/account/ProfilePage'

/**
 * Render the app container
 */
class AppContainer extends React.Component {
  // Constructor method
  constructor(props) {
    super(props);
  }

  // Render the app
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <div>
              <Switch>
                <Route exact path="/" component={Login} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <Route path="/authenticate/:token" component={Authenticate} />
                <Route path="/book/new" component={CreateNewBook} />
                <Route path="/book/all" component={Books} />
                <Route path="/account/profile" component={ProfilePage} />
              </Switch>
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

// Prop validations
AppContainer.propTypes = {
  logoutUser: PropTypes.func,
};

const mapStateToProps = ({}) => {
  return {};
};

export default connect(mapStateToProps)(AppContainer);
