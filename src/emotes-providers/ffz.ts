import { fetchJson } from '../utils/fetch.ts';
import EmotesProvider, { Emote, EmotesSet } from './emotes-provider.ts';

const BASE_URL = 'https://api.frankerfacez.com/v1';
const CHANNEL_URL = `${BASE_URL}/room`;
const GLOBAL_URL = `${BASE_URL}/set/global`;

interface FFZEmote {
  id: number,
  name: string,
  modifier: boolean,
  urls: {
    [index: number]: string,
  },
}

interface FFZSets {
  sets: {
    emoticons: FFZEmote[],
  }[],
  status?: number,
}

class FFZ extends EmotesProvider {
  async fetchGlobalEmotes(): Promise<EmotesSet> {
    return this.toEmotesSet(await fetchJson<FFZSets>(GLOBAL_URL));
  }

  async fetchChannelEmotes(): Promise<EmotesSet> {
    return this.toEmotesSet(await fetchJson<FFZSets>(`${CHANNEL_URL}/${super.channel}`));
  }

  private toEmotesSet(data: FFZSets): EmotesSet {
    if (data.status === 404) {
      return {};
    }

    return Object.fromEntries(
      Object.values(data.sets)
        .map(i => i.emoticons)
        .flat()
        // remove modifier emotes
        .filter(i => i.modifier === false)
        .map(i => [i.name, this.convertEmote(i)])
    );
  }

  private convertEmote(emote: FFZEmote): Emote {
    return ({
      id: `${emote.id}`,
      code: emote.name,
      animated: false,
      provider: 'ffz',
      url: `https:${emote.urls[4]}`,
    });
  }
}

export default FFZ;
