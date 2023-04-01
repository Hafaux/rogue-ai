"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("@trpc/server");
var t = server_1.initTRPC.create();
var appRouter = t.router({
    getNarration: t.procedure
        .query(function (data) {
        console.log(data);
        return "hello " + data;
    })
});
