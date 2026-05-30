<p align="center">
  <img src="./addon/assets/banner.svg" alt="./addon/assets/icons/96.svg" width="840" height="560">
</p>

<h1 align="center">Mirsal — مرسال</h1>

# Core Browser Extension for the Noon shell.
Mirsal intercepts some of browser's protocols to the integrated tools inside "Noon" 

# Repurpose for your own use case 
- Have a look on the aur/mirsald and repurpose their call back functions on each action and their payload
- and for the method names each inside their function eg, bookmarks.sync , ~downloads.add~ , ..etc those are the called messages inside the mirsald

## Current Capabilities
- [X] Bookmarks Syncing
- [X] ~Downloads interception~
- [X] Fast Color Sync - Omit pywalfox
- [X] Page colors override - Omit DarkReader
- [X] Minimal New tab page

### For more features ideas an issue will be appreciated

## Requirements

- Mirsal requires the **noon-mirsald** to be installed on your system.

```bash
    yay -S noon-mirsald --needed
```

- Copy matugen's template from examples/firefox.json to your matugen configs.
- Add this snippet to matugen's config.toml 

``` toml 
    [templates.mirsal]
    input_path = '~/.config/matugen/templates/applications/firefox.json'
    output_path = '~/.cache/noon/user/generated/colors/firefox.json'
    post_hook = 'python /usr/lib/noon-mirsal/mirsald pull-palette'
```


## Privacy

Mirsal uses native messaging protocol from native firefox APIs to launch some shell ipc commands for certain action
No data is sent to any remote server 

## Links
Noon at https://github.com/pharmaracist/Noon
LibQt at https://github.com/pharmaracist/Noon-libqt
