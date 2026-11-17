# Traducteur (Translator)

Translates text between 16 languages as you type, with automatic detection of the source language. It uses the MyMemory service, free and with no account.

*Version française : [README.md](README.md)*

## Phone version

Made for phones: both text boxes (your text and the translation) fit on screen together, with the swap-languages button between them and full-width language lists.

## Usage

- Type or paste text on the left: the translation appears on the right 0.7 seconds after your last keystroke. The character count is shown under the text.
- **From**: a language, or **Detect** (the default); the language found is then shown ("Detected language: Spanish").
- **To**: the target language (English by default). Changing either one runs the translation again.
- **⇄ Swap languages** exchanges the two languages and puts the translation in place of the source text, to translate back the other way.
- **Copy** puts the translation on the clipboard.

Languages: French, English, Spanish, German, Italian, Portuguese, Dutch, Japanese, Korean, Chinese, Russian, Arabic, Polish, Turkish, Swedish and Ukrainian.

## How it works

Long texts are split into pieces of about 450 characters, at sentence ends, then translated piece by piece and joined back together. MyMemory allows about 5,000 characters a day without an account; beyond that, the plugin shows the error returned by the service.

The text to translate is sent to MyMemory (api.mymemory.translated.net), the only site the plugin is allowed to contact.

## Data and sync

Nothing is stored or synced: the text and its translation only stay on screen.

## Install

In NeoDex: **NeoStore → Discover → Traducteur → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
