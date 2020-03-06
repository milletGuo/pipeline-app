import React, { Component } from 'react';
import { InputNumber, Checkbox, Button } from 'antd';


export default class DigSurfacePanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            depth: 30,
            checked: true
        }
    }

    onChange = (value) => {
        this.setState({ depth: value });
    }

    isDig = (e) => {
        this.setState({ checked: e.target.checked });
        this.props.isDig(e.target.checked);
    }

    digSurface = () => {
        this.props.digSurface(-this.state.depth);
    }

    clearDigSurface = () => {
        this.props.clearDigSurface();
    }

    render() {
        return (
            <div className="dig-urface-panel" style={{ display: this.props.display }}>
                <div style={{ margin: '10px' }}>
                    <span className="depth-input">
                        <span>开挖深度：</span>
                        <InputNumber size="small" min={5} max={1000} defaultValue={30} value={this.state.depth} onChange={this.onChange} />
                        <span>(米)</span>
                    </span>
                    <Checkbox onChange={this.isDig} style={{ color: '#ffffff' }} checked={this.state.checked}>是否挖地</Checkbox>
                </div>
                <div style={{ margin: '10px' }}>
                    <Button type="primary" style={{ marginRight: '30px' }} onClick={this.digSurface} >绘制矩形区域</Button>
                    <Button type="primary" onClick={this.clearDigSurface}>清除</Button>
                </div>
            </div >
        )
    }
}