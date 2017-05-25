# Kendo UI for Angular: Localized Messages

* [Overview](https://github.com/telerik/kendo-angular-messages#overview)
* [Basic Usage](https://github.com/telerik/kendo-angular-messages#basic-usage)
* [Installation](https://github.com/telerik/kendo-angular-messages#installation)
* [Building](https://github.com/telerik/kendo-angular-messages#building)

## Overview

This repository contains translated messages for Kendo UI components for Angular.

It also includes a utility to populate these messages in application message files in an XLIFF format. For more details, refer to the article on [localization of messages](http://www.telerik.com/kendo-angular-ui/compontents/localization).

## Basic Usage

The `kendo-translate` script looks up translations for the specified locale and the package, and populates them in the specified XLIFF (`.xlf`) file.

```
kendo-translate <file> --locale <locale-id> [--force]
```

* `file`&mdash;The path to the `.xlf` message file.
* `--locale`, `-l`&mdash;The locale ID string. For example, `es-ES`.
* `--force`, `-f`&mdash;If set, it overwrites the existing translations (`<target>` elements).

## Installation

The `@progress/kendo-angular-messages` package is available as a scoped registry. To set up access to the registry, follow the instructions in the article on [getting started](http://www.telerik.com/kendo-angular-ui/getting-started/).

```
npm install @progress/kendo-angular-messages
```

## Build

To build the package from this repository, run the `npm pack` command.
