
import bottomUrl from "../../assets/images/bottom.jpg";
import sideUrl from "../../assets/images/side.jpg";

const Cesium = window.Cesium;

export default class MouseTool {
    constructor(viewer, depth) {
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

        this.startPosition = null;
        this.endPosition = null;
        this.shape = null;
        this.rectangle = null;
        this.depth = depth;

        this.active();
    }

    active() {
        this.handler.setInputAction(this.onMouseDown, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    globleToLatLng = (position) => {
        let viewer = this.viewer;
        let ellipsoid = viewer.scene.globe.ellipsoid;
        let cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
        let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        let alt = cartographic.height;
        return { lng, lat, alt }
    }

    onMouseDown = (event) => {
        if (!this.startPosition) {
            let earthPosition = this.viewer.scene.pickPosition(event.position);
            if (Cesium.defined(earthPosition)) {
                this.startPosition = this.globleToLatLng(earthPosition);
            }
        }
    }

    onMouseMove = (event) => {

        if (!this.startPosition) {
            return;
        }
        if (this.rectangle) {
            this.rectangle = null;
            this.viewer.entities.remove(this.shape);
        }
        if (Cesium.defined(this.startPosition)) {
            let newPosition = this.viewer.scene.pickPosition(event.endPosition);
            if (Cesium.defined(newPosition)) {
                this.endPosition = this.globleToLatLng(newPosition);;
            }
        }
        this.shape = this.drawShape(this.startPosition, this.endPosition);
    }

    onMouseUp = () => {
        if (!this.startPosition) {
            return;
        }
        if (!this.endPosition) {
            return;
        }
        this.viewer.entities.remove(this.shape);
        this.surfaceExcavation(this.startPosition, this.endPosition)
        this.unActive();
    }

    unActive() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    }

    drawShape(northWest, southEast) {
        let shape;
        shape = this.viewer.entities.add({
            name: 'Red translucent rectangle',
            rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(northWest.lng, southEast.lat, southEast.lng, northWest.lat),
                material: Cesium.Color.RED.withAlpha(0.5)
            }
        });
        this.rectangle = new Cesium.Rectangle.fromDegrees(northWest.lng, southEast.lat, southEast.lng, northWest.lat);
        return shape;
    }


    surfaceExcavation = (northWest, southEast) => {
        let viewer = this.viewer;
        let position1 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(northWest.lng, northWest.lat, 0));
        let position2 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(northWest.lng, southEast.lat, 0));
        let position3 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(southEast.lng, southEast.lat, 0));
        let position4 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(southEast.lng, northWest.lat, 0));
        let position5 = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(Math.ceil(northWest.lng * 100000) / 100000, northWest.lat, 0));

        let points = [position1, position2, position3, position4, position5]; // 指定开挖多边形的点集，判断多边形点集是否为凸多边形，且为逆时针
        let pointsLength = points.length;
        let clippingPlanes = [];
        for (var i = 0; i < pointsLength; ++i) {
            let nextIndex = (i + 1) % pointsLength;
            let midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
            midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);
            let up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
            let right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
            right = Cesium.Cartesian3.normalize(right, right);
            let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
            normal = Cesium.Cartesian3.normalize(normal, normal);
            let originCenteredPlane = new Cesium.Plane(normal, 0.0);
            let distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
            clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
        }
        viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: 3,
            edgeColor: Cesium.Color.WHITE,
        });
        this.wall = {
            wall: {
                positions: points,
                maximumHeights: [0.1, 0.1, 0.1, 0.1, 0.1],
                minimumHeights: [this.depth, this.depth, this.depth, this.depth, this.depth],
                material: new Cesium.ImageMaterialProperty({
                    image: sideUrl,
                    repeat: new Cesium.Cartesian2(points.length, 1.0)
                }),
            }
        }
        this.polygon = {
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(points),
                material: new Cesium.ImageMaterialProperty({
                    image: bottomUrl,
                    repeat: new Cesium.Cartesian2(points.length / 2, points.length / 2)
                }),
                closeTop: false,
                height: this.depth // 自定义底面高度，最好与wall的minimumHeights保持一致
            }
        }
        // 使用wall来填充侧面
        viewer.entities.add(this.wall);
        // 使用polygon来填充底面
        viewer.entities.add(this.polygon)
    }

    openDig = () => {
        this.viewer.scene.globe.clippingPlanes.enabled = true;
        this.viewer.entities.add(this.wall);
        this.viewer.entities.add(this.polygon);
    }

    closeDig = () => {
        this.viewer.scene.globe.clippingPlanes.enabled = false;
        // this.viewer.entities.remove(this.wall);
        // this.viewer.entities.remove(this.polygon);
        this.viewer.entities.removeAll();
    }
}