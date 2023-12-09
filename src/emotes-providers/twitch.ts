import { PrivmsgMessage, TwitchEmote } from '@kararty/dank-twitch-irc';

import EmotesProvider, { Emote, EmoteMsg, EmotesSet } from './emotes-provider.ts';

const EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v2';

function convertEmote(emote: TwitchEmote): Emote {
  return ({
    id: `${emote.id}`,
    code: emote.code,
    animated: false,
    provider: 'twitch',
    url: `${EMOTE_URL}/${emote.id}/default/dark/3.0`,
  });
}

class Twitch extends EmotesProvider {
  async fetchGlobalEmotes(): Promise<EmotesSet> {
    return {};
  }

  async fetchChannelEmotes(): Promise<EmotesSet> {
    return {};
  }

  static parseTwitchMessages(msgs: PrivmsgMessage[]): EmoteMsg[] {
    return Object.values(msgs
      .map(i => i.emotes)
      .flat()
      .reduce((acc: { [index: string]: EmoteMsg}, cur: TwitchEmote) => {
        const emote = acc[cur.code];
        if (emote === undefined) {
          acc[cur.code] = { ...convertEmote(cur), counter: 1 };
        } else {
          acc[cur.code].counter += 1;
        }

        return acc;
      }, {}));
  }
}

export default Twitch;
