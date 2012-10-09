//     backbone-logger.js 0.0.1
//     Logger for Backbone.js (c) 2012 Nikos Gereoudakis
//     https://github.com/stream7/backbone-logger
//     Backbone.js by Jeremy Ashkenas, DocumentCloud Inc. http://backbonejs.org

(function() {
  'use strict';

  if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that) {
      for (var i= 0, n= this.length; i<n; i++)
        if (i in this)
          action.call(that, this[i], i, this);
    };
  }

  if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
  }

  Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
        DontEnums = [ 
            'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
            'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
        ],
        DontEnumsLength = DontEnums.length;

    return function (o) {
        if (typeof o != "object" && typeof o != "function" || o === null)
            throw new TypeError("Object.keys called on a non-object");

        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }

        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }   
        }

        return result;
    };
  })();

  Backbone.Logger = (function() {

    function Logger(namespace) {
      this.namespace = namespace
      this.descendants = [];
      this.forbiddenProperties = ['model', 'comparator'];      
    }

    Logger.prototype.findDescendants = function(namespace) {
      var property, nextNameSpace;
      for (property in namespace) {
        if (namespace[property] && typeof(namespace[property].__super__) === 'object' && !this.isForbiddenProperty(property)) {
          namespace[property].__loggerName__ = property;
          this.descendants.push(namespace[property]);
        }
      }
      
      for (property in namespace) {
        nextNameSpace = namespace[property];
        if (typeof(nextNameSpace) === 'object') {
          this.findDescendants(nextNameSpace);
        }
      }
    };

    Logger.prototype.isForbiddenProperty = function(property) {
      return this.forbiddenProperties.indexOf(property) !== -1
    };

    Logger.prototype.processDescendant = function(descendant) {
      var property;
      for (property in descendant.prototype) {
        if (!this.isForbiddenProperty(property)) this.processProperty(descendant, property);
      }
    };

    Logger.prototype.processProperty = function(descendant, property) {
      if (descendant.prototype.hasOwnProperty(property) && typeof descendant.prototype[property] === 'function') {
        var id = descendant['__loggerName__'] + "#" + property;

        var original = descendant.prototype[property];

        descendant.prototype[property] = function() {
          if (console && console.log) {
            console.log(id, this, arguments);
          }
          return original.apply(this, arguments);
        };
      }
    };

    Logger.prototype.enable = function() {
      if (this.namespace) {
        this.findDescendants(this.namespace);
        var descendant, i, len;
        for (i = 0, len = this.descendants.length; i < len; i++) {
          descendant = this.descendants[i];
          this.processDescendant(descendant);
        }
      } else {
        this.enableWithoutNamespace();
      }
    };

    // works only with Coffeescript
    Logger.prototype.enableWithoutNamespace = function() {
      ['Model', 'View', 'Router', 'Collection'].forEach(function(object){

        var original = Backbone[object].prototype.constructor;
        Backbone[object].prototype.constructor = function(){

          var that = this;
          Object.keys(this).forEach(function(property){
            if (typeof(that[property]) === 'function') {
              var old = that[property];
              that[property] = function(){
                if (console && console.log) console.log(that, property, arguments);
                old.apply(that, arguments);
              }
            }
          });

          if (console && console.log) console.log(this, 'constructor', arguments);
          return original.apply(this, arguments)
        };
      });
    };

    Logger.VERSION = '0.0.1';

    return Logger;

  })();


}).call(this);