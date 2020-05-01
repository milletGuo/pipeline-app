/*version 20190826 by wk  add MilStd*/
/*version 20190821 by hzt create*/
/**
* Util工具类,方法不对外使用
* @constructor
*/
var Util = function () {

    this.isIE = /(Trident)|(Edge)/.test(navigator.userAgent);

    var escape = /["\\\x00-\x1f\x7f-\x9f]/g;
    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
    var hasOwn = Object.prototype.hasOwnProperty;

    this.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
        if (o === null) {
            return 'null';
        }

        var pairs, k, name, val, type = typeof (o);

        if (type === 'undefined') {
            return undefined;
        }
        if (type === 'number' || type === 'boolean') {
            return String(o);
        }
        if (type === 'string') {
            return this.quoteString(o);
        }
        if (typeof o.toJSON === 'function') {
            return this.toJSON(o.toJSON());
        }
        if (type === 'date') {
            var month = o.getUTCMonth() + 1,
				day = o.getUTCDate(),
				year = o.getUTCFullYear(),
				hours = o.getUTCHours(),
				minutes = o.getUTCMinutes(),
				seconds = o.getUTCSeconds(),
				milli = o.getUTCMilliseconds();

            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (milli < 100) {
                milli = '0' + milli;
            }
            if (milli < 10) {
                milli = '0' + milli;
            }
            return '"' + year + '-' + month + '-' + day + 'T' +
				hours + ':' + minutes + ':' + seconds +
				'.' + milli + 'Z"';
        }

        pairs = [];

        if (typeof o === 'Array') {
            for (k = 0; k < o.length; k++) {
                pairs.push(this.toJSON(o[k]) || 'null');
            }
            return '[' + pairs.join(',') + ']';
        }
        if (typeof o === 'object') {
            for (k in o) {
                if (hasOwn.call(o, k)) {
                    type = typeof k;
                    if (type === 'number') {
                        name = '"' + k + '"';
                    } else if (type === 'string') {
                        name = this.quoteString(k);
                    } else {
                        continue;
                    }
                    type = typeof o[k];

                    if (type !== 'function' && type !== 'undefined') {
                        val = this.toJSON(o[k]);
                        pairs.push(name + ':' + val);
                    }
                }
            }
            return '{' + pairs.join(',') + '}';
        }
    };
    this.evalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        return eval('(' + str + ')');
    };
    this.secureEvalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        var filtered =
			str
			.replace(/\\["\\\/bfnrtu]/g, '@')
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        if (/^[\],:{}\s]*$/.test(filtered)) {
            return eval('(' + str + ')');
        }
        throw new SyntaxError('Error parsing JSON, source is not valid.');
    };
    this.quoteString = function (str) {
        if (str.match(escape)) {
            return '"' + str.replace(escape, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + str + '"';
    };
    //将object对象转换成地形分析的专用类:FLoodAnalyzeInfo、CutFillInfo、ViewShedInfo、PointQueryInfo、VisibleInfo、SlopeInfo、AspectInfo
    this.convertObjectToAnalyseTypeInfo = function (object) {
        if (object == null)
            return null;
        var info = null;
        switch (object.type) {
            case 1:
                {
                    info = new FLoodAnalyzeInfo();
                    info.type = object.type;
                    info.connectivity = object.connectivity; //考虑连通性标识
                    info.startpos = object.startpos; //开始选择起点
                    info.startreg = object.startreg; //开始选择淹没区
                    info.height = object.height; //当前高程
                    info.alpha = object.alpha; //透明度(0-1.0之间有效)
                    info.max = object.max; //高程最大值
                    info.min = object.min; //高程最小值    
                    info.regzoom = object.regzoom; //淹没区域扩大倍数        
                    info.floodclr = object.floodclr; //淹没区域颜色 
                    return info;
                }
            case 2:
                {
                    info = new CutFillInfo();
                    info.type = object.type;
                    info.startreg = object.startreg; //开始选择区范围
                    info.height = object.height; //当前高程
                    info.min = object.min; //高程最小值
                    info.max = object.max; //高程最大值
                    info.cutclr = object.cutclr; //挖的颜色
                    info.fillclr = object.fillclr; //填的颜色
                    info.nocutfillclr = object.nocutfillclr; //不填不挖的颜色
                    info.surfacearea = object.surfacearea; //表面积
                    info.fillvolume = object.fillvolume; //填充体积
                    info.cutVolume = object.cutVolume; //挖出体积
                    return info;
                }
            case 3:
                {
                    info = new ViewShedInfo();
                    info.type = object.type;
                    info.startpos = object.startpos; //开始选择起点
                    info.startreg = object.startreg; //开始选择分析区
                    info.height = object.height; //观察点高程
                    info.alpha = object.alpha; //透明度(0-1.0之间有效)
                    info.viewclr = object.viewclr; //可视域颜色
                    info.shedclr = object.shedclr; //非可视域颜色
                    return info;
                }
            case 4:
                {
                    info = new PointQueryInfo();
                    info.type = object.type;
                    info.pos = new Point3D(object.pos.x, object.pos.y, object.pos.z); //当前点三维坐标
                    info.longitude = object.longitude; //经度
                    info.latitude = object.latitude; //纬度
                    info.height = object.height; //高程
                    info.slope = object.slope; //坡度
                    info.aspect = object.aspect; //坡向
                    return info;
                }
            case 5:
                {
                    info = new VisibleInfo();
                    info.type = object.type;
                    return info;
                }
            case 6:
                {
                    info = new SlopeInfo();
                    info.type = object.type;
                    return info;
                }
            case 7:
                {
                    info = new AspectInfo();
                    info.type = object.type;
                    return info;
                }
        }
    };
};

/**
 * 发送跨域ajax请求
 * @param {string} url 请求地址
 * @param {string} type 请求方式get、post
 * @param {Object} postData post请求内容
 * @param {requestSuccessCallback} successCallback 查询成功回调函数
 * @param {requestErrorCallback} errorCallback 查询失败回调函数
 * @param {string} dataType 请求返回数据类型
 * @param {string} proxy 如果使用代理，给定代理地址
*/
Util.corsAjax = function (url, type, postData, successCallback, errorCallback, dataType, proxy) {
    dataType = dataType || 'json';
    if (proxy) {
        url = proxy + "?request=" + encodeURIComponent(url);
        var param = {
            url: url,
            type: type,
            dataType: dataType,
            success: function (res, code) {
                successCallback && successCallback(res, code);
            },
            error: function (xhr) {
                errorCallback && errorCallback(xhr);
            }
        };
        if (type.toLowerCase() === 'post') {
            param.data = postData;
        }
        $.ajax(param);
        return;
    }

    type = type || "get";
    if (window.XDomainRequest && !/MSIE 10.0/.test(window.navigator.userAgent)) {
        var xdr = new window.XDomainRequest();
        xdr.onload = function () {
            var res = dataType === 'json' ? $.parseJSON(this.responseText) : this.responseText;
            successCallback && successCallback(res);
        };
        xdr.onerror = function () {
            errorCallback && errorCallback(xdr);
        };
        xdr.open(type, url);
        if (type.toLowerCase() === 'post') {
            xdr.send(postData);
        } else {
            xdr.send();
        }
    } else {
        $.support.cors = true;
        var param = {
            url: url,
            type: type,
            dataType: dataType,
            success: function (res, code) {
                successCallback && successCallback(res, code);
            },
            error: function (xhr) {
                errorCallback && errorCallback(xhr);
            }
        };
        if (type.toLowerCase() === 'post') {
            param.data = postData;
        }
        $.ajax(param);
    }
}

/*********************************************************start 要素查询************************************************************************/
/****************************start 二维查询*************************************/
var MapDocQuery = function () {

    /**
    * 查询对应的地图服务,参考ClassLib.js中的MapDocObj对象
    * @type {MapDocObj}
    */
    this.docObj = null;

    /**
    * 地图服务名称
    * @type {String}
    */
    this.docName = '';
    /**
    * 地图在文档下得序号,一般为0
    * @type {Int}
    */
    this.mapIndex = 0;
    /**
    * 图层序号
    * @type {Int}
    */
    this.layerID = 0;

    /**
    * 几何类型描述,格式:point | circle | rect | line | polygon
    * @type {string}
    */
    this.geometryType = '';

    /**
    * 点的集合        
    * 几何约束区域参数，其形式取决于geometryType的值，即取决于几何约束类型
    * point--x,y,[ neardistance],neardistance为可选，即容差，下同
    * circle--x，y，r 注意在球上执行画圆时由于插件提供的圆为椭圆，给出的点集也是大量离散点，因此这种情况下，依然采用polygon方式执行查询
    * rect--xmin，ymin，xmax，ymax 
    * line--x1,y1,x2,y2,x3,y3…;[neardistance]
    * polygon--x1,y1,x2,y2,x3,y3…第一个点与最后一个点相同
    * @type {string}
    */
    this.geometry = '';

    /**
    * 符合SQL查询规范的任何字符串
    * @type {string}
    */
    this.where = '';


    /**
    * 返回结果的序列化形式
    * @type {string}
    */
    this.f = 'json',

    /**
    * 需要查询的要素Id号,格式：oid1，oid2，oid3
    * @type {string}
    */
    this.objectIds = '';

    /**
    * 指定查询结果的结构，json规范
    *    struct={ IncludeAttribute:true | false, 
    *             IncludeGeometry:true | false, 
    *             IncludeWebGraphic :true |false}
    *    参数不区分大小写，可以省略，默认为IncludeAttribute:true，其他参数均为false
    * @type {json}
    */
    this.structs = '';

    /**
    * 返回的要素分页的页数，默认返回第0页
    * @type {string}
    */
    this.page = '';
    /**
    * 要素结果集每页的记录数量，默认为20条/页
    * @type {string}
    */
    this.pageCount = '';

    /**
    *指定查询规则，Json表示形式
    *    rule={  CompareRectOnly:true | false,
    *            EnableDisplayCondition:true | false,
    *            MustInside : true|false, 
    *            Intersect : true|false }
    *    参数不区分大小写，可以省略
    *    CompareRectOnly表示是否仅比较要素的外包矩形，来判定是否与几何约束图形有交集；
    *    EnableDisplayCondition表示是否将隐藏图层计算在内；
    *    MustInside表示是否完全包含；
    *    Intersect：是否相交
    * @type {json}
    */
    this.rule = '';

    /**
    * 这里查询结果,这里主要是存放查询过程中报错信息
    * @type {string}
    */
    this.queryResult = '未查询';

    this.ip = "";
    this.port = "";
};
/**
 * 查询操作
 * @param successCallback {requestSuccessCallback} 查询成功回调函数
 * @param errorCallback {requestErrorCallback} 查询成功回调函数
 */
MapDocQuery.prototype.beginQuery = function (successCallback, errorCallback) {
    var o = this;
    //检验参数合法性
    //if (o.docObj && o.docObj.type != DocType.TypeDoc) {
    //    o.queryResult = "目标文档不符合查询要求";
    //    alert(o.queryResult);
    //    return;
    //}
    //如果docName未设置则设置为服务名
    if (!o.docName)
        o.docName = o.docObj.name;
    var queryString = 'query?guid=' + Math.random();
    //构建查询参数
    if (o.geometryType && o.geometry) {
        //这里可以进行进一步的参数验证
        queryString += '&geometryType=' + o.geometryType + '&geometry=' + o.geometry;
    }
    if (o.where)
        queryString += '&where=' + o.where;
    if (o.f)
        queryString += '&f=' + o.f;
    if (o.objectIds)
        queryString += '&objectIds=' + o.objectIds;
    if (o.structs)
        queryString += '&structs=' + o.structs;
    if (o.page)
        queryString += '&page=' + o.page;
    if (o.pageCount)
        queryString += '&pageCount=' + o.pageCount;
    if (o.rule)
        queryString += '&rule=' + o.rule;
    var url = 'http://' + o.ip + ':' + o.port + '/igs/rest/mrfs/docs/' + o.docName + '/' + o.mapIndex + '/' + o.layerID + '/' + queryString;
    Util.corsAjax(url, 'get', null, successCallback, errorCallback, 'json', null);
}
/****************************end 二维查询*************************************/

/****************************start 三维查询*************************************/
/**
* 三维文档查询参数
* 必填参数为(docName,layerIndex)或gdbp,其他参数可选
* @author wjh
* @constructor
*/
var G3DDocQuery = function () {

    /**
    * igs服务ip
    * @type {string}
    */
    this.serverIp = "127.0.0.1";
    /**
     * igs服务ip
     * @type {int}
     */
    this.serverPort = 6163;
    /**
    * 三维文档的名称(docName与gdbp参数二选一)
    * @type {string}
    */
    this.docName = '';
    /**
    * 三维图层的gdbpUrl(docName与gdbp参数二选一)
    * @type {string}
    */
    this.gdbp = '';
    /**
    * 图层序号
    * @type {int}
    */
    this.layerIndex = 0;

    /**
    * 几何类型描述,格式:point | circle | rect | line | polygon | Point3D
    * @type {string}
    */
    this.geometryType = '';

    /**
    * 点的集合        
    * 几何约束区域参数，其形式取决于geometryType的值，即取决于几何约束类型
    * point--x,y,[ neardistance],neardistance为可选，即容差，下同
    * Point3D--x,y,z,[neardistance],neardistance为可选，即容差，下同
    * circle--x，y，r 注意在球上执行画圆时由于插件提供的圆为椭圆，给出的点集也是大量离散点，因此这种情况下，依然采用polygon方式执行查询
    * rect--xmin，ymin，xmax，ymax 
    * line--x1,y1,x2,y2,x3,y3…;[neardistance]
    * polygon--x1,y1,x2,y2,x3,y3…第一个点与最后一个点相同
    * @type {string}
    */
    this.geometry = '';

    /**
    * 符合SQL查询规范的任何字符串
    * @type {string}
    */
    this.where = '';

    /**
    * 需要查询的要素Id号,格式：oid1，oid2，oid3
    * @type {string}
    */
    this.objectIds = '';

    /**
    * 指定查询结果的结构，json规范
    *    struct={ IncludeAttribute:true | false, 
    *             IncludeGeometry:true | false, 
    *             IncludeWebGraphic :true |false}
    *    参数不区分大小写，可以省略，默认为IncludeAttribute:true，其他参数均为false
    * @type {json}
    */
    this.structs = '';

    /**
    * 返回的要素分页的页数，默认返回第0页
    * @type {string}
    */
    this.page = '';
    /**
    * 要素结果集每页的记录数量，默认为20条/页
    * @type {string}
    */
    this.pageCount = '';

    /**
    *指定查询规则，Json表示形式
    *    rule={  CompareRectOnly:true | false,
    *            EnableDisplayCondition:true | false,
    *            MustInside : true|false, 
    *            Intersect : true|false }
    *    参数不区分大小写，可以省略
    *    CompareRectOnly表示是否仅比较要素的外包矩形，来判定是否与几何约束图形有交集；
    *    EnableDisplayCondition表示是否将隐藏图层计算在内；
    *    MustInside表示是否完全包含；
    *    Intersect：是否相交
    * @type {json}
    */
    this.rule = '';

    /**
    * 这里查询结果,这里主要是存放查询过程中报错信息
    * @type {string}
    */
    this.queryResult = '未查询';
    this.rtnLabel = false;
};
G3DDocQuery.prototype.queryG3DFeature = function (successCallback, errorCallback, type) {
    var o = this;
    if (!o) {
        alert("调用queryG3DFeature，查询参数g3DDocQuery不能为空");
        return;
    }
    var querystring;
    if (o.gdbp) {
        querystring = 'gdbp=' + o.gdbp;
    } else {
        querystring = 'docName=' + o.docName + '&layerindex=' + o.layerIndex;
    }
    //构建查询参数
    if (o.geometryType && o.geometry) {
        //这里可以进行进一步的参数验证
        querystring += '&geometryType=' + o.geometryType + '&geometry=' + o.geometry;
    }
    querystring += '&f=json'; //只能是json格式
    if (o.where)
        querystring += '&where=' + o.where;
    if (o.objectIds)
        querystring += '&objectIds=' + o.objectIds;
    if (o.structs)
        querystring += '&structs=' + o.structs;
    if (o.page)
        querystring += '&page=' + o.page;
    if (o.pageCount)
        querystring += '&pageCount=' + o.pageCount;
    if (o.rule)
        querystring += '&rule=' + o.rule;
    if (o.rtnLabel)
        querystring += '&rtnLabel=' + o.rtnLabel;
    var url = 'http://' + o.serverIp + ':' + o.serverPort + '/igs/rest/g3d/getFeature';
    var postData = null;
    if (type && type.toLowerCase() === 'post') {
        postData = querystring;
    } else {
        url = url + "?" + querystring;
    }
    Util.corsAjax(url, type, postData, function (res, code) {
        successCallback && successCallback(res, code, o.layerIndex);
    }, errorCallback, 'json', this.proxy);
};
/****************************end 三维查询*************************************/
/*********************************************************end 要素查询************************************************************************/