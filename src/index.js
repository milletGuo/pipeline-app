import React from 'react';
import ReactDOM from 'react-dom';
import App from './component/App';
import './assets/css/index.css';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');


ReactDOM.render(
    <ConfigProvider locale={zhCN}><App /></ConfigProvider>,
    document.getElementById('root'));
