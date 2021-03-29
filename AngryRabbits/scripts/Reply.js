//Copyright (c) 2021, Ana Carolina Arellano
'use strict'


export default class Reply {
    constructor(error = 0, errMsg = "No Error") {
        this.__private__ = {
            name: "",
            bytes: 0,
            payload: {},
            error,
            errMsg
        }
    }

    set payload(value) {
        let my = this.__private__;
        my.payload = value;
    }

    ok() {
        let my = this.__private__;
        my.error = 0;
        my.errMsg = "No Error"

        return this
    } 

    error(code = 0, msg = "No Error"){
        let my = this.__private__;
        my.error = code;
        my.errMsg = msg;

        return this
    }
    serialize() {
        return JSON.stringify(this.__private__);
    }
}