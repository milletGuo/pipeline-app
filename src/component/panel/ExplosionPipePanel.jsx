import React, { Component } from 'react';
import { Form, Slider } from 'antd';

class ExplosionPipePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            particleOptions: {
                emissionRate: 20,
                particleSize: 0.5,
                minimumParticleLife: 6,
                maximumParticleLife: 7,
                minimumSpeed: 9,
                maximumSpeed: 9.5,
                startScale: 1,
                endScale: 20,
            }
        }
    }

    onValuesChange = (changedValues, allValues) => {
        this.props.updateParam(allValues);
    }

    render() {
        const { particleOptions } = this.state;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 },
        };

        return (
            <div style={{ display: this.props.particleVisible }} className="dig-urface-panel">
                <Form {...formItemLayout} className="upload-form" initialValues={particleOptions} onValuesChange={this.onValuesChange}>
                    <Form.Item label="粒子数量：" name="emissionRate" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={5} max={30} />
                    </Form.Item>
                    <Form.Item label="粒子大小：" name="particleSize" style={{ marginBottom: '10px' }}>
                        <Slider step={0.1} min={0.5} max={20.0} />
                    </Form.Item>
                    <Form.Item label="最小生命周期：" name="minimumParticleLife" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={1} max={30.0} />
                    </Form.Item>
                    <Form.Item label="最大生命周期：" name="maximumParticleLife" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={1} max={30.0} />
                    </Form.Item>
                    <Form.Item label="最小速度：" name="minimumSpeed" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={1} max={30.0} />
                    </Form.Item>
                    <Form.Item label="最大速度：" name="maximumSpeed" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={1} max={30.0} />
                    </Form.Item>
                    <Form.Item label="初始比例：" name="startScale" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={1} max={30.0} />
                    </Form.Item>
                    <Form.Item label="终止比例：" name="endScale" style={{ marginBottom: '10px' }}>
                        <Slider step={1} min={1} max={30.0} />
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default ExplosionPipePanel;
