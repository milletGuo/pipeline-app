export default class InfoWindow {
    constructor(data) {
        this.data = data;
        this.html = this.createHtml();
    }

    createHtml() {
        let html = '';
        let data = this.data;
        if (data === '') {
            html = '暂无数据'
        } else {
            for (let key in data) {
                html += `<span>${key}：${data[key]}</span><br>`;
            }
        }
        return html;
    }

    updateHtml(data) {
        let html = '';
        for (let key in data) {
            html += `${key}:${data[key]}`;
        }
        this.html = html;
    }

    clear() {
        this.html = '';
    }
}