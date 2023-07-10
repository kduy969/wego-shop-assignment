# Project summary

## Build stack
Vite + React + Typescript.

## Testing tools
Jest, Testing-library.

## Deployment tool
Gh-pages.

## Approach

### Pagination
1. Load a specific number of items on initial.
2. Automatically load new items when the user reaches the bottom of the page.
3. After taking up to a certain amount of items, stop loading new items as user scroll to bottom, instead the user need to use the pagination bar to change the page index in order to load new items.
4. User change the page index -> load new page items and replace the current items with the newly loaded items.
5. Back to step 2 until finishing loading all items.

### Search and filter
* User can filter the products show on screen in 2 ways:
  * Filter by text search.
  * Filter by category.
* Updating search filter will not affect category filter and vice-versa.
* Updating any filter will reset pagination.

### Responsiveness
Work on both mobile and laptop, you can also try to resize your window and see the change in layout.

## Setup
1. Install packages: $yarn
2. Run in development: $yarn dev
3. Deploy: $yarn build && $yarn deploy
