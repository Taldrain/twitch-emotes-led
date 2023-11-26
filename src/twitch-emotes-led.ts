import { EmoteMsg, EmotesSet } from './emotes-providers/emotes-provider';
import BTTV from './emotes-providers/bttv';
import FFZ from './emotes-providers/ffz';
import Twitch from './emotes-providers/twitch';
import twitchChat from './twitch-chat';
import { PrivmsgMessage } from '@kararty/dank-twitch-irc';
import SevenTV from './emotes-providers/seventv';

class TwitchEmotesLed {
  private emotesSets: EmotesSet[] = [];
  private msgs: PrivmsgMessage[] = [];

  constructor() {
    setInterval(() => this.processMsgs(), 3000)
  }

  async connect(channel: string) {
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

  async processMsgs() {
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

    console.log({ mostUsedEmote });
  }
}

export default TwitchEmotesLed;
