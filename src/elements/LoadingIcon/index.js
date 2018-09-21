import React, { Component } from 'react';
import './style.scss';


function LoadingIcon () {
    return (<div className="jb-loading">
        <span className="jb-loading-dot -sky-blue"></span>
        <span className="jb-loading-dot -orange"></span>
        <span className="jb-loading-dot -red"></span>
    </div>)
}

export default LoadingIcon