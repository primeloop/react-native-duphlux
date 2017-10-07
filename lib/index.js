'use strict';
import request from 'react-native-request'
var CryptoJS = require("crypto-js");

let Api_Request = function(args){
        let info;
        let defaultParameters = {
            token:'',
            timeout: 60,
            mode: 'live',
            baseUrl: "https://duphlux.com/webservice/",
            method: 'post',

        }
        
        let mergeParams = function(defaultParameters, args){
             Object.keys(defaultParameters).map(function(v){                 
                 defaultParameters[v] = (args[v] !== undefined && args[v] !== null)? args[v]:defaultParameters[v];
            });
            return defaultParameters;
        }
        this.params  = mergeParams(defaultParameters, args);
       
        let computeHeader = ()=>{
            let header = {};
            header['token'] = this.params.token;
            header['Content-Type'] = "application/json";
            header['Cache-Control'] = "no-cache";
            return header;
        }
        this.sendRequest = function(endpoint, data){
            return new Promise(function(resolve, reject) {
                let h = computeHeader();
                let callback = function(err, response, body){
                    if (!err && response.statusCode == 200) {
                        //JSON.parse(body);
                        resolve(body);   
                    }else{
                        reject(err);
                    }
                }

                let options = {
                    url: getUrl(endpoint),
                    headers: h,
                    body: data,
                    json: true,
                    method: getMethod(),
                    callback
                }
                fetch(getUrl(endpoint),{
                    method:"POST",
                    headers:h,
                    body:JSON.stringify(data),
                    callback
                }).then((response) => 
                {
                    if (response.status == 200) {
                        //alert(response._55)
                        resolve(response._bodyInit) 
                    }else{
                        reject(err);
                    }
                })
            });
        }
        let getMethod = ()=>{
            return this.params.method;
        }
        let getUrl = (endpoint)=>{
            return this.params.baseUrl+endpoint;
        }
        this.getTimeout = function(options){
            return (options !== undefined)? ((!options.hasOwnProperty('timeout'))? options.timeout: this.params.timeout): this.params.timeout;
        }
        return this;
}
var api_request
var args;
var Duphlux = function(args){
    this.args = args
    api_request = new Api_Request(args);
}

Duphlux.prototype.verifyNumber = function(userNumber, txnRef, redirectUrl, options){
        let endpoint = "authe/verify.json";
        let timeout = api_request.getTimeout(options);
        let data = {
                    phone_number: userNumber,
                    transaction_reference: txnRef,
                    timeout: timeout,
                    redirect_url: redirectUrl
        }
        if(options !== undefined){
            data = Object.assign({},data,{
                    name:  options.user_name,
                    email_address: options.email})
        }
        return new Promise( function(resolve, reject){
                api_request.sendRequest(endpoint, data).then(function(body){ resolve(JSON.parse(body).PayLoad)}, function(e){ reject(e)});
        });
    }

Duphlux.prototype.generateRef = function(){
        var aesEncrypt = CryptoJS.AES.encrypt("123456", "key");
        return aesEncrypt.toString();
}

Duphlux.prototype.checkStatus = function(transaction_reference){
    let endpoint = "authe/status.json";
    let data = {"transaction_reference":transaction_reference}
    return new Promise( function(resolve, reject){
                api_request.sendRequest(endpoint, data).then(function(body){ resolve(JSON.parse(body).PayLoad)}, function(e){ reject(e)});
    });
}

module.exports = exports = Duphlux;
