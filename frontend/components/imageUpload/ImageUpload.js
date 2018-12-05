// Import frameworks
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import Dropzone from 'react-dropzone';
const { awsKeyToURL } = require('../../../backend/helpers');

// Import material-ui
import { Button, IconButton, Input, InputLabel, InputAdornment, FormHelperText,
       FormControl, MenuItem, TextField } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CloudUpload from '@material-ui/icons/CloudUpload';

// Define color palette
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#E5E5E5',
      contrastText: '#6E6F72'
    },
    secondary: {
      main: '#B4B4B4',
      contrastText: '#FFFFFF'
    },
  },
});


class ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      success: false,
      files: [],
      keysList: [],
    };

    // Bindings so 'this' refers to component
    this.onDrop = this.onDrop.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  // Handle the uploaded files
  onDrop(successFiles, failFiles) {
    // pass each file in a the uploaded_files list
    const formData = new FormData();
    successFiles.forEach(file => {
      formData.append('uploaded_files', file);
    });

    // upload this file list to S3 bucket
    axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        // files were uploaded; check response for S3 file keys
        this.state.files.push(...response.data.files);
        this.state.keysList.push(...response.data.keysList);
        this.setState({
          error: response.data.error,
          success: response.data.success,
        });
      })
      // If there was some unhandled error to this point
      .catch(err => {
        this.setState({
          error: err.message,
          success: false,
        });
      });
  }

  // Decide what to do when user cancels upload
  onCancel() {
    // pass
  }

  /**
   * Renders ImageUpload component
   */
  render() {
    return (
      <div style={{ width: "80%", margin: "0 auto" }}>
        <div className="dropzone" style={{ height: "100%", width: "100%" }}>
          <Dropzone
            onDrop={this.onDrop}
            onFileDialogCancel={this.onCancel}
            accept="image/jpeg, image/png"
            style={{ position: "relative" }}
          >
          <MuiThemeProvider theme={theme}>
            <Button
              color="primary"
              variant="contained"
              onClick={ this.handleCreateNewPaymentSubmit }
              size="large"
              style={{ width: "100%", position: "relative", height: "6vh", boxShadow: "none" }}
            >
              <CloudUpload color="secondary"/>  &nbsp; Upload Photo
            </Button>
          </MuiThemeProvider>

          </Dropzone>
        </div>
        <div className="uploadedFiles">
          {
            this.state.keysList.map((key, i) =>
              <img style={{width: '25\%', height: 'auto'}} key={i} src={awsKeyToURL(key)} alt=""/>
            )
          }
        </div>
      </div>
    );
  }
}

// Prop validations
ImageUpload.propTypes = {
  userId: PropTypes.string,
};

const mapStateToProps = ({ authState }) => {
  return {
    userId: authState.userId,
  };
};

export default connect(mapStateToProps)(ImageUpload);
