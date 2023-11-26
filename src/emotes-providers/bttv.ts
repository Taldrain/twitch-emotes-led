import { fetchJson } from "../utils/fetch";
import EmotesProvider, { Emote, EmotesSet } from "./emotes-provider";

const BASE_URL = `https://api.betterttv.net/3/cached`;
const CHANNEL_URL = `${BASE_URL}/users/twitch`;
const GLOBAL_URL = `${BASE_URL}/emotes/global`;

const EMOTE_URL = 'https://cdn.betterttv.net/emote/'

interface BTTVEmote {
  id: string,
  code: string,
  imageType: 'png' | 'gif',
}

class BTTV extends EmotesProvider {
  async fetchGlobalEmotes(): Promise<EmotesSet> {
    return this.emotesToSet(await fetchJson<BTTVEmote[]>(GLOBAL_URL));
  }

  async fetchChannelEmotes(): Promise<EmotesSet> {
    const data = await fetchJson<{ channelEmotes: BTTVEmote[], sharedEmotes: BTTVEmote[], message?: string }>(`${CHANNEL_URL}/${super.channelId}`);

    if (data.message === 'user not found') {
      return {};
    }

    return this.emotesToSet([...data.channelEmotes, ...data.sharedEmotes]);
  }

  private emotesToSet(emotes: BTTVEmote[]): EmotesSet {
    return Object.fromEntries(emotes.map(i => [i.code, this.convertEmote(i)]));
  }

  private convertEmote(emote: BTTVEmote): Emote {
    return {
      id: emote.id,
      code: emote.code,
      animated: emote.imageType === 'gif',
      provider: 'bttv',
      url: `${EMOTE_URL}${emote.id}/3x`,
    }
  }
}

export default BTTV;
