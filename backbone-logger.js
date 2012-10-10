//     backbone-logger.js 0.0.1
//     Logger for Backbone.js (c) 2012 Nikos Gereoudakis
//     https://github.com/stream7/backbone-logger
//     Backbone.js by Jeremy Ashkenas, DocumentCloud Inc. http://backbonejs.org

(function() {
  'use strict';

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
      return _.indexOf(this.forbiddenProperties, property) !== -1
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
        var i, len;
        for (i = 0, len = this.descendants.length; i < len; i++) {
          this.processDescendant(this.descendants[i]);
        }
      } else {
        if (console && console.log) console.log('Backbone.Logger: Provide a namespace for your app');
      }
    };

    Logger.VERSION = '0.0.1';

    return Logger;

  })();


}).call(this);