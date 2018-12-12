// Import frameworks
import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

// Import shared components

// Import general page components
import Nav from '../components/nav/Nav';

// Import user components
import Login from '../components/account/Login';
import Register from '../components/account/Register';
import Delete from '../components/account/Delete';
import Update from '../components/account/Update';
import Authenticate from '../components/account/Authenticate';
import CreateNewBook from '../components/book/CreateNewBook';

// Import image upload component
import ImageUpload from '../components/imageUpload/ImageUpload';

/**
 * Render the app container
 */
class AppContainer extends React.Component {
  // Constructor method
  constructor(props) {
    super(props);
  }

  // When the component mounts
  componentDidMount() {
    // Sync the backend and frontend states with respect to user sessions
    axios.get('/api/sync')
      .then((resp) => {
        // Redux persist and backend state are NOT synced. Need to wipe redux state and redirect to login
        if (!resp.data.success) {
          // Dispatch the logout action
          // this.props.logoutUser();
        }
      })
      .catch(() => {
        // this.props.logoutUser();
      });
  }

  // Render the app
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <div>
              {/* Switch means we switch between the different components below. Only one displays at a time */}
              <Switch>
                {/* General routes */}
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/logout" component={Login} /> // TODO: update dummy logout path
                <Route path="/authenticate/:token" component={Authenticate} />
                <Route path="/book/new" component={CreateNewBook} />

                /* Image upload route */
                <Route exact path="/upload" component={ImageUpload} />

                { /* 404 if no other route was matched */ }
              </Switch>
            </div>
            {/*  Footer is always displayed
             TODO footer like Nav bar */}
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
