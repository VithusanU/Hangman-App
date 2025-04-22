var fs = require('fs');
var vm = require('vm');
var path = 'js/main-game.js';

var code = fs.readFileSync(path);
vm.runInThisContext(code);

var should = require('chai').should();