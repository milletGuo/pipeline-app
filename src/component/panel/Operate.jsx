import React, { Component } from 'react';
import { Checkbox } from 'antd';


export default class Operate extends Component {

    depthCheck = (e) => {
        this.props.depthCheck(e.target.checked);
    }

    digSurface = (e) => {
        this.props.digSurfacePanel(e.target.checked);
    }

    pipeLineInfo = (e) => {
        this.props.pipeLineInfo(e.target.checked);
    }

    facilityAccess = (e) => {
        this.props.facilityAccess(e.target.checked);
    }

    explosionAnaPanel = (e) => {
        this.props.explosionAnaPanel(e.target.checked);
    }

    explosionPipePanel = (e) => {
        this.props.explosionPipePanel(e.target.checked);
    }

    render() {
        return (
            <div className="operate">
                <div><Checkbox onChange={this.depthCheck}>开启地形</Checkbox></div>
                <div><Checkbox onChange={this.digSurface}>地表开挖</Checkbox></div>
                <div><Checkbox onChange={this.pipeLineInfo}>管线信息</Checkbox></div>
                <div><Checkbox onChange={this.facilityAccess}>设施接入</Checkbox></div>
                {/* <div><Checkbox onChange={this.explosionAnaPanel}>爆炸分析</Checkbox></div> */}
                <div><Checkbox onChange={this.explosionPipePanel}>爆管模拟</Checkbox></div>
            </div>
        )
    }
}