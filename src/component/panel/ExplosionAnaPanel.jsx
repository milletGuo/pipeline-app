import React, { Component } from 'react';
import { InputNumber, Slider, Button } from 'antd';


export default class ExplosionAnaPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            distance: 200,
            directionX: 1,
            directionY: 0,
            directionZ: 0,
        }
    }

    onChangeDistance = (value) => {
        this.setState({ distance: value });
    }

    onChangeX = (value) => {
        this.setState({ directionX: value });
    }

    onChangeY = (value) => {
        this.setState({ directionY: value });
    }

    onChangeZ = (value) => {
        this.setState({ directionZ: value });
    }

    explosionAna = () => {
        this.props.explosionAna({
            distance: this.state.distance,
            direction: {
                x: this.state.directionX,
                y: this.state.directionY,
                z: this.state.directionZ,
            }
        });
    }

    resetModel = () => {
        this.props.resetModel();
    }

    render() {
        return (
            <div className="dig-urface-panel" style={{ display: this.props.visible }}>
                <div style={{ margin: '10px' }}>
                    <span className="depth-input">
                        <span>爆炸距离：</span>
                        <InputNumber size="small" min={5} max={1000} value={this.state.distance} onChange={this.onChangeDistance} />
                        <span>(米)</span>
                    </span>
                </div>
                <div style={{ margin: '10px' }}>
                    <span>爆炸方向：</span>
                    <div style={{ height: '30px', marginLeft: '70px' }}>
                        <span>X:</span>
                        <Slider style={{ position: 'relative', top: '-26px', marginLeft: '25px' }}
                            value={this.state.directionX}
                            onChange={this.onChangeX} />
                    </div>
                    <div style={{ height: '30px', marginLeft: '70px' }}>
                        <span>Y:</span>
                        <Slider style={{ position: 'relative', top: '-26px', marginLeft: '25px' }}
                            value={this.state.directionY}
                            onChange={this.onChangeY} />
                    </div>
                    <div style={{ height: '30px', marginLeft: '70px' }}>
                        <span>Z:</span>
                        <Slider style={{ position: 'relative', top: '-26px', marginLeft: '25px' }}
                            value={this.state.directionZ}
                            onChange={this.onChangeZ} />
                    </div>
                </div>
                <div style={{ margin: '10px' }}>
                    <Button type="primary" style={{ marginRight: '30px' }} onClick={this.explosionAna}>拾取爆炸中心</Button>
                    <Button type="primary" onClick={this.resetModel}>恢复</Button>
                </div>
            </div >
        )
    }
}