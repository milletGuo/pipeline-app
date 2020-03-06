import React, { PureComponent } from 'react'
import Operate from '../panel/Operate';
import MapControl from './MapControl';
import DigSurfacePanel from '../panel/DigSurfacePanel';
import ExplosionAnaPanel from '../panel/ExplosionAnaPanel';
import ExplosionPipePanel from '../panel/ExplosionPipePanel';

import axios from 'axios';

const resetWebSocketUrl = window.serverUrl.resetWebSocketUrl;

export default class CesiumMap extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            display: 'none',
            visible: 'none',
            particleVisible: 'none',
        }
        this.containerRef = React.createRef();
    }

    componentDidMount() {
        this.mapControl = new MapControl(this.containerRef);
    }

    depthCheck = (status) => {
        if (status) {
            this.mapControl.openDepthCheck();
        } else {
            this.mapControl.closeDepthCheck();
        }
    }

    digSurfacePanel = (status) => {
        if (status) {
            this.setState({ display: 'block' });
        } else {
            this.setState({ display: 'none' });
            this.mapControl.closeDig();
        }
    }

    isDig = (status) => {
        if (status) {
            this.mapControl.openDig();
        } else {
            this.mapControl.closeDig();
        }
    }

    digSurface = (depth) => {
        this.mapControl.digSurface(depth);
    }

    clearDigSurface = () => {
        this.mapControl.closeDig();
    }

    pipeLineInfo = (status) => {
        this.mapControl.pipeLineInfo(status);
    }

    facilityAccess = (status) => {
        if (status) {
            axios.get(resetWebSocketUrl + '?name=供水管网压力监测数据-模拟-监测点1&size=0')
                .then(result => {
                    if (result.status === 200) {
                        this.mapControl.createWebSocket();
                    }
                })
                .then(
                    axios.get(resetWebSocketUrl + '?name=供水管网压力监测数据-模拟-监测点2&size=0')
                        .catch((err) => {
                            console.log(err, 'error');
                        })
                )
                .then(
                    axios.get(resetWebSocketUrl + '?name=供水管网压力监测数据-模拟-监测点3&size=0')
                        .catch((err) => {
                            console.log(err, 'error');
                        })
                )
                .then(
                    axios.get(resetWebSocketUrl + '?name=供水管网压力监测数据-模拟-监测点4&size=0')
                        .catch((err) => {
                            console.log(err, 'error');
                        })
                )
                .then(
                    axios.get(resetWebSocketUrl + '?name=供水管网压力监测数据-模拟-监测点5&size=0')
                        .then(result => {
                            if (result.status === 200) {
                                this.mapControl.createWebSocket();
                            }
                        })
                )
                .catch((err) => {
                    console.log(err, 'error');
                });
        } else {
            this.mapControl.closeWebSocket();
        }
    }

    explosionAnaPanel = (status) => {
        if (status) {
            this.mapControl.addM3DModel();
            this.setState({ visible: 'block' });
        } else {
            this.setState({ visible: 'none' });
            this.mapControl.resetModel();
        }
    }

    explosionAna = (explosionParam) => {
        this.mapControl.explosionAna(explosionParam);
    }

    resetModel = () => {
        this.mapControl.resetModel();
    }

    explosionPipePanel = (status) => {
        if (status) {
            this.mapControl.addExplosion();
            this.setState({ particleVisible: 'block' });
        } else {
            this.setState({ particleVisible: 'none' });
            this.mapControl.resetExplosion();
        }
    }

    updateParam = (explosionParam) => {
        this.mapControl.updateParam(explosionParam);
    }

    render() {
        return (
            <div>
                <div id="cesium-map" ref={this.containerRef} style={{ width: '100%', height: '100%' }} />
                <Operate
                    depthCheck={(status) => this.depthCheck(status)}
                    digSurfacePanel={(status) => this.digSurfacePanel(status)}
                    pipeLineInfo={(status) => this.pipeLineInfo(status)}
                    facilityAccess={(status) => this.facilityAccess(status)}
                    explosionAnaPanel={(status) => this.explosionAnaPanel(status)}
                    explosionPipePanel={(status) => this.explosionPipePanel(status)}
                >
                </Operate>
                <DigSurfacePanel
                    display={this.state.display}
                    isDig={(status) => this.isDig(status)}
                    digSurface={(depth) => this.digSurface(depth)}
                    clearDigSurface={this.clearDigSurface}
                >
                </DigSurfacePanel>
                <ExplosionAnaPanel
                    visible={this.state.visible}
                    explosionAna={(explosionParam) => this.explosionAna(explosionParam)}
                    resetModel={this.resetModel}>
                </ExplosionAnaPanel>
                <ExplosionPipePanel
                    particleVisible={this.state.particleVisible}
                    updateParam={(explosionParam) => this.updateParam(explosionParam)}>
                </ExplosionPipePanel>
            </div>
        )
    }
}