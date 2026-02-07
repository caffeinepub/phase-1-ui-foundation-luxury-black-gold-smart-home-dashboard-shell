import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: string) => void;
}

interface State {
  hasError: boolean;
}

export class VirtualHomeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Scene Error Boundary caught:', error, errorInfo);
    this.props.onError(
      `An error occurred while rendering the 3D scene: ${error.message}`
    );
  }

  render() {
    if (this.state.hasError) {
      return null; // Parent will show error UI
    }

    return this.props.children;
  }
}
