# Kendo UI for Angular Localized Messages

This repository contains translated messages for Kendo UI for Angular components. It also includes an utility to populate these messages in application message files in the XLIFF format.

See the [Localizing Messages](www.telerik.com/kendo-angular-ui/compontents/localization) help topic for more details.

## Installation

The `@progress/kendo-angular-messages` package is available as a scoped registry. Follow the instructions in the [Getting Started](http://www.telerik.com/kendo-angular-ui/getting-started/) help topic on how to set up access to the registry.

```
npm install @progress/kendo-angular-messages
```

## Usage

The `kendo-translate` script will look-up translations for the specified locale and this package and populate them in the specified XLIFF (.xlf) file.

```
kendo-translate --messages-file <path> --locale <locale-id> [--force]
```

* `--messages-file`, `-m` the path to the .xlf messages file
* `--locale`, `-l` the locale ID string, e.g. `es-ES`
* `--force`, `-f` if set will overwrite existing translations (`<target>` elemements)

## Building

You can build the package from this repository by running `npm pack`.
