# soundbeard :{
A simple REST based soundboard in Node.js.

----

### Installation

To download all dependencies just run:

```sh
$ npm install
```

### Get started
Start the server by running:

```sh
$ npm start
```
If you like to change the IP adress or the port the server binds himself to, take a look at the *host* and *port* properties in the  **config/default.json** file.

To change the location fo the sound files, just change the path in the *sounds* property in the **config/default.json** file.

###List all available snippets
[GET]**  **/list**

Sample Response:
```javascript
['foo.mp3', 'bar.wav']
```

###Play a snippet
[GET] **/play/:snippet** *(:snippet equals the filename i.e. /play/foo.mp3)*

Sample Response:
```javascript
{"playing":"foo.mp3"}
```

###Stop playback
[GET] **/stop**

### License

MIT