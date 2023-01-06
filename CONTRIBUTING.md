# Guidelines to Contribution

> This package is distributed under a permissive [Apache License](https://github.com/telerik/kendo-angular-messages/blob/master/LICENSE.md).

We accept third-party contributions.

## Ways to Contribute

You can contribute by:

* Submitting bug-fixes.
* Proposing changes in documentation or updates to existing code.
* Adding features or missing functionalities.

## Steps to Contribute

To submit your suggestions:

1. If a first-time contributor, read and sign the [Kendo UI for Angular Contribution License Agreement (CLA)](https://goo.gl/forms/dXc1RaE8le6rVZ0h1). The Agreement confirms that you acknowledge the legal aspects of your contributions.
1. Branch out the repo you want to update.
1. Add your contribution.
1. Submit a [Pull Request](https://help.github.com/articles/creating-a-pull-request/).

### Adding Messages for a New Component

To add messages for a new component:

1. Create a new messages file in 'messages/<component>/<component>.en-US.yml'
2. Run 'npm run seed-messages <component>'
3. Commit new files from 'messages/component'

### Adding Messages to All Locales

To appends the content of a new message file to all existing locale-specific files:

1. Create a file containing the new messages.

   Start and end the file with an empty row, and provide the same indentation for the
   new messages and their descriptions as in the existing files.
2. Run 'npm run append-message <component> <path-to-the-new-file>'
3. Commit the updated files from 'messages/component'
4. Remove the file created in step 1.

## Support-Related Issues

Refer to our [**Community & Support**](http://www.telerik.com/kendo-angular-ui/support/) page for more information on:

* How to report a bug
* New upcoming features
* Support-related questions
