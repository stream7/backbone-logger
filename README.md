# backbone-logger.js

Backbone logger adds some built-in logging to backbone for debugging purposes.

It is meant to be used only in development in order to avoid the pollution of the source code 
with `MyCustomLogger.log` calls.

It logs to the console the "name" of the current executed function (e.g `TodoView#addTodo`) along with the value of `this` and the `arguments` passed to the function.

## Installation
Include the script after backbone.

    <script src="backbone.js"></script>
    <script src="backbone-logger.js"></script>

## Usage
Backbone logger requires your app to be namespaced under an object. 
e.g.

      var App = {};
      App.Todo = Backbone.Model.extend({ ...

After you have included everything and before you start instantiating Backbone objects include this line to enable Logger.
  
    new Backbone.Logger(App).enable();

## Example

In the repository you will find the classic TODO example from [addyosmani/todomvc](https://github.com/addyosmani/todomvc) with the Backbone Logger enabled.

The following is a sample of the console output. Of course you can inspect the objects in the console.

    AppView#addAll d [d, Object
    AppView#createOnEnter d [f.Event]
    AppView#newAttributes d []  
    AppView#addOne d [d, d, Object]  
    TodoView#toggleVisible d [] 
    TodoView#isHidden d [] 
    AppView#statsTemplate d [Object] 
    TodoView#togglecompleted d [f.Event] 
    Todo#toggle d [] 

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Related projects

[backbone.js](https://github.com/documentcloud/backbone)

[backbone.debug](https://github.com/aterris/backbone.debug)