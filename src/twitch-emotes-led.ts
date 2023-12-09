import { ChildProcess, spawn } from 'node:child_process';
import { PrivmsgMessage } from '@kararty/dank-twitch-irc';

import { EmoteMsg, EmotesSet } from './emotes-providers/emotes-provider.ts';
import BTTV from './emotes-providers/bttv.ts';
import FFZ from './emotes-providers/ffz.ts';
import Twitch from './emotes-providers/twitch.ts';
import twitchChat from './twitch-chat.ts';
import SevenTV from './emotes-providers/seventv.ts';
import EmotesCache from './emotes-cache.ts';

class TwitchEmotesLed {
  private emotesSets: EmotesSet[] = [];
  private msgs: PrivmsgMessage[] = [];
  private emotesCache = new EmotesCache();
  private previousEmote: EmoteMsg | null = null;
  private childProcess: ChildProcess | null = null;
  private ledImageViewerPath: string;
  private ledConfig;

  constructor(
    ledImageViewerPath: string,
    ledBrightness: number = 50,
    ledMapping: string = 'adafruit-hat',
    ledPixelMapper: string = 'Rotate:180',
  ) {
    this.ledImageViewerPath = ledImageViewerPath;
    this.ledConfig = {
      ledBrightness,
      ledMapping,
      ledPixelMapper,
    };

    setInterval(() => this.processMsgs(), 1000)
  }

  async connect(channel: string) {
    await this.emotesCache.init();

    console.log(`Connecting to ${channel}...`);
    const channelId = await twitchChat.join(channel);

    const BTTVProvider = new BTTV(channelId, channel);
    const FFZProvider = new FFZ(channelId, channel);
    const SevenTVProvider = new SevenTV(channelId, channel);

    this.emotesSets = [
      await BTTVProvider.getChannelEmotes(),
      await FFZProvider.getChannelEmotes(),
      await SevenTVProvider.getChannelEmotes(),

      await BTTVProvider.getGlobalEmotes(),
      await FFZProvider.getGlobalEmotes(),
      await SevenTVProvider.getGlobalEmotes(),
    ];

    twitchChat.onMsg((msg: PrivmsgMessage) => this.msgs.push(msg));
  }

  private async processMsgs() {
    const msgs = [...this.msgs];
    this.msgs = [];

    // start by twitch emotes
    // they are automatically parsed by dank-twitch-irc
    const emotes = Twitch.parseTwitchMessages(msgs);

    // split all messages into words
    let words = msgs.map(msg => msg.messageText.split(' ')).flat();

    this.emotesSets.forEach(emotesSet => {
      // for each emote sets, we track the emote founds
      const emotesFound: { [index: string]: EmoteMsg } = {};
      // and the words that are not emotes
      const filteredWords: string[] = [];

      words.forEach(word => {
        // for each word, we check if it's an emote
        if (!(word in emotesSet)) {
          // if the word is not an emote, we add it to the filtered words
          // for the next emote set
          filteredWords.push(word);
          return;
        }

        const emote = emotesFound[word];
        // test if we already seen this emote, in the current emote set
        if (emote === undefined) {
          // if not, we add it to the emotes found, of the current emote set
          emotesFound[word] = { ...emotesSet[word], counter: 1 };
        } else {
          // if yes, we increment the counter
          emotesFound[word].counter += 1;
        }
      });

      // append the new emotes found
      emotes.push(...Object.values(emotesFound));
      // the filtered words (words that are not emotes part of the current
      // emote set) are used for the next emote set
      words = filteredWords;
    });

    if (emotes.length === 0) {
      return;
    };

    const mostUsedEmote = emotes.reduce((acc: EmoteMsg, cur: EmoteMsg) => {
      if (cur.counter > acc.counter) {
        return cur;
      }

      return acc;
    });

    this.display(mostUsedEmote);
  }

  private async display(emote: EmoteMsg) {
    console.log(`displaying emote: ${emote.code} [${emote.counter}]`);

    if (this.previousEmote && emote.code === this.previousEmote.code) {
      return;
    }

    const emoteFilePath = await this.emotesCache.getEmotePath(emote);
    if (this.childProcess) {
      this.childProcess.kill('SIGINT');
    }
    this.childProcess = spawn(this.ledImageViewerPath, [
      `--led-gpio-mapping=${this.ledConfig.ledMapping}`,
      `--led-pixel-mapper=${this.ledConfig.ledPixelMapper}`,
      `--led-brightness=${this.ledConfig.ledBrightness}`,
      emoteFilePath,
    ]);

    this.previousEmote = emote;
  }
}

export default TwitchEmotesLed;
