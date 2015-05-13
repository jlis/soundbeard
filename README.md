# soundbeard :{
A simple REST based soundboard in Node.js.

----

### Installation

To download all dependencies just run:

```sh
$ npm install
```

##### Requirements
Due to the usage of *node-mplayer* you have to install the **MPlayer CLI**. For further information look here:

* [Install on Ubuntu](http://www.debianadmin.com/install-mplayer-ubuntu.html) 
* [Install on OSX via Homebrew](https://github.com/donmelton/MPlayerShell) 
*  [Install on Raspberry PI](https://rasspberrypi.wordpress.com/2012/09/02/audio-and-video-playback-on-raspberry-pi/)


### Get started
Start the server by running:

```sh
$ npm start
```
If you like to change the IP adress or the port the server binds himself to, take a look at the *host* and *port* properties in the  **config/default.json** file.

To change the location fo the sound files, just change the path in the *sounds* property in the **config/default.json** file.

### The board itself
[GET]  **/**

### List all available snippets
[GET]  **/list**

Sample Response:
```javascript
{
    "foo.mp3": "http://127.0.0.1:8080/play/foo.mp3",
    "bar.wav": "http://127.0.0.1:8080/play/bar.wav"
}
```

### Play a snippet
[GET] **/play/:snippet** *(:snippet equals the filename i.e. /play/foo.mp3)*

Sample Response:
```javascript
{"playing":"foo.mp3"}
```

### Stop playback
[GET] **/stop**

### Help
[GET]  **/help**

### License

MIT