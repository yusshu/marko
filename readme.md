# marko
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](license.txt)
[![Discord](https://img.shields.io/discord/683899335405994062)](https://discord.gg/xbba2fy)

**marko** is a Discord bot that says random things **based** on previous messages
in the same channel it speaks on, often funny.

This bot program is made to be self-hosted by anyone, **it doesn't have an official
Discord Bot**

## Running
- Create a `.env` file using the `.env.example` template and fill it with your information
- Create `data/status.json` and `data/words.json` *(I'm too lazy to make this not required)*

```json
// status.json file should look like this:
{
  "collect": true,
  "talk": false
}

// words.json file should look like this:
[]
```
- Run `npm install` to install the dependencies
- Finally run `npm start` and let it be