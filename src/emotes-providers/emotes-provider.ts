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

interface EmotesSet {
  [index: string]: Emote,
}

abstract class EmotesProvider {
  private _globalEmotes: EmotesSet | undefined = undefined;
  private _channelEmotes: EmotesSet | undefined = undefined;

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

  protected get channel(): string {
    return this._channel;
  }

  protected get channelId(): string {
    return this._channelId;
  }
}

export { Emote, EmoteMsg, EmotesSet };
export default EmotesProvider;
