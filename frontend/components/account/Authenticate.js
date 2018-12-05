// Import frameworks
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

/**
 * Component to render
 */
class Authenticate extends Component {
    // Constructor method
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      success: false
    };

    // Bindings so 'this' refers to component
    this.handleResendSubmit = this.handleResendSubmit.bind(this);

    // using the authentication token passed in url, try to authenticate user
    const token = props.match.params.token;
    axios.post('/api/user/authenticate', {
      token
    })
      .then(response => {
        // If the user did not successfully authenticate
        this.setState({
          error: response.data.error,
          success: response.data.success
        })
      })
      // If there was some unhandled error to this point
      .catch(err => {
        this.setState({
          error: err.message,
          success: false,
        });
      });
  }

  // when resend button is clicked, will try to resend authentication email
  handleResendSubmit(event) {
    event.preventDefault();
    axios.post('/api/resend')
      .then(response => {
        // If the user did not successfully register
        this.setState({
          error: response.data.error,
          success: response.data.success
        })
      })
      // If there was some unhandled error to this point
      .catch(err => {
        this.setState({
          error: err.message,
          pending: false,
        });
      });
  }

  /**
   * Renders actual auth component
   */
  render() {
    return (
      <div className="container centerContent grayBackground">
        <br/>
        <h4>
          Resend Authentication
        </h4>
        <div className="card container" style={{width: 300, height: 230}}>
          <br/>
          <div>
            <form className="form" method="POST" onSubmit={ this.handleResendSubmit }>

              <input
                type="submit"
              />

              <br/>
              <br/>
            </form>
          </div>
        </div>
        <br/>
      </div>
    );
  }
}

// Prop validations
Authenticate.propTypes = {
  userId: PropTypes.string,
  token: PropTypes.string,
};

const mapStateToProps = ({ authState }) => {
  return {
    userId: authState.userId,
    token: authState.token,
  };
};

export default connect(mapStateToProps)(Authenticate);
