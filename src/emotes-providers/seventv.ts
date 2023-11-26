import { fetchJson } from "../utils/fetch";
import EmotesProvider, { Emote, EmotesSet } from "./emotes-provider";

const BASE_URL = 'https://7tv.io/v3';
const EMOTE_SETS_URL = `${BASE_URL}/emote-sets`;
const CHANNEL_URL = `${BASE_URL}/users/twitch`;

const EMOTE_URL = `https://cdn.7tv.app/emote`;

interface SevenTVEmote {
  id: string,
  name: string,
  flags: number,
  data: {
    animated: boolean,
  },
}

class SevenTV extends EmotesProvider {
  async fetchGlobalEmotes(): Promise<EmotesSet> {
    const { emotes } = await fetchJson<{ emotes: SevenTVEmote[] }>(`${EMOTE_SETS_URL}/62cdd34e72a832540de95857`);

    return this.emotesToSet(emotes);
  }

  async fetchChannelEmotes(): Promise<EmotesSet> {
    const data = await fetchJson<{ emote_set: { emotes: SevenTVEmote[] }, status_code?: number }>(`${CHANNEL_URL}/${super.channelId}`);

    if (data.status_code === 404) {
      return {};
    }

    return this.emotesToSet(data.emote_set.emotes);
  }

  private emotesToSet(emotes: SevenTVEmote[]): EmotesSet {
    return Object.fromEntries(emotes
      // remove zero-width emotes
      .filter(i => (i.flags & 1) === 0)
      .map(i => [i.name, this.convertEmote(i)]));
  }

  private convertEmote(emote: SevenTVEmote): Emote {
    return {
      id: emote.id,
      code: emote.name,
      animated: emote.data.animated,
      provider: '7tv',
      url: `${EMOTE_URL}${emote.id}/4x_static.webp`,
    }
  }
}

export default SevenTV;
