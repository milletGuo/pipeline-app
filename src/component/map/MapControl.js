import MouseTool from '../mapTool/mouseTool';
import InfoWindow from '../mapTool/infoWindow';

import pipeLineInfo from '../../assets/pipeline_line.json';
import pipePointInfo from '../../assets/pipeline_point.json';

import fountain2Url from "../../assets/images/fountain2.png";

const Cesium = window.Cesium;
const mars3DTilesetUrl = window.serverUrl.mars3DTilesetUrl;

const layerUrl = window.serverUrl.pointLineOGCUrl;
const webSocketUrl = window.serverUrl.webSocketUrl;

export default class MapControl {
    constructor(ref) {
        this.containerRef = ref;
        this.initalize();
        this.previousPickedEntity = {
            feature: undefined,
            originalColor: undefined
        };
        this.infoWindowArray = [];
        this.particleSystems = [];
        this.particleOptions = {
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

    // 初始化加载地球
    initalize = () => {
        this.webGlobe = new Cesium.WebSceneControl(this.containerRef.current, { shouldAnimate: true });
        this.webGlobe.appendTDTuMapByWMTS('img');
        this.addM3D();

        // this.webGlobe.flyTo(114.2, 31, 10000, 2);
        // this.addM3DModel();
    }

    // 加载管线模型
    addM3D = () => {
        // 火星在线管线模型加载
        let viewer = this.webGlobe.viewer;
        let tileset = new Cesium.Cesium3DTileset({ url: mars3DTilesetUrl });
        viewer.scene.primitives.add(tileset);
        tileset.readyPromise.then(function (tileset) {
            viewer.zoomTo(tileset);
        });
    }

    addM3DModel = () => {
        // 加载中地IGServer发布的M3D缓存地图文档
        this.M3DModel = this.webGlobe.append('http://101.37.36.37:6163/igs/rest/g3d/pointLine', {});
    }

    pipeLineInfo = (status) => {
        let viewer = this.webGlobe.viewer;
        if (status) {
            viewer.screenSpaceEventHandler.setInputAction((movement) => {
                this.removePopUp('popup');
                let pickedFeature = viewer.scene.pick(movement.position);
                let pickPosition = viewer.scene.pickPosition(movement.position);
                if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
                    if (pickedFeature != this.previousPickedEntity.feature) {
                        if (this.previousPickedEntity.feature != undefined) {
                            //还原前选择要素的本颜色
                            this.previousPickedEntity.feature.color = this.previousPickedEntity.originalColor;
                            //将当前选择要素及其颜色添加到previousPickedEntity
                            this.previousPickedEntity.feature = pickedFeature;
                            this.previousPickedEntity.originalColor = pickedFeature.color;
                        }
                    }
                    //将当前选择要素及其颜色添加到previousPickedEntity
                    this.previousPickedEntity.feature = pickedFeature;
                    this.previousPickedEntity.originalColor = pickedFeature.color;
                    pickedFeature.color = Cesium.Color.BLUE;
                    this.openPointInfo(pickedFeature, pickPosition);
                } else {
                    console.log(pickPosition, '未选中');
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        } else {
            this.removePopUp('popup');
            viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }

    openPointInfo = (pickedFeature, pickPosition) => {
        pipePointInfo.forEach((item) => {
            if (item.id == pickedFeature._batchId) {
                let postion = new Cesium.Cartesian3(pickPosition.x, pickPosition.y, pickPosition.z);
                let data = {
                    '名称': item.feature,
                    '埋深': item.depth,
                    '权属单位': item.ownership
                }
                let infoWindow = new InfoWindow(data);
                this.webGlobe.AppendPopUp(item.id, infoWindow.html, postion, [20, 10], this.removePopUp);
                //刷新
                this.webGlobe.refreshPopUps();
                return;
            }
        });
        pipeLineInfo.forEach((item) => {
            if (item.id == pickedFeature._batchId) {
                let postion = new Cesium.Cartesian3(pickPosition.x, pickPosition.y, pickPosition.z);
                let data = {
                    '名称': item.feature,
                    '管径大小': item.size,
                    '权属单位': item.ownership
                }
                let infoWindow = new InfoWindow(data);
                this.webGlobe.AppendPopUp(item.id, infoWindow.html, postion, [20, 10], this.removePopUp);
                //刷新
                this.webGlobe.refreshPopUps();
                return;
            }
        });
        let postion = new Cesium.Cartesian3(pickPosition.x, pickPosition.y, pickPosition.z);
        let data = '';
        let infoWindow = new InfoWindow(data);
        this.webGlobe.AppendPopUp('popup', infoWindow.html, postion, [20, 10], this.removePopUp);
        //刷新
        this.webGlobe.refreshPopUps();
    }

    globleToLatLng = (position) => {
        let viewer = this.webGlobe.viewer;
        let ellipsoid = viewer.scene.globe.ellipsoid;
        let cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
        let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        let alt = cartographic.height;
        return { lng, lat, alt }
    }

    digSurface = (depth) => {
        let viewer = this.webGlobe.viewer;
        viewer.scene.screenSpaceCameraController.enableInputs = false;
        this.mapTool = new MouseTool(viewer, depth);
    }

    openDepthCheck = () => {
        // let viewer = this.webGlobe.viewer;
        // viewer.scene.globe.depthTestAgainstTerrain = true;
        //popup的位置
        let postion = Cesium.Cartesian3.fromDegrees(114.2, 31);
        console.log(postion);
        //添加PopUP
        this.webGlobe.AppendPopUp('popup', '测试1测试1测试1<br/>测试1测试2<br/>', postion, [95, 0], this.webGlobe.removePopUp);
        //刷新
        this.webGlobe.refreshPopUps();
    }

    closeDepthCheck = () => {
        let viewer = this.webGlobe.viewer;
        viewer.scene.globe.depthTestAgainstTerrain = false;
    }

    openDig = () => {
        let viewer = this.webGlobe.viewer;
        if (viewer.scene.globe.clippingPlanes) {
            this.mapTool.openDig();
        }
    }

    closeDig = () => {
        let viewer = this.webGlobe.viewer;
        if (viewer.scene.globe.clippingPlanes) {
            this.mapTool.closeDig();
        }
    }

    createWebSocket = () => {
        let socketUrl = webSocketUrl.replace("http", "ws");
        let webSocket = new WebSocket(socketUrl);
        this.webSocket = webSocket;

        webSocket.onopen = () => {
            console.log("连接状态：", webSocket.readyState);
        };

        webSocket.onmessage = (message) => {
            this.handleMessage(message);
        };

        webSocket.onclose = () => {
            console.log("连接已关闭");
        };
    }

    closeWebSocket = () => {
        this.infoWindowArray.forEach((item) => {
            this.removePopUp('popup');
        });
        this.webSocket.close();
    }

    handleMessage = (message) => {
        let popupArray = [];
        if (message.data !== '连接成功') {
            let result = JSON.parse(message.data);
            console.log(result)
            result.forEach((item) => {
                let popupObj = {
                    id: item.id,
                    name: item.name.split('-').pop(),
                    lng: item.geometry.x,
                    lat: item.geometry.y,
                    pressure: item.pressure,
                    unit: item.unit
                }
                popupArray.push(popupObj);
            });
        }
        if (this.infoWindowArray.length === 0) {
            popupArray.forEach((popup) => {
                this.renderPopup(popup);
            });
        } else {
            popupArray.forEach((popup) => {
                let data = {
                    '名称': popup.name,
                    '水压': `${popup.pressure}${popup.unit}`
                }
                this.update(this.infoWindowArray, data);
            })
        }

    }

    renderPopup = (popup) => {
        let data = {
            '名称': popup.name,
            '水压': `${popup.pressure}${popup.unit}`
        }
        let postion = Cesium.Cartesian3.fromDegrees(popup.lng, popup.lat);
        let infoWindow = new InfoWindow(data);
        let popupId = this.webGlobe.AppendPopUp(`${popup.id}`, infoWindow.html, postion, [20, 10], this.removePopUp);
        this.infoWindowArray.push({ popupId: popupId, name: popup.name });
        //刷新
        this.webGlobe.refreshPopUps();
    }

    update = (infoWindowArray, data) => {
        console.log(infoWindowArray);
        infoWindowArray.forEach((item) => {
            if (item.name === data['名称']) {
                let parent = document.getElementById(item.popupId);
                let infoWindow = new InfoWindow(data);
                parent.getElementsByTagName('div')[0].children[0].innerHTML = infoWindow.html;

            }
        });
    };

    removePopUp = () => {
        this.webGlobe.removePopUp('popup');
        if (this.previousPickedEntity.feature) {
            this.previousPickedEntity.feature.color = this.previousPickedEntity.originalColor;
            this.previousPickedEntity.feature = undefined;
            this.previousPickedEntity.originalColor = undefined;
        }
    }

    explosionAna = (explosionParam) => {
        // console.log(this.M3DModel[0].boundingSphere.center, '爆炸中心')
        let viewer = this.webGlobe.viewer;
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction((movement) => {
            let pickPosition = viewer.scene.pickPosition(movement.position);
            let center = new Cesium.Cartesian3(pickPosition.x, pickPosition.y, pickPosition.z);
            let direction = explosionParam.direction;
            let distance = explosionParam.distance;
            let option = {
                // 返回的图层子节点
                children: this.M3DModel[0].root.children,
                // 爆炸中心
                center: center,
                // 整体爆炸，(1.0, 0.0, 0.0)沿X轴方向。(0.0,1.0,0.0)沿Y轴方向，(0.0, 0.0, 1.0)沿Z轴方向
                direction: new Cesium.Cartesian3(direction.x, direction.y, direction.z),
                // 爆炸距离
                distance: distance
            };
            this.webGlobe.createExplosion(option);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    resetModel = () => {
        if (this.M3DModel === undefined) {
            return;
        }
        var option = {
            // 返回的图层子节点
            children: this.M3DModel[0].root.children
        }
        this.webGlobe.recoverExplosion(option);
    }

    addExplosion = () => {
        let viewer = this.webGlobe.viewer;
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        viewer.screenSpaceEventHandler.setInputAction((movement) => {
            let pickPosition = viewer.scene.pickPosition(movement.position);
            this.addFountain(pickPosition);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    addFountain = (pickPosition) => {
        let viewer = this.webGlobe.viewer;
        let scene = viewer.scene;
        let entity = viewer.entities.add({ position: pickPosition });
        let particle = scene.primitives.add(new Cesium.ParticleSystem({
            // 粒子的图片
            image: fountain2Url,
            // 起始颜色
            startColor: new Cesium.Color(1, 1, 1, 0.9),
            // 结束颜色
            endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
            // 开始大小比例
            startScale: this.particleOptions.startScale,
            // 结束大小比例
            endScale: this.particleOptions.endScale,
            // 最小生命周期
            minimumParticleLife: this.particleOptions.minimumParticleLife,
            // 最大生命周期
            maximumParticleLife: this.particleOptions.maximumParticleLife,
            // 最小速度
            minimumSpeed: this.particleOptions.minimumSpeed,
            // 最大速度
            maximumSpeed: this.particleOptions.maximumSpeed,
            // 粒子大小
            imageSize: new Cesium.Cartesian2(this.particleOptions.particleSize, this.particleOptions.particleSize * 2),
            // 粒子数量
            emissionRate: this.particleOptions.emissionRate,
            lifetime: 4,
            // 循环是否开启
            loop: true,
            // 粒子的释放方向
            emitter: new Cesium.CircleEmitter(0.2),
            // 是否以米为单位
            sizeInMeters: true
        }));

        viewer.scene.preUpdate.addEventListener((scene, time) => {
            particle.modelMatrix = this.computeModelMatrix(entity, time)
            particle.emitterModelMatrix = this.computeEmitterModelMatrix()
        });

        this.particleSystems.push(particle);
    }

    computeModelMatrix(entity, time) {
        return entity.computeModelMatrix(time, new Cesium.Matrix4());
    }

    computeEmitterModelMatrix() {
        let emitterModelMatrix = new Cesium.Matrix4()
        let translation = new Cesium.Cartesian3()
        let rotation = new Cesium.Quaternion()
        let hpr = new Cesium.HeadingPitchRoll()
        let trs = new Cesium.TranslationRotationScale()

        hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, hpr)
        trs.translation = Cesium.Cartesian3.fromElements(0, 0, 1, translation)
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation)
        return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix)
    }

    updateParam = (params) => {
        this.particleOptions.startScale = params.startScale;
        this.particleOptions.endScale = params.endScale;
        this.particleOptions.minimumParticleLife = params.minimumParticleLife;
        this.particleOptions.maximumParticleLife = params.maximumParticleLife;
        this.particleOptions.minimumSpeed = params.minimumSpeed;
        this.particleOptions.maximumSpeed = params.maximumSpeed;
        this.particleOptions.emissionRate = params.emissionRate;
        this.particleOptions.particleSize = params.particleSize;
        this.particleSystems.forEach((item) => {
            item.startScale = params.startScale;
            item.endScale = params.endScale;
            item.minimumParticleLife = params.minimumParticleLife;
            item.maximumParticleLife = params.maximumParticleLife;
            item.minimumSpeed = params.minimumSpeed;
            item.maximumSpeed = params.maximumSpeed;
            item.emissionRate = params.emissionRate;
            // console.log(params.particleSize)
            // item.imageSize = new Cesium.Cartesian2(params.particleSize, params.particleSize * 2);
        });
    }

    resetExplosion = () => {
        let viewer = this.webGlobe.viewer;
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.particleSystems.forEach((item) => {
            viewer.scene.primitives.remove(item);
        });
    }
}