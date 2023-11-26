import { ChatClient, PrivmsgMessage, RoomstateMessage } from '@kararty/dank-twitch-irc';

class TwitchChat {
  private client: ChatClient;

  private channel = '';
  private channelId = '';

  constructor() {
    this.client = new ChatClient();
    this.client.connect();
  }

  async join(channel: string): Promise<string> {
    if (this.channel !== '') {
      await this.client.part(this.channel);
    }

    this.channel = channel;
    return new Promise((resolve) => {
      this.client.once('ROOMSTATE', (msg: RoomstateMessage) => {
        this.channelId = msg.channelID;
        return resolve(this.channelId);
      });

      this.client.join(channel);
    });
  }

  onMsg(callback: (msg: PrivmsgMessage) => void) {
    this.client.on('PRIVMSG', callback);

    return () => this.client.removeListener('PRIVMSG', callback);
  }
}

export default new TwitchChat();
