<div align="center">
<img src="src/assets/c4obs.png" width="275px" style="border-radius: 50px;">

# Cider 4 OBS
### Connect your Cider Client to OBS and show what you're listening to!

![Apple Music](https://img.shields.io/badge/Apple_Music-9933CC?style=for-the-badge&logo=apple-music&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![GitHub Pages](https://img.shields.io/badge/github%20pages-121013?style=for-the-badge&logo=github&logoColor=white)

</div>

## The default player
<div align="center">
<img src="example.png" width="650px" style="border-radius: 15px;">
</div>


## Requirements
* [Open Broadcaster Software](https://obsproject.com/)
* [Cider 2.5+](https://cider.sh)
* An Apple Music subscription.

## Setup
1. Setup Cider if you haven't done so already and open the settings. Go to "Connectivity" and scroll down all the way. Enable the Switch "WebSockets API".
2. Create a new Browser Source in OBS and set the URL to [`https://jennielizz.github.io/Cider4OBS/`](https://jennielizz.github.io/Cider4OBS/).
3. Set the source size to a width of `745` and a height of `250`. Resize with the transform controls. (Warning: You can only change the width! So make it as long as you want but the height must remain at `250`.)
4. The browser in OBS will now attempt to connect to Cider every five seconds and reestablish the connection if necessary!
5. If you want to customize how the app is looking, read below. Add the options into the Custom CSS box of OBS!

### Text Customizations
Customizable elements are `span, #title, #album, #artist`.
```css
/* you can change the secondary font with: */
span {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* and the song title: */
#title {
  font-weight: bold;
  font-family: "SF Pro";
  font-stretch: expanded;
  font-size: 20px; /* Probably don't change, but its here */
}

/* artist and album: */
#artist #album {
  font-family: "Atkinson Hyperlegible";
  font-size: 30px;
}
```

### Settings
Some settings adjusting the behavior of certain elements. (These are the defaults)
```css
body {
  /* general key unless stated otherwise: 1=on, 0=off */

  /* the maximum opacity of the gradient background: 0 - 1 */
  --max-grad-opacity: 1; /* Ex: 0.85 */
  
  /* fade the box in and out depending on whether music is playing or not */
  --fade-on-stop: 1;

  /* how long playback must be paused in milliseconds until the box fades (if enabled) */
  --fade-delay: 1000;

  /* the box will fade out when Cider disconnects and appears on reconnecting */
  --fade-on-disconnect: 1;

  /* the delay in milliseconds after the player has disconnected until the box fades */
  --fade-disconnect-delay: 3000;

  /* hides the box when connection has been established but Cider is idle */
  --hide-on-idle-connect: 1;
}
```
