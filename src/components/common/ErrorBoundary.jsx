import React, { Component } from 'react';
import { ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // High-contrast, beautiful fallback UI when a component crashes
            return (
                <div className="p-6 my-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-3">
                    <div className="inline-flex p-3 bg-red-500/20 text-red-500 rounded-full">
                        <ShieldAlert size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-red-400">Content Temporarily Unavailable</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">This specific block crashed, but the rest of AuraTalent is safe and running.</p>
                </div>
            );
        }

        return this.props.children; 
    }
}