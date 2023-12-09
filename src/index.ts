import { Command, Option } from 'commander';

import TwitchEmotesLed from './twitch-emotes-led.ts';

const program = new Command();

program
  .requiredOption('-b, --image-viewer-binary <path>', 'path to image viewer binary')
  .option('--gpio-mapping <value>', 'gpio mapping')
  .addOption(new Option('--brightness <value>', 'brightness').argParser(v => parseInt(v, 10)))
  .option('--pixel-mapper <value>', 'pixel mapper')
  .requiredOption('-c, --channel <value>', 'Twitch channel')

program.parse(process.argv);
const options = program.opts();

new TwitchEmotesLed(
  options.imageViewerBinary,
  options.brightness,
  options.gpioMapping,
  options.pixelMapper,
).connect(options.channel);
