import { join } from 'node:path';
import { tmpdir } from 'node:os'
import { writeFile, mkdir, access, constants } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { xdgCache } from 'xdg-basedir';

import { EmoteMsg } from './emotes-providers/emotes-provider.ts';
import { fetchBuffer } from './utils/fetch.ts';

class EmotesCache {
  private folder = join(xdgCache || tmpdir(), 'twitch-emotes-led');

  public async init() {
    return mkdir(this.folder, { recursive: true });
  }

  private async saveEmote(emote: EmoteMsg, filepath: string) {
    const buffer = await fetchBuffer(emote.url);
    return writeFile(filepath, buffer);
  }

  private async localFileExists(filepath: string): Promise<boolean> {
    try {
      await access(filepath, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  private getFilename(emote: EmoteMsg): string {
    const hash = createHash('sha256');
    hash.update(emote.url);
    return hash.digest('hex');
  }

  public async getEmotePath(emote: EmoteMsg): Promise<string> {
    const filename = this.getFilename(emote);
    const filepath = join(this.folder, filename);
    const fileExists = await this.localFileExists(filepath);
    if (!fileExists) {
      await this.saveEmote(emote, filepath);
    }

    return filepath;
  }
}

export default EmotesCache;
