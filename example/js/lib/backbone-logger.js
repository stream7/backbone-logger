//     backbone-logger.js 0.0.1
//     (c) 2012 Nikos Gereoudakis
//     https://github.com/stream7/backbone-logger
//     Logger for Backbone.js by Jeremy Ashkenas, DocumentCloud Inc. http://backbonejs.org

(function() {
  'use strict';

  // for IE < 9, from http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
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
      this.descendants = [];
      this.forbiddenProperties = Object.keys(Backbone.Model.prototype);
      this.forbiddenProperties = this.forbiddenProperties.concat(Object.keys(Backbone.View.prototype));
      this.forbiddenProperties = this.forbiddenProperties.concat(Object.keys(Backbone.Collection.prototype));
      this.forbiddenProperties = this.forbiddenProperties.concat(Object.keys(Backbone.Router.prototype));
      this.forbiddenProperties = this.forbiddenProperties.concat(['template', 'comparator', 'initialize', 'constructor', 'model']);
      this.findDescendants(namespace);
      this.attachLogging();
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
        if (typeof nextNameSpace === 'object') {
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

        Backbone.Logger.store[id] = descendant.prototype[property];

        descendant.prototype[property] = function() {
          if (console && console.log) {
            console.log(id, this, arguments);
          }
          return Backbone.Logger.store[id].apply(this, arguments);
        };
      }
    };

    Logger.prototype.attachLogging = function() {
      var descendant, i, len;
      for (i = 0, len = this.descendants.length; i < len; i++) {
        descendant = this.descendants[i];
        this.processDescendant(descendant);
      }
    };

    Logger.store = {};

    Logger.VERSION = '0.0.1';

    return Logger;

  })();

}).call(this);