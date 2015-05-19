![soundbeard logo](https://raw.githubusercontent.com/jlis/soundbeard/master/logo.png)

Soundbeard - A simple REST based soundboard in nodeJS.

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

To use **text to speech** you have to be on MacOSX or [install the Festival TTS engine](http://elinux.org/RPi_Text_to_Speech_%28Speech_Synthesis%29#Festival_Text_to_Speech)


### Get started
Create a **config/default.json** config file from the sample config and adjust the properties as you like.
For example the *host* and *port* properties hold the information which ip and port the server binds himself to. The *sounds* property is the location for the sound files.

After doing that, simply start the server by running:

```sh
$ npm start
```


### The board itself
[GET]  **/**

### List all available snippets
[GET]  **/list**

Sample response:
```javascript
{
    "foo.mp3": "http://127.0.0.1:8080/play/foo.mp3",
    "bar.wav": "http://127.0.0.1:8080/play/bar.wav"
}
```

### Play a snippet
[GET] **/play/:snippet** *(:snippet equals the filename i.e. /play/foo.mp3)*

Sample response:
```javascript
{"playing":"foo.mp3"}
```

### Stop playback
[GET] **/stop**

### Text to speech
[POST] **/say/** (also works with */whisper*)

Post data example:
```
text=hello
```

Sample response:
```javascript
{"speaking":"hello"}
```

### Help
[GET]  **/help.html**

### License

MIT

### Thanks

The bearded cat icon is made with love by [Denis Sazhin](http://iconka.com/)