# Purpose

This repo contains code whose purpose is to take all of the levels you have favorited in your PC's beat saber and add those to your BeastSaber bookmarks.

## Secrets

- Put just your beastsaber username into the file ./secret/beast_saber_username
- Put just your beastsaber password into the file ./secret/beast_saber_password
- Put just the beat saber directory where the custom songs are installed into the file ./secret/beat_saber_dir

## To use

- Make sure Node and NPM are installed
- Install packages with npm (or pnpm if you are cool):

```bash
npm install
```

- Run script with command:

```bash
npx ts-node .\script.ts
```

And as long as all your information is correct, the beast saber api should add all of your favorited levels within beat saber to the bookmarks for your beast saber account.