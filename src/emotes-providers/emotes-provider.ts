import { fetchBuffer } from '../utils/fetch';
import { transformImg } from '../utils/img';

interface Emote {
  id: string;
  code: string;
  animated: boolean;
  provider: 'twitch' | 'bttv' | 'ffz' | '7tv';
  url: string;
}

interface EmoteMsg extends Emote {
  counter: number;
}

// interface EmotesBuffer {
//   [index: string]: Buffer,
// }

interface EmotesSet {
  [index: string]: Emote,
}

abstract class EmotesProvider {
  // protected emotes: EmotesSet = {};
  private _globalEmotes: EmotesSet | undefined = undefined;
  private _channelEmotes: EmotesSet | undefined = undefined;

  // private emotesCache: EmotesBuffer = {}

  private _channel: string;
  private _channelId: string;

  constructor(channelId: string, channel: string) {
    this._channel = channel;
    this._channelId = channelId;
  }


  public async getGlobalEmotes(): Promise<EmotesSet> {
    if (this._globalEmotes === undefined) {
      this._globalEmotes = await this.fetchGlobalEmotes();
    }

    return this._globalEmotes || {};
  }

  public async getChannelEmotes(): Promise<EmotesSet> {
    if (this._channelEmotes === undefined) {
      this._channelEmotes = await this.fetchChannelEmotes();
    }

    return this._channelEmotes || {};
  }

  protected abstract fetchGlobalEmotes(): Promise<EmotesSet>;
  protected abstract fetchChannelEmotes(): Promise<EmotesSet>;

  // protected addEmotes(emotes: EmotesSet): void {

  // public async fetchEmote(emote: Emote): Promise<Buffer> {
  //   if (!(emote.code in this.emotesCache)) {
  //     const emoteBuffer = await fetchBuffer(emote.url);
  //     this.emotesCache[emote.code] = await transformImg(emoteBuffer);
  //   }
  //
  //   return this.emotesCache[emote.code];
  // }

  // from a message, splitted into words, return the new list of emotes found
  // public parseMsg(words: string[]): { words: string[], emotes: { [index: string]: EmoteMsg } } {
  //   return words.reduce((acc: { words: string[], emotes: { [index: string]: EmoteMsg } }, word: string) => {
  //     // check if the current message is an emote
  //     if (!(word in this.emotes)) {
  //       // not an emote
  //       // we keep the word to be processed by other emotes providers
  //       acc.words.push(word);
  //       return acc;
  //     }
  //
  //     // try to see if we've already seen the same emote
  //     const emote = acc.emotes[word];
  //     if (emote === undefined) {
  //       // create the EmoteMsg
  //       acc.emotes[word] = { ...this.emotes[word], counter: 1 };
  //     } else {
  //       // we've already seen the emote, we increment the counter
  //       acc.emotes[word].counter += 1;
  //     }
  //
  //     return acc;
  //   }, { words: [], emotes: {} });
  // }

  protected get channel(): string {
    return this._channel;
  }

  protected get channelId(): string {
    return this._channelId;
  }
}

export { Emote, EmoteMsg, EmotesSet };
export default EmotesProvider;
