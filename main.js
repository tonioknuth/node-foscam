'use strict'
const Promise = require('bluebird');
const XML = Promise.promisifyAll(require('xml-js'));
const request = Promise.promisifyAll(require('request'));
const AdvError = require('./errors.js');
const querystring = require('querystring');
const MjpegConsumer = require("mjpeg-consumer");

module.exports = class NodeFoscam {
    constructor(options) {
        this._hostname = options.host || 'localhost';
        this._port = options.port || 88;
        this._usr = options.usr || 'admin';
        this._pwd = options.pwd || '';
        this.consumer = new MjpegConsumer();
    }
    _sendCommand(params) {
        let url = this._buildUrl(params)
        console.log(url);
        return request.getAsync({
            url: url,
            //  headers: {
            //      "Content-Type": this.content_type + "; charset=utf-8"
            //  },
            //  auth: this.auth
        }).then((res) => {
            if (res.statusCode == "200") {
                return XML.xml2js(res.body, {compact: true});
            } else {
                throw new AdvError("command_error", res.statusCode + " - " + res.statusMessage + " - " + res.body);
            }
        });
    }
    _buildUrl(params) {
        let path = this._hostname + ':'+ this._port+ '/cgi-bin/CGIProxy.fcgi?';
        let end = '&usr=' + this._usr + '&pwd=' + this._pwd;
        return path + params + end;
    }
    takePicture(){
      return this._sendCommand("cmd=snapPicture2");
    }
    moveLeft(time){
      var timeout = time || 0
      return this._sendCommand("cmd=ptzMoveLeft").delay(timeout).then((res)=>{
        if(timeout > 0){
            return this.stopMovement();
        }else{
            return res;
        }
      });
    }
    moveRight(time){
      var timeout = time || 0
      return this._sendCommand("cmd=ptzMoveRight").delay(timeout).then((res)=>{
        if(timeout > 0){
            return this.stopMovement();
        }else{
            return res;
        }
      });
    }
    moveUp(time){
      var timeout = time || 0
      return this._sendCommand("cmd=ptzMoveUp").delay(timeout).then((res)=>{
        if(timeout > 0){
            return this.stopMovement();
        }else{
            return res;
        }
      });
    }
    moveDown(time){
      var timeout = time || 0
      return this._sendCommand("cmd=ptzMoveDown").delay(timeout).then((res)=>{
        if(timeout > 0){
            return this.stopMovement();
        }else{
            return res;
        }
      });
    }
    stopMovement(){
      return this._sendCommand("cmd=ptzStopRun");
    }
    resetPosition(){
      return this._sendCommand("cmd=ptzReset");
    }
    setSpeed(speed){
      return this._sendCommand("cmd=setPTZSpeed&speed="+speed);
    }
    zoomIn(time){
      var timeout = time || 0
      return this._sendCommand("cmd=zoomIn").delay(timeout).then((res)=>{
        if(timeout > 0){
            return this.stopZoom();
        }else{
            return res;
        }
      });
    }
    zoomOut(time){
      var timeout = time || 0
      return this._sendCommand("cmd=zoomIn").delay(timeout).then((res)=>{
        if(timeout > 0){
            return this.stopZoom();
        }else{
            return res;
        }
      });
    }
    stopZoom(){
      return this._sendCommand("cmd=zoomStop");
    }
    turnOnInfrared(){
      return this._sendCommand("cmd=openInfraLed");
    }
    turnOffInfrared(){
      return this._sendCommand("cmd=closeInfraLed");
    }
    setSubstreamFormat(format){
      switch(format){
        case "H264":
        var format_id = 0;
        break;
        case "MotionJpeg":
        var format_id = 1;
        break;
        default:
        throw new AdvError("input_error", "Please provide a valid format! (H264 / MotionJpeg)");
        break;
      }
      return this._sendCommand("cmd=setSubStreamFormat&format="+format_id);
    }
    getMjpegStream(){
      return this._sendCommand("cmd=GetMJStream");
    }
    getMjpegEndpoint(){
      return this._buildUrl("cmd=GetMJStream");
    }
    pipeMjpegStream(recipient){
      var url = this.getMjpegEndpoint();
      request(url).pipe(this.consumer).pipe(recipient)
    }
}
