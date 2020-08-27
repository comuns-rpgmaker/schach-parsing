"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var Parser = require("../src/parser");
function codePointToInt(codePoint) {
    return codePoint - 48;
}
var DIGITS = Array.from({ length: 10 }, function (_, i) { return i.toString(); });
var digit = Parser
    .oneOf.apply(Parser, DIGITS.map(Parser.char)).map(codePointToInt)
    .error(function (_, context) { return "expected 0-9, got '" + context + "'"; });
var integer = Parser
    .many1(digit)
    .map(function (digits) { return digits.reduce(function (acc, n) { return acc * 10 + n; }); });
var floatingPoint = Parser
    .char('.')
    .flatMap(function () { return Parser.many1(digit); })
    .map(function (digits) { return digits.reduceRight(function (acc, n) { return n + acc / 10; }) / 10; });
var number = integer
    .flatMap(function (n) { return floatingPoint.map(function (f) { return n + f; }).or(Parser.pure(n)); })
    .or(floatingPoint)
    .error(function (_, context) { return "expected number, got '" + context + "'"; });
var OPERATORS = {
    '+': function (a, b) { return a + b; },
    '-': function (a, b) { return a - b; },
    '/': function (a, b) { return a / b; },
    '*': function (a, b) { return a * b; },
    '^': Math.pow
};
var operator = Parser
    .oneOf.apply(Parser, Object.keys(OPERATORS).map(Parser.string)).map(function (op) { return OPERATORS[op]; })
    .error(function (_, context) {
    return "expected operator (" + Object.keys(OPERATORS).join(', ') + "), got '" + context + "'";
});
var spaces = Parser.many(Parser.char(' '));
var expression = function () {
    var parens = Parser
        .char('(')
        .flatMap(expression)
        .flatMap(function (value) { return Parser
        .char(')')
        .map(function () { return value; }); });
    var valueExpr = parens
        .or(number.map(function (value) { return ({ type: 'number', value: value }); }))
        .or(expression);
    return spaces
        .dropThen(valueExpr)
        .thenDrop(spaces)
        .flatMap(function (left) {
        return operator.map(function (operator) { return ({
            type: 'op',
            operator: operator,
            left: left
        }); });
    })
        .thenDrop(spaces)
        .flatMap(function (opExpr) { return valueExpr.map(function (right) { return (__assign(__assign({}, opExpr), { right: right })); }); })
        .thenDrop(spaces);
};
