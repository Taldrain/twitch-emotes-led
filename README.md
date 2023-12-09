# Twitch Emotes LED

Display emotes from a twitch channel on a RGB LED matrix.

Connect to a Twitch channel. Retrieve the most used emotes each X seconds and
display this emotes on the connected RGB matrix.

## Features

- Emotes from Twitch, BTTV, FFZ and 7TV
- Zero-width emotes are skipped
- Support animated emotes

![demo](./assets/demo.webm)

## Setup

Using a compatible LED matrix, clone the repository and install the
dependencies via `npm install`.

Clone the https://github.com/hzeller/rpi-rgb-led-matrix repository, and build
the `utils/` folder
(https://github.com/hzeller/rpi-rgb-led-matrix/tree/master/utils). The image
viewer, `led-image-viewer`, should be working.

In this project run `sudo npx tsx src/index -b <path-to-image-viewer> -c
<twitch-channel>` [^1]

Other options are available, see `npx tsx src/index -h`.

[^1]: The `rpi-rgb-led-matrix` project needs root access

## Cache

When running, emotes will be cached to `$XDG_CACHE_HOME/twitch-emotes-led`,
resolving by default to `~/.cache/twitch-emotes-led/`. You can delete the folder
if needed. Since the project is likely to be run as root, it will use the home
of the root user.

## Hardware

- [https://www.adafruit.com/product/607](Adafruit 32x32 RGB matrix)
- [https://learn.adafruit.com/adafruit-rgb-matrix-plus-real-time-clock-hat-for-raspberry-pi](Adafruit RGB matrix documentation)
