'use strict';

angular.module('basic').factory('CExpfunction', function() {

  class CExpfunction {

    constructor(datafromrest) {
      this.rawdata = datafromrest;
      this.functions = [];
      for (let namespace in this.rawdata) {
        for (let fun of this.rawdata[namespace]) {
          this.functions.push({name: `${namespace}:${fun.name}`, desc: fun.description, return: fun.return_type, args: fun.args});
        }
      }
    }

    formatfunction(funname, funargs) {
      return `${funname}(${funargs})`;
    }

    descfunction(name, hightlightindex) {
      let desc = `Cannot find function ${name}`;
      this.functions.map(func => {
        if (func.name === name) {
          desc = `<h5>Name</h5><p style="color: grey">${func.name}</p>
                  <h5>Arguments</h5>`;
          if (func.args.length) {
            let argdescs = [];
            for (let i=0; i<func.args.length; i++) {
              let arg = func.args[i];
              if (i === hightlightindex) {
                argdescs.push(`<li style="color: deepskyblue">${arg.name}( ${arg.type} ): ${arg.description}</li>`);
              } else {
                argdescs.push(`<li style="color: grey">${arg.name}( ${arg.type} ): ${arg.description}</li>`);
              }
            }
            desc = desc + `<ul>${argdescs.join('')}</ul><h5>Description</h5><p style="color: grey">${func.desc}</p>`;
          } else {
            desc = desc + `<p style="color: grey">NULL</p><h5>Description</h5><p style="color: grey">${func.desc}</p>`;
          }
        }
      });
      return desc;
    }

    checkarguments(name, args) {
      let flag = false;
      this.functions.map(func => {
        if (func.name === name) {
          if (func.args.length === 0 && args.length === 0) {
            flag = true;
          } else if (func.args.length > 0 && args.split(',').length === func.args.length) {
            flag = true;
            args.split(',').map(arg => {
              if (arg.length === 0) {
                flag = false;
              }
            });
          }
        }
      });
      return flag;
    }
  }

  return CExpfunction; 
});