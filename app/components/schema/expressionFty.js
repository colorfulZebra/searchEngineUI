'use strict';

angular.module('basic').factory('CExpression', function() {
  class CExpression {
    constructor() {
      this.items = [];
    }

    addItem({type, content}) {
      this.items.push({type, content});
    }

    deleteItem(index) {
      this.items.splice(index, 1);
    }

    formatstr() {
      let strlst = [];
      this.items.map(item => {
        if (item.type === 'CONSTANT') {
          strlst.push(`'${item.content}'`);
        } else {
          strlst.push(item.content);
        }
      });
      return strlst.join('+');
    }

    parsestr(expression, fields) {
      let variables = [];
      if (angular.isArray(fields)) {
        fields.map(f => variables.push(f.name));
      }
      if (angular.isString(expression)) {
        expression.split('+').map(item => {
          if (item[0] === '$' && item.indexOf(':') > 0 && item.indexOf('(') > 0 && item.indexOf(')') > 0) {
            this.addItem({type: 'FUNCTION', content: item});
          } else if (item[0] === '\'' && item[item.length-1] === '\'') {
            this.addItem({type: 'CONSTANT', content: item.substring(1, item.length-1)});
          } else if (variables.includes(item)) {
            this.addItem({type: 'VARIABLE', content: item});
          } else if (item.length > 0) {
            this.addItem({type: 'CUSTOMIZE', content: item});
          }
        });
      }
    }

  }

  CExpression.TYPES = ['CONSTANT', 'VARIABLE', 'FUNCTION', 'CUSTOMIZE'];

  return CExpression;
});
