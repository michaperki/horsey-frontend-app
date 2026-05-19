// ErrorBoundary.jsx
import React, { Component } from 'react';

class ChessErrorBoundary extends Component {
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
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chess component error:', error, errorInfo);
    }
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="chess-error-boundary">
          <h2>Chess Game Error</h2>
          <p>Something went wrong with the chess game. Try refreshing the page.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>View Error Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <p>Component Stack:</p>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ChessErrorBoundary;