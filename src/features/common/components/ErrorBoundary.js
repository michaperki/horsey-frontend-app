// src/features/common/components/ErrorBoundary.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * ErrorBoundary component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // You can add error reporting service here (like Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <FaExclamationTriangle className="error-icon" />
            <h2>Something went wrong</h2>
            <p>{this.props.message || 'An unexpected error occurred'}</p>
            {this.props.showDetails && process.env.NODE_ENV === 'development' && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                <summary>Error Details</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
                <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
              </details>
            )}
            {this.props.showReset && (
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  if (this.props.onReset) {
                    this.props.onReset();
                  }
                }}
                className="error-reset-button"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  message: PropTypes.string,
  showDetails: PropTypes.bool,
  showReset: PropTypes.bool,
  onReset: PropTypes.func,
  onError: PropTypes.func
};

ErrorBoundary.defaultProps = {
  showDetails: false,
  showReset: true
};

export default ErrorBoundary;
